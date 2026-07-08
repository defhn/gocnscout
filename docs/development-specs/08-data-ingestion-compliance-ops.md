# 08. 数据导入、合规与运营

## 数据导入流程

1. Admin 上传 Excel。
2. 系统读取工作表。
3. Admin 确认字段映射。
4. 系统执行清洗和标准化。
5. 系统写入业务表、敏感字段表、禁用字段表。
6. 系统生成 slug。
7. 系统更新分类计数。
8. 系统更新搜索向量。
9. 系统生成导入报告。

## 清洗规则

- 行业字段只保留行业名称。
- 官网补全协议，如缺失则补 `https://`。
- 无效官网标记为不可访问，不删除原始值。
- 产品和关键词按逗号拆分并去重。
- 公司 slug 使用英文名或拼音/哈希兜底，必须唯一。
- 行业、产品、城市 slug 必须唯一。
- 空字符串统一转为 null。

## 重复公司

重复判断参考：

- 公司名完全一致
- 官网一致
- 公司名相似且城市一致

重复处理：

- 默认不自动合并。
- Admin 标记候选重复。
- Admin 手动合并。
- 合并写入操作日志。

## 合规页面

必须有：

- `/legal/privacy`
- `/legal/terms`
- `/legal/data-removal`
- `/legal/disclaimer`

站点和联系信息：

- 主站域名：`gocnscout.com`
- 支持邮箱：`gerry@gocnscout.com`

法律页面不需要写成正式律师文件，但页面必须清楚表达产品边界。后续上线前建议再由法律专业人士审阅。

法律页面不安排人工法律审核。若开发或运营遇到不确定条款、责任边界、退款规则、数据授权范围或隐私表述，必须先询问项目负责人，不能自行补充或编造。

### `/legal/privacy`

页面标题：

> Privacy Policy

必须说明：

- 收集账号信息、支付状态、使用记录、导出记录、报告购买记录。
- 使用 Clerk 处理登录。
- 使用 Stripe 处理支付。
- 使用 Brevo 发送交易邮件。
- 使用 Sentry 做错误监控。
- 使用 PostHog 做产品分析。
- 不把负责人、手机、电话、传真、邮箱作为公开产品售卖。
- 用户可以通过 `gerry@gocnscout.com` 联系删除或更正请求。

### `/legal/terms`

页面标题：

> Terms of Service

必须说明：

- 产品用于 supplier discovery and sourcing research。
- 用户不得把导出数据用于垃圾邮件、骚扰、违法营销或转售。
- Data License 不包含转售权。
- 报告和数据库不构成供应商认证、验厂或官方背书。
- 订阅、导出额度和报告权益以当前套餐页面为准。
- 所有价格和付款均使用 USD。

### `/legal/data-removal`

页面标题：

> Data Removal and Correction Requests

页面说明：

> If you represent a company listed in gocnscout, you can request profile updates, removal, or correction.

表单字段：

- Company name
- Official website
- Requester name
- Business email
- Request type
- Details

提交后文案：

> We have received your request. Our team will review it and contact you if more information is needed.

### `/legal/disclaimer`

页面标题：

> Disclaimer

必须说明：

- 数据用于供应商发现和研究。
- 不是官方广交会数据库。
- 不验证、认证或背书供应商。
- 买家必须独立验证供应商。
- 官网链接如可用，只作为公开联系路径。
- 不保证数据完整、实时或无误。

固定免责声明英文：

> gocnscout is a supplier discovery and sourcing research tool. Profiles and reports are compiled from structured exhibitor and company-related data. We do not verify, certify, audit, endorse, or guarantee any supplier. Buyers should independently verify all suppliers before making purchasing decisions.

## 删除/更正申请

表单字段：

- Company name
- Official website
- Requester name
- Business email
- Request type
- Details

Request type：

- Update profile
- Remove profile
- Hide information
- Report incorrect data

处理流程：

1. 用户提交。
2. 系统发送 Brevo 确认邮件。
3. Admin 查看请求。
4. Admin 处理并记录说明。
5. 系统发送处理结果邮件。

## 隐私和安全规则

- 敏感字段默认不查、不返回、不导出。
- Admin 查看敏感字段必须记录日志。
- R2 下载链接必须短期有效。
- Stripe webhook 必须校验签名。
- Clerk 用户角色不能只依赖前端判断。
- 所有导出必须走字段白名单。
- 法律、退款、授权、数据使用范围如未在文档中明确，必须先询问项目负责人。

## 文案和服务真实性规则

所有公开文案必须能被现有产品真实支持。

不能写：

- We verify suppliers
- Certified manufacturers
- Official Canton Fair database
- Factory audited
- Guaranteed sourcing results
- Direct contacts included
- Email list included
- Phone numbers included

可以写：

- Public-source supplier profiles
- Structured supplier data
- Supplier discovery
- Sourcing research
- Buyer verification checklist
- Official website links when available

报告、Dashboard、SEO 页面和邮件都必须遵守该规则。

## 监控和分析

Sentry 记录：

- API 错误
- 导出失败
- Stripe webhook 失败
- 数据导入失败

分析事件：

- Search performed
- Supplier profile viewed
- Pricing viewed
- Checkout started
- Subscription started
- Export requested
- Report purchased
- Data removal submitted
- Data license inquiry submitted

## 运营后台指标

Admin 首页显示：

- 总供应商数量
- 可公开供应商数量
- 本月搜索次数
- 本月导出条数
- 本月报告销售
- 本月订阅收入
- 待处理删除/更正请求
- 失败导出任务
