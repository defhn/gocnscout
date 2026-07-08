# 10. API 契约与服务端边界

## 目标

本文件定义前端、服务端、数据库、第三方服务之间的接口边界。开发完成后，前端页面不能直接猜字段，必须通过这些服务端契约读取数据、提交操作和触发第三方服务。

## 全局 API 规则

- 所有外部输入必须用 Zod 或等效 schema 校验。
- 所有列表接口必须分页。
- 所有权限在服务端校验，不能只靠前端隐藏按钮。
- 所有返回给前端的数据必须走字段白名单。
- 不允许直接把 Prisma 查询结果原样返回给前端。
- API 错误格式必须统一。

错误格式：

```ts
type ApiError = {
  error: {
    code: string
    message: string
    details?: unknown
  }
}
```

分页格式：

```ts
type PaginatedResult<T> = {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}
```

## 公开供应商 API

### `GET /api/suppliers/search`

用途：数据库搜索页、行业页、产品页、城市页使用。

Query：

- `q`
- `industry`
- `province`
- `city`
- `productKeyword`
- `yearEstablishedMin`
- `yearEstablishedMax`
- `registeredCapital`
- `companySize`
- `companyType`
- `tradeMode`
- `ownershipType`
- `hasWebsite`
- `page`
- `pageSize`
- `sort`

服务端规则：

- 根据登录用户套餐限制 `page` 和 `pageSize`。
- Free 单次搜索最多 2 页，每页 10 条。
- 默认不返回官网给 Free 用户。
- 结果不返回敏感字段和禁用字段。
- 参数页不影响 SEO，`/database` 本身 noindex。

返回字段：

```ts
type SupplierSearchItem = {
  id: string
  slug: string
  companyName: string
  industry: string
  province: string
  city: string
  mainProducts: string[]
  productKeywords?: string[]
  companySize?: string
  companyType?: string
  tradeMode?: string
  officialWebsite?: string
}
```

### `GET /api/suppliers/:slug`

用途：公司资料页。

服务端规则：

- Free 用户每月最多查看 5 个供应商档案。
- Free 不返回官网、注册资金、参展历史、企业性质。
- 付费用户按套餐返回字段。
- 每次成功查看写入 profile view usage。

返回字段：

```ts
type SupplierProfile = {
  id: string
  slug: string
  companyName: string
  industry: string
  province: string
  city: string
  officialWebsite?: string
  mainProducts: string[]
  productKeywords: string[]
  yearEstablished?: string
  registeredCapital?: string
  companySize?: string
  companyType?: string
  tradeMode?: string
  exhibitionHistory?: string
  ownershipType?: string
  similarSuppliers?: SupplierSearchItem[]
}
```

## SEO 页面数据 API

这些可以实现为 server-only service，不一定暴露 HTTP API。

### `getIndustryPageData(slug)`

必须返回：

- industry
- supplierCount
- topProvinces
- topCities
- productKeywordClusters
- companySizeDistribution
- companyTypeDistribution
- tradeModeDistribution
- sampleSuppliers
- relatedIndustries
- relatedProducts
- relatedCities
- shouldIndex

### `getProductPageData(slug)`

必须返回：

- productKeyword
- supplierCount
- relatedIndustries
- topProvinces
- topCities
- sampleSuppliers
- relatedProducts
- suggestedFilters
- shouldIndex

### `getCityPageData(slug)`

必须返回：

- city
- province
- supplierCount
- industryDistribution
- productKeywordDistribution
- companyTypeDistribution
- tradeModeDistribution
- sampleSuppliers
- relatedIndustryCityLinks
- shouldIndex

## Dashboard API

### Lists

`GET /api/app/lists`

返回当前用户可见名单。

`POST /api/app/lists`

创建名单。

Body：

- `name`
- `visibility`: `private` 或 `team`

服务端规则：

- Starter 最多 5 个名单。
- Team 的 shared list 只给同团队可见。

`POST /api/app/lists/:id/items`

添加供应商到名单。

服务端规则：

- Starter 最多保存 200 个供应商。
- Pro 最多保存 3,000 个供应商。

### Compare

`POST /api/app/compare`

Body：

- `supplierIds`: 最多 5 个

返回只包含允许字段的对比数据。

### Data License Inquiry

`POST /api/app/data-license-inquiries`

Body：

- `companyName`
- `workEmail`
- `website`
- `intendedUse`
- `expectedDataScope`
- `notes`

服务端规则：

- 必须登录。
- 创建 inquiry。
- 发送 Brevo 确认邮件。
- 不触发 Stripe Checkout。

## 导出 API

### `POST /api/app/exports`

Body：

- `sourceType`: `search` | `list` | `comparison` | `data_license`
- `sourceId`
- `filters`

服务端规则：

- Free 禁止导出。
- Starter 每月 200 条。
- Pro 每月 1,600 条。
- Team 每月 8,000 条。
- 先创建 `export_jobs`。
- 导出完成才扣减额度。
- CSV 字段必须使用白名单。

返回：

```ts
type ExportJobResponse = {
  id: string
  status: 'queued' | 'processing' | 'ready' | 'failed'
}
```

### `GET /api/app/exports/:id/download`

服务端规则：

- 必须登录。
- 用户必须拥有该导出文件。
- 文件必须未过期。
- 返回 R2 短期签名链接或直接重定向。

## 报告 API

### `GET /api/reports`

返回已发布报告列表。

### `GET /api/reports/:slug`

返回报告详情、价格、目录、免责声明、购买状态。

### `POST /api/reports/:slug/checkout`

创建 Stripe one-time Checkout Session。

服务端规则：

- 报告必须 published。
- 使用代码内 catalog 和 `price_data`。
- currency 固定 `usd`。

### `GET /api/app/reports/:id/download`

服务端规则：

- 必须登录。
- 用户已购买或套餐包含权益。
- 返回 R2 短期签名链接。

## Billing API

### `POST /api/billing/checkout`

Body：

- `productKey`

服务端规则：

- `productKey` 必须存在于 `catalog.ts`。
- Data License 不允许通过此接口付款。
- 创建 Stripe Checkout Session。
- metadata 必须包含 `userId`、`productKey`、`orderType`。

### `POST /api/webhooks/stripe`

规则：

- 必须使用 raw body 校验 Stripe 签名。
- 使用 Stripe event id 幂等去重。
- 同步 subscriptions、report_purchases、custom_shortlist_requests。

## Admin API

### `POST /api/admin/imports`

上传 Excel 并创建导入任务。

### `POST /api/admin/reports`

创建报告元数据。

### `POST /api/admin/reports/:id/upload`

上传 PDF 到 R2，并更新数据库：

- `r2ObjectKey`
- `fileSize`
- `version`
- `status`

### `PATCH /api/admin/reports/:id`

编辑报告标题、摘要、目录、价格、发布状态。

### `GET /api/admin/suppliers/:id/private-fields`

查看敏感字段。

服务端规则：

- Admin only。
- 写入 `sensitive_field_access_logs`。

## 验收标准

- 前端所有数据都来自 API 或 server-only service。
- 敏感字段不会通过任何公开 API 返回。
- 禁用字段不会通过任何公开 API 返回。
- Stripe webhook 能更新本地数据库。
- R2 上传后数据库能记录 object key。
- Dashboard 下载按钮由数据库购买记录和权限决定。
- 所有接口错误格式统一。

