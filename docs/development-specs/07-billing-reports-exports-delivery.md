# 07. 支付、报告、导出与交付

## 核心原则

Stripe 不在后台手动新建产品和价格。产品、价格、权益全部在代码中维护。支付时由服务端临时创建 Stripe Checkout Session，并使用 Checkout line item 的 `price_data` 和 `product_data`。

不能在页面文案中暗示用户会获得联系人、手机号、邮箱、官方认证、验厂结果或完整广交会官方名单。

## 代码内产品配置

建议建立：

```text
src/lib/billing/catalog.ts
```

维护固定产品表：

| key | 类型 | 名称 | 金额 | 模式 |
|---|---|---|---:|---|
| `starter_monthly` | subscription | Starter | $49 | monthly |
| `starter_yearly` | subscription | Starter Annual | $490 | yearly |
| `pro_monthly` | subscription | Pro | $199 | monthly |
| `pro_yearly` | subscription | Pro Annual | $1,990 | yearly |
| `team_monthly` | subscription | Team | $499 | monthly |
| `team_yearly` | subscription | Team Annual | $4,990 | yearly |
| `report_basic` | one_time | Basic Industry PDF Report | $49 | one-time |
| `report_full` | one_time | Full Industry PDF Report | $99 | one-time |
| `report_premium` | one_time | Premium Industry PDF Report | $299 | one-time |
| `report_canton_fair` | one_time | Canton Fair Exhibitor Intelligence Report | $149 | one-time |
| `custom_shortlist` | one_time | Custom Shortlist | $399 | one-time |

实现规则：

- 价格以美分存储，例如 `$49` 存为 `4900`。
- 货币固定为 `usd`。
- 所有产品名、价格、权益从代码配置读取。
- Checkout 创建时临时传入 `price_data`。
- Stripe Session `metadata` 必须写入 `userId`、`planKey`、`productKey`、`orderType`。
- 订阅成功后，以 webhook 为准更新本地权限，不以前端跳转成功页为准。
- Data License 不进入 Stripe Checkout 产品表，只走表单咨询和人工跟进。

## Checkout 流程

### 订阅购买

1. 用户点击套餐按钮。
2. 服务端校验登录状态。
3. 服务端读取 `catalog.ts`。
4. 服务端创建 Checkout Session。
5. 用户跳转 Stripe Checkout。
6. Stripe webhook 回调。
7. 系统创建或更新 `subscriptions`。
8. 用户获得对应权限。

成功页文案：

> Your subscription is active. You can now use your plan features in the dashboard.

失败页文案：

> Payment was not completed. No plan changes were made.

### 单份报告购买

1. 用户点击购买报告。
2. 服务端校验报告是否存在和发布。
3. 服务端创建 one-time Checkout Session。
4. webhook 成功后创建 `report_purchases`。
5. 系统发送 Brevo 邮件。
6. 用户可在 `/app/reports` 下载。

成功页文案：

> Your report is ready in your dashboard.

## Stripe webhook

必须处理：

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `payment_intent.succeeded`

要求：

- webhook 必须校验签名。
- webhook 必须幂等，使用 Stripe event id 去重。
- 本地权限以 webhook 结果为准。
- webhook 失败进入 Sentry。
- webhook 失败要能在 Admin 看到。

## CSV 导出

导出来源：

- 当前搜索结果
- Saved List
- Supplier Comparison
- Data License 全量非敏感数据

导出方式：

1. 用户发起导出。
2. 服务端检查套餐、额度和查询条件。
3. 创建 `export_jobs`，状态为 `queued`。
4. 后台任务生成 CSV。
5. 上传到 Cloudflare R2。
6. 写入 `export_files`。
7. 扣减额度。
8. 发送 Brevo 邮件。

CSV 字段顺序固定：

1. Company Name
2. Industry
3. Official Website
4. Province
5. City
6. Main Products
7. Product Keywords
8. Year Established
9. Registered Capital
10. Company Size
11. Company Type
12. Trade Mode
13. Exhibition History
14. Ownership Type

禁止字段：

- Contact Person
- Mobile
- Phone
- Fax
- Email
- Full Address
- Postal Code
- All ignored award/tag fields

导出限制：

- Free: 0
- Starter: 200/月
- Pro: 1,600/月
- Team: 8,000/月
- Data License: 全量非敏感数据

导出按钮文案：

- 正常：`Export CSV`
- 额度不足：`Upgrade to export more records`
- Free：`Upgrade to export supplier data`

