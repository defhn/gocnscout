# 12. 端到端数据流

## 目标

本文件把核心业务从前端操作到数据库和第三方服务的完整路径串起来，确保开发完成后不是静态页面，而是真正前后端数据库打通。

## Flow 1: Excel 导入到公开页面

1. Admin 上传 Excel 或执行导入脚本。
2. 服务端读取工作表。
3. 字段映射：
   - 公开字段写入 `suppliers` 和 taxonomy 表。
   - 敏感字段写入 `supplier_private_fields`。
   - 禁用字段写入 `supplier_ignored_fields` 或 raw json。
4. 生成 slug。
5. 生成 taxonomy：
   - industries
   - product_keywords
   - provinces
   - cities
6. 生成搜索向量。
7. 写入 `imports` 导入批次。
8. 前台行业、产品、城市、公司页面读取数据库。
9. sitemap 根据 shouldIndex 规则包含页面。

验收：

- Excel 更新后，重新导入能影响前台统计。
- 敏感字段不会出现在页面源码、API、JSON-LD。
- 禁用字段不会出现在搜索、筛选、报告、导出。

## Flow 2: 用户搜索供应商

1. 用户访问 `/database`。
2. 前端调用 search API。
3. 服务端读取 Clerk session。
4. 服务端判断套餐和搜索限制。
5. 服务端执行 PostgreSQL full-text + `pg_trgm` 查询。
6. 服务端使用字段白名单序列化结果。
7. 前端展示结果。
8. PostHog 记录 `Search performed`。

验收：

- Free 每次最多 20 条。
- Free 不显示官网。
- 付费用户显示对应字段。
- 搜索结果没有敏感字段。

## Flow 3: 查看供应商档案

1. 用户访问 `/companies/[slug]`。
2. 服务端读取 supplier。
3. 服务端判断用户套餐。
4. Free 用户检查本月 profile view quota。
5. 成功后记录 usage。
6. 返回允许字段。
7. 前端渲染页面、breadcrumb、JSON-LD。
8. PostHog 记录 `Supplier profile viewed`。

验收：

- Free 第 6 次被拦截。
- Free 不显示官网、注册资金、参展历史、企业性质。
- 公司页 JSON-LD 不含隐藏字段。

## Flow 4: 用户保存名单

1. 用户点击 `Save to list`。
2. 前端提交 supplier id 和 list id。
3. 服务端校验登录。
4. 服务端校验套餐保存上限。
5. 写入 `saved_list_items`。
6. Dashboard `/app/lists` 读取更新。

验收：

- Starter 超过 200 个供应商保存失败。
- Team shared list 只有团队成员可见。

## Flow 5: CSV 导出

1. 用户点击 `Export CSV`。
2. 服务端校验套餐。
3. 服务端计算将导出的记录数。
4. 服务端检查月度额度。
5. 创建 `export_jobs`。
6. 后台任务读取数据。
7. 导出字段白名单序列化。
8. 生成 CSV。
9. 上传 R2。
10. 写入 `export_files`。
11. 扣减 usage。
12. 发送 Brevo 邮件。
13. Dashboard `/app/exports` 展示下载。

验收：

- CSV 字段顺序固定。
- CSV 无敏感字段。
- 导出失败不扣额度。
- 文件下载必须登录且归属用户。

## Flow 6: 订阅购买

1. 用户在 `/pricing` 点击套餐。
2. 服务端读取代码内 catalog。
3. 创建 Stripe Checkout Session。
4. 用户付款。
5. Stripe 调用 webhook。
6. webhook 校验签名。
7. webhook 幂等处理。
8. 写入或更新 `subscriptions`。
9. 更新 `usage_counters`。
10. Dashboard `/app/billing` 显示新套餐。

验收：

- 不需要 Stripe 后台产品配置。
- `price_data` currency 为 `usd`。
- 权限变化以 webhook 为准。

## Flow 7: 报告上传、购买和下载

1. Admin 进入 `/admin/reports`。
2. Admin 创建报告元数据。
3. Admin 上传 PDF。
4. 服务端上传到 R2。
5. 数据库 `reports` 写入 R2 object key、版本、价格、状态。
6. Admin 发布报告。
7. `/reports` 和 `/reports/[slug]` 显示报告。
8. 用户点击购买。
9. 服务端创建 Stripe one-time Checkout Session。
10. webhook 成功后写入 `report_purchases`。
11. Brevo 发送购买邮件。
12. `/app/reports` 显示下载。
13. 下载时服务端校验购买记录或套餐权益。
14. 服务端返回 R2 短期签名链接。

验收：

- Admin 上传后前台自动出现。
- 未购买用户不能下载。
- 已购买用户能下载最新发布版本。
- 替换 PDF 后版本更新。

## Flow 8: Custom Shortlist

1. 用户填写 Custom Shortlist 表单。
2. 用户通过 Stripe one-time Checkout 付款。
3. webhook 创建 `custom_shortlist_requests`。
4. Admin 在中文后台查看订单。
5. Admin 准备交付文件。
6. Admin 上传到 R2。
7. 系统发送 Brevo 邮件。
8. 用户在 Dashboard 下载。

验收：

- 交付文件不包含联系人、手机、邮箱。
- Admin 可以标记状态。
- 用户只能下载自己的交付文件。

## Flow 9: Data License 咨询

1. 用户访问 `/app/data-license`。
2. 用户提交咨询表单。
3. 服务端写入 `data_license_inquiries`。
4. Brevo 发送确认邮件。
5. Admin 在 `/admin/licenses` 查看。
6. Admin 标记状态。
7. 如成交，Admin 创建 Data License account。
8. Admin 上传非敏感数据文件到 R2。
9. 用户或客户通过鉴权链接下载。

验收：

- 不触发 Stripe Checkout。
- 不前台直接付款。
- 文件不包含敏感字段、禁用字段、转售权。

## Flow 10: 删除/更正请求

1. 用户访问 `/legal/data-removal`。
2. 提交公司名、官网、请求人、邮箱、请求类型、说明。
3. 服务端写入 `data_removal_requests`。
4. Brevo 发送确认邮件。
5. Admin 查看请求。
6. Admin 处理更正、隐藏或删除。
7. 写入操作日志。
8. Brevo 发送处理结果。

验收：

- 请求可在 Admin 闭环。
- 删除或隐藏后页面 noindex 或 404/410 策略一致。
- 操作日志可追踪。

## Flow 11: 敏感字段查看

1. Admin 打开展商详情。
2. 敏感字段默认隐藏。
3. Admin 点击查看。
4. 服务端校验 Admin 权限。
5. 服务端读取 `supplier_private_fields`。
6. 写入 `sensitive_field_access_logs`。
7. 前端显示敏感字段。

验收：

- 非 Admin 无法调用接口。
- 每次查看都有日志。
- 敏感字段不能被复制到公开字段、导出或报告。

## 总验收

开发完成并填入环境变量后，必须能完成：

- Excel -> Neon -> 前台 SEO 页面。
- Clerk 登录 -> Dashboard。
- Stripe Checkout -> webhook -> 本地权限。
- Admin PDF upload -> R2 -> reports table -> public report page -> purchase -> dashboard download。
- Search -> Saved List -> Export -> R2 -> download。
- Data License form -> Admin inquiry -> R2 delivery。
- Data removal form -> Admin workflow -> email notification。

