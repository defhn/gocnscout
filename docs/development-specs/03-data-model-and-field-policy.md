# 03. 数据模型与字段策略

## 字段公开原则

产品可以公开企业和采购研究字段，不公开个人或联系方式字段。

## 可用于前台、Dashboard、CSV、PDF 的字段

| 原始字段 | 英文字段 |
|---|---|
| 行业 | Industry |
| 展商名称 | Company Name |
| 官网 | Official Website |
| 省份 | Province |
| 城市 | City |
| 主营产品 | Main Products |
| 主营关键词 | Product Keywords |
| 成立时间 | Year Established |
| 注册资金 | Registered Capital |
| 企业规模 | Company Size |
| 企业类型 | Company Type |
| 贸易形式 | Trade Mode |
| 参展历史 | Exhibition History |
| 企业性质 | Ownership Type |

## 不公开字段

这些字段只能在中文 Admin 内按权限查看，不能进入公开 API、前台、Dashboard、CSV、PDF、搜索索引。

- 负责人
- 手机
- 电话
- 传真
- 邮箱
- 详细地址
- 邮编

## 完全不用的字段

这些字段不参与展示、筛选、搜索、评分、SEO、报告、导出。

- 创新奖
- CF奖
- 多届参展
- 品牌展商
- 中华老字号
- 乡村振兴特色展商
- 新展商
- isSpecializedSpecializedSpecialNewEnterprise
- 绿色奖展商
- 海关认证展商
- 高新展商

## 核心数据表

### suppliers

用途：供应商业务主表。

关键字段：

- `id`
- `slug`
- `companyName`
- `industryId`
- `officialWebsite`
- `provinceId`
- `cityId`
- `mainProducts`
- `productKeywords`
- `yearEstablished`
- `registeredCapital`
- `companySize`
- `companyType`
- `tradeMode`
- `exhibitionHistory`
- `ownershipType`
- `hasOfficialWebsite`
- `searchVector`
- `sourceImportId`
- `createdAt`
- `updatedAt`

### supplier_private_fields

用途：内部保留敏感原始字段，默认不查。

字段：

- `supplierId`
- `contactPerson`
- `mobile`
- `phone`
- `fax`
- `email`
- `fullAddress`
- `postalCode`

访问要求：

- 仅 Admin 可见。
- 默认隐藏。
- 二次点击查看。
- 每次查看写入 `sensitive_field_access_logs`。

### supplier_ignored_fields

用途：保存不用字段，方便追溯原始数据。

字段：

- `supplierId`
- `rawJson`

要求：

- 不进入搜索索引。
- 不进入前台 API。
- 不进入导出。
- 不进入 PDF。

### taxonomy tables

需要：

- `industries`
- `product_keywords`
- `provinces`
- `cities`

每张表至少包含：

- `id`
- `nameZh`
- `nameEn`
- `slug`
- `supplierCount`
- `createdAt`
- `updatedAt`

### imports

用途：记录 Excel 导入。

字段：

- `id`
- `fileName`
- `status`
- `totalRows`
- `successRows`
- `failedRows`
- `errorSummary`
- `createdByAdminId`
- `createdAt`

## 业务表

需要：

- `users`
- `teams`
- `team_members`
- `subscriptions`
- `usage_counters`
- `saved_lists`
- `saved_list_items`
- `supplier_notes`
- `supplier_comparisons`
- `export_jobs`
- `export_files`
- `reports`
- `report_purchases`
- `custom_shortlist_requests`
- `data_license_accounts`
- `data_removal_requests`
- `admin_audit_logs`
- `sensitive_field_access_logs`

## 字段白名单

前台 API、CSV、PDF 必须使用白名单，不允许从数据库对象直接序列化返回。

CSV 白名单：

- Company Name
- Industry
- Official Website
- Province
- City
- Main Products
- Product Keywords
- Year Established
- Registered Capital
- Company Size
- Company Type
- Trade Mode
- Exhibition History
- Ownership Type