## PDF 报告

报告必须是真实基于数据库统计和样本资料生成的采购研究材料，不能编造趋势、认证、验厂结论或无法由数据支持的判断。

PDF 报告由 Admin 后台人工上传，不由系统自动生成。

上传同步要求：

1. Admin 在 `/admin/reports` 创建或编辑报告。
2. Admin 填写报告标题、slug、类型、价格、覆盖行业/产品/城市、摘要、目录、样本说明、发布时间。
3. Admin 上传 PDF 文件。
4. 系统将 PDF 上传到 Cloudflare R2。
5. 系统在数据库 `reports` 表写入 R2 object key、文件大小、版本、发布状态。
6. 前端 `/reports` 和 `/reports/[slug]` 自动展示已发布报告。
7. 用户购买后写入 `report_purchases`。
8. `/app/reports` 根据数据库购买记录展示下载按钮。
9. 下载时服务端校验权限，再生成 R2 短期签名链接。

验收标准：

- Admin 上传后，前台报告列表能看到已发布报告。
- 报告详情页显示数据库中的标题、摘要、目录、价格和免责声明。
- 未购买用户不能下载 PDF。
- 已购买用户能在 Dashboard 下载。
- 替换 PDF 后，旧购买用户下载最新发布版本。

### Basic Industry PDF Report

价格：$49

包含：

- Industry overview
- Supplier count
- Province distribution
- City distribution
- Product keyword clusters
- Company size summary
- Company type summary
- Trade mode summary
- 10 sample supplier profiles
- Basic buyer verification checklist

### Full Industry PDF Report

价格：$99

包含：

- Basic 全部内容
- Deeper industry analysis
- 50 sample supplier profiles
- Province and city opportunity notes
- Recommended database filters

### Premium Industry PDF Report

价格：$299

包含：

- Full 全部内容
- 100 supplier shortlist examples
- Manual screening notes
- Procurement strategy suggestions
- Risk notes for buyer verification

### Canton Fair Exhibitor Intelligence Report

价格：$149

包含：

- Exhibitor dataset overview
- Industry distribution
- Province distribution
- City distribution
- Product keyword clusters
- 50 sample exhibitor profiles
- Buyer verification checklist

## 报告交付页面

`/reports/[slug]` 布局：

1. Header：报告名称、价格、购买按钮。
2. Summary：报告覆盖的行业、数据记录数、更新时间。
3. What is included：列出真实包含内容。
4. What is not included：明确不包含联系方式、完整名单、CSV。
5. Sample sections：展示目录和 1-2 张截图。
6. CTA：`Buy report`

报告页固定免责声明：

> This report is based on structured exhibitor and supplier profile data available in gocnscout. It is for supplier discovery and research only. It does not include private contact information and does not verify, certify, or endorse any supplier.

## Custom Shortlist

价格：$399/request

页面文案：

> Get a manually prepared shortlist of up to 50 supplier candidates based on your product, industry, location, and company profile requirements.

交付：

- Up to 50 supplier candidates
- Product and industry matching notes
- Province and city notes
- Company profile summary
- Official website links, if available
- Buyer verification checklist

不交付：

- Private contacts
- Mobile numbers
- Email addresses
- Telemarketing lists
- Supplier verification or factory audit

## Data License

价格展示：$6,000/year

Data License 走表单咨询，不提供直接在线付款。

页面 CTA：

> Request Data License Consultation

咨询表单字段：

- Company name
- Work email
- Website
- Intended use
- Expected data scope
- Notes

交付：

- Annual non-sensitive supplier dataset
- Quarterly refresh
- CSV delivery
- Commercial internal use
- 1 onboarding call

不包含：

- API
- Resale rights
- Sensitive fields
- Ignored award/tag fields
- Contact information

验收标准：

- Data License 页面不能出现直接 Checkout 按钮。
- 提交咨询后在 Admin 生成 Data License inquiry。
- 系统发送 Brevo 确认邮件。
- Admin 可以标记状态：新咨询、沟通中、已成交、已关闭。

## Brevo 邮件

必须发送：

- Checkout 成功
- 报告购买成功
- 导出完成
- 导出失败
- Custom Shortlist 申请收到
- Data License 咨询收到
- Data removal request 收到
- Data removal request 处理完成

发件人建议：

- Name: `gocnscout`
- Reply-to: `gerry@gocnscout.com`
