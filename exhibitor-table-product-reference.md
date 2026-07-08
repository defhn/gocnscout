# 2万+展商数据英文站产品文档

## 1. 产品结论

这个项目建议做成一个面向海外采购用户的英文数据产品：

> China supplier discovery and sourcing intelligence for trade fair exhibitors.

中文理解：

> 用结构化展商数据帮助海外买家发现、筛选、比较中国供应商，但不公开、不售卖个人电话、个人邮箱和负责人信息。

产品不要定位成“联系人数据库”或“广交会通讯录”，而要定位成“供应商发现和采购研究工具”。核心变现方式是数据库订阅，行业 PDF 报告作为辅助收入和 SEO 转化工具。

前端网站语言：英文。  
用户 Dashboard 语言：英文。  
Admin 管理后台语言：中文。

## 开发级规格文档

本文件是产品参考文档。真正用于完整开发交付的规格文档放在：

> `docs/development-specs/`

开发时优先阅读：

1. `docs/development-specs/README.md`
2. `docs/development-specs/01-product-scope-and-routes.md`
3. `docs/development-specs/02-technical-architecture.md`
4. `docs/development-specs/03-data-model-and-field-policy.md`
5. `docs/development-specs/04-permissions-plans-and-quotas.md`
6. `docs/development-specs/05-search-seo-and-public-pages.md`
7. `docs/development-specs/06-dashboard-and-admin.md`
8. `docs/development-specs/07-billing-reports-exports-delivery.md`
9. `docs/development-specs/08-data-ingestion-compliance-ops.md`
10. `docs/development-specs/09-implementation-plan-and-acceptance.md`

### 1.1 已确认技术栈

本项目按完整产品交付设计，不按 MVP 缩减功能。开发可以分阶段推进，但最终交付范围必须覆盖本文档列出的数据库订阅、行业 PDF 报告、定制名单、数据授权、英文前台、英文用户 Dashboard 和中文 Admin。

已确认技术栈：

| 模块 | 技术选择 | 说明 |
|---|---|---|
| 前端/全栈框架 | Next.js App Router + TypeScript | 用于英文 SEO 前台、英文用户 Dashboard、中文 Admin 和 API |
| UI | Tailwind CSS + shadcn/ui | 保持开发速度和后台表格/筛选体验 |
| 数据库 | Neon PostgreSQL | 主数据库，承载供应商、用户、订阅、导出、报告、订单和 Admin 数据 |
| ORM | Prisma | 数据模型、迁移和类型安全查询 |
| 登录/Auth | Clerk | 用户登录、注册、会话、团队用户基础能力 |
| 搜索 | PostgreSQL full-text search + pg_trgm | 初始正式版本使用，不依赖额外搜索服务 |
| 后期搜索升级 | Meilisearch | 如有可接受的免费或低成本部署再启用；当前不作为上线依赖 |
| 支付 | Stripe Billing + Stripe Checkout | 订阅、年付、单份报告购买、Custom Shortlist 支付 |
| 文件存储 | Cloudflare R2 | 存储 PDF 报告、CSV 导出文件、数据授权交付文件 |
| Admin | 同一个 Next.js 项目内 `/admin` | 中文后台，不单独做另一个系统 |
| 部署 | Vercel | 部署 Next.js 应用 |
| 定时任务 | GitHub Actions | 定时数据任务、搜索索引刷新、月度额度重置等 |
| 邮件 | Brevo | 交易邮件、报告购买通知、导出完成通知、删除/更正请求通知 |
| 分析 | PostHog | 早期成本更低，使用免费额度做产品分析 |
| 错误监控 | Sentry | 前端、服务端错误监控 |

Meilisearch 决策：

- Meilisearch Cloud 当前不作为必选依赖。
- 如使用 Meilisearch，只能作为后期增强，不影响完整产品上线。
- 初始完整版本搜索必须使用 PostgreSQL full-text search + `pg_trgm` 实现关键词搜索、模糊搜索、筛选和排序。
- 代码结构要预留 `searchProvider` 抽象，后续可以从 PostgreSQL 搜索切换到 Meilisearch。
- 如果后续选择自托管 Meilisearch Community Edition，必须单独补充部署、备份、监控和同步方案。

### 1.2 完整交付原则

本项目不是只做 MVP。开发顺序可以分阶段，但每个阶段都服务于完整产品交付。

完整交付必须包含：

- 英文前台 SEO 页面
- 英文供应商数据库搜索
- 英文公司资料页
- 英文用户 Dashboard
- 中文 Admin
- Clerk 登录和权限
- Stripe 订阅和单次购买
- Free / Starter / Pro / Team / Data License 权限
- CSV 导出和额度控制
- Cloudflare R2 文件存储
- PDF 报告购买和下载
- Custom Shortlist 请求和交付
- Data License 表单咨询和年度授权交付
- GitHub Actions 定时任务
- Brevo 邮件通知
- 数据删除和更正流程
- 禁用字段隔离和合规边界

## 2. 产品名称

推荐名称：

> gocnscout

推荐 tagline：

> Search China trade fair suppliers by product, industry, location, and company profile.

不要使用：

- Canton Fair official database
- Verified supplier database
- Certified factory directory
- China supplier phone number database
- Exhibitor contact list

原因：这些说法会让用户期待电话、邮箱、联系人，增加合规和支付风控风险。

## 3. 目标用户

### 3.1 核心用户

1. 海外进口商
   需要快速找到中国供应商候选名单。

2. Amazon、Shopify、DTC 卖家
   需要找源头供应商、工厂、OEM/ODM 供应商。

3. 采购代理和 sourcing consultant
   需要批量筛选、导出、整理 shortlist。

4. 批发商和分销商
   需要发现新产品、新供应商、新行业机会。

5. 市场研究公司和咨询公司
   需要行业供应商分布、城市分布、产品关键词数据。

### 3.2 付费理由

用户付费不是为了买手机号，而是为了：

- 节省手工搜索供应商的时间
- 快速按行业、产品、城市、企业规模筛选
- 生成供应商 shortlist
- 比较同类供应商
- 下载结构化 CSV
- 阅读行业采购报告
- 找到值得进一步验证的候选供应商

## 4. 字段使用规则

### 4.1 可以公开展示的字段

这些字段可以用于英文前台网站、用户 Dashboard、搜索、筛选、公司资料页、SEO 页面、PDF 报告和 CSV 导出。

| 原始字段 | 英文字段名 | 前台 | Dashboard | CSV | PDF | 说明 |
|---|---|---:|---:|---:|---:|---|
| 行业 | Industry | 是 | 是 | 是 | 是 | 核心分类字段 |
| 展商名称 | Company Name | 是 | 是 | 是 | 是 | 核心公司字段 |
| 官网 | Official Website | 是 | 是 | 是 | 是 | 默认联系路径 |
| 省份 | Province | 是 | 是 | 是 | 是 | 地域筛选 |
| 城市 | City | 是 | 是 | 是 | 是 | 地域筛选和 SEO |
| 主营产品 | Main Products | 是 | 是 | 是 | 是 | 搜索和匹配核心字段 |
| 主营关键词 | Product Keywords | 是 | 是 | 是 | 是 | 搜索、聚类、SEO |
| 成立时间 | Year Established | 是 | 是 | 是 | 是 | 稳定性参考 |
| 注册资金 | Registered Capital | 是 | 是 | 是 | 是 | 以原始值或标准化区间展示 |
| 企业规模 | Company Size | 是 | 是 | 是 | 是 | 筛选字段 |
| 企业类型 | Company Type | 是 | 是 | 是 | 是 | 例如生产企业、外贸企业、工贸企业 |
| 贸易形式 | Trade Mode | 是 | 是 | 是 | 是 | OEM、ODM、OBM |
| 参展历史 | Exhibition History | 是 | 是 | 是 | 是 | 只展示历史届数，不做官方背书 |
| 企业性质 | Ownership Type | 是 | 是 | 是 | 是 | 例如私营企业、国有企业、外商独资 |

### 4.2 限制展示的字段

这些字段可以保留在数据库和中文 Admin 中，但默认不进入英文前台、用户 Dashboard、PDF 和 CSV。

| 原始字段 | 处理方式 | 说明 |
|---|---|---|
| 地址 | 默认不公开详细地址 | 英文前台最多展示省份和城市；详细地址只在中文 Admin 内部可见 |
| 邮编 | 不公开 | 价值低，不进入前台和导出 |
| 传真 | 不公开 | 旧联系方式，价值低，也可能造成联系方式售卖印象 |
| 电话 | 不公开 | 可能是企业电话，也可能涉及个人或历史号码 |

### 4.3 禁止公开和禁止变现的字段

这些字段不能出现在英文前台、用户 Dashboard、CSV 导出、PDF 报告、API、营销文案和付费卖点中。

| 原始字段 | 处理方式 | 原因 |
|---|---|---|
| 负责人 | 不公开、不导出、不出售 | 个人信息 |
| 手机 | 不公开、不导出、不出售 | 高风险个人信息 |
| 邮箱 | 不公开、不导出、不出售 | 可能是个人邮箱，也容易被理解为 lead list |

### 4.4 本项目明确不用的字段

你截图里后面这些字段，本产品全部不用。它们不参与英文前台展示、不参与 Dashboard、不参与筛选、不参与评分、不进入 PDF、不进入 CSV、不进入 SEO 页面、不进入付费卖点。

| 原始字段 | 产品处理 |
|---|---|
| 创新奖 | 不用 |
| CF奖 | 不用 |
| 多届参展 | 不用 |
| 品牌展商 | 不用 |
| 中华老字号 | 不用 |
| 乡村振兴特色展商 | 不用 |
| 新展商 | 不用 |
| isSpecializedSpecializedSpecialNewEnterprise | 不用 |
| 绿色奖展商 | 不用 |
| 海关认证展商 | 不用 |
| 高新展商 | 不用 |

技术处理建议：

- 原始 Excel 可以保留这些列，方便追溯。
- 导入数据库时可以放入 `raw_ignored_fields` 或直接不导入业务表。
- 前台、用户 Dashboard、导出、PDF、搜索索引都不要读取这些字段。
- 后续如要重新启用，必须单独写一份新决策文档。

## 5. 数据模型

### 5.1 Supplier 基础表

核心字段：

- `id`
- `slug`
- `industry`
- `company_name`
- `official_website`
- `province`
- `city`
- `main_products`
- `product_keywords`
- `year_established`
- `registered_capital`
- `company_size`
- `company_type`
- `trade_mode`
- `exhibition_history`
- `ownership_type`
- `created_at`
- `updated_at`

### 5.2 不进入业务模型的字段

以下字段不要设计到前台业务模型中：

- `contact_person`
- `mobile`
- `phone`
- `fax`
- `email`
- `full_address`
- `postal_code`
- `innovation_award`
- `cf_award`
- `multi_session_exhibitor`
- `brand_exhibitor`
- `time_honored_brand`
- `rural_revival_exhibitor`
- `new_exhibitor`
- `specialized_special_new_enterprise`
- `green_award_exhibitor`
- `customs_certified_exhibitor`
- `high_tech_exhibitor`

中文 Admin 可以在“原始数据查看”里保留部分原始字段，但不要作为产品功能。

## 6. 前台英文网站功能

### 6.1 首页

页面路径：

> `/`

页面语言：英文。

核心模块：

- Hero search bar
- Industry quick links
- Product keyword quick links
- Province and city browse entry
- Sample supplier profiles
- How it works
- Pricing CTA
- PDF report CTA
- Legal disclaimer

首页主标题：

> Find China trade fair suppliers worth shortlisting.

副标题：

> Search supplier profiles by industry, product keywords, location, company size, trade mode, and exhibition history.

### 6.2 数据库搜索页

页面路径：

> `/database`

页面语言：英文。

功能一次性列出：

- Keyword search
- Industry filter
- Province filter
- City filter
- Main products filter
- Product keywords filter
- Year established filter
- Registered capital filter
- Company size filter
- Company type filter
- Trade mode filter
- Ownership type filter
- Exhibition history filter
- Has official website filter
- Sort by relevance
- Sort by company name
- Sort by year established
- Sort by company size
- Save supplier to list
- Add supplier to comparison
- View supplier profile
- Export current search results
- Clear filters
- Share search URL

按套餐限制：

| 套餐 | 搜索结果页数 | 每页数量 | 单次搜索最多可见结果 | 每月档案查看 | 官网访问 |
|---|---:|---:|---:|---:|---|
| Free | 2 页 | 10 条 | 20 条 | 5 个供应商档案/月 | 不允许 |
| Starter | 20 页 | 25 条 | 500 条 | 不限 | 允许 |
| Pro | 80 页 | 25 条 | 2,000 条 | 不限 | 允许 |
| Team | 200 页 | 25 条 | 5,000 条 | 不限 | 允许 |

免费搜索结果页只展示以下字段：

- Company Name
- Industry
- Province
- City
- Main Products，最多展示 3 个产品
- Company Type

免费供应商档案页只展示以下字段：

- Company Name
- Industry
- Province
- City
- Main Products
- Product Keywords，最多展示 5 个关键词
- Company Size
- Company Type
- Trade Mode
- Year Established

免费版不展示：

- Official Website
- Registered Capital
- Exhibition History
- Ownership Type
- Similar suppliers
- Supplier comparison
- Export button
- Save to list button

不要做的筛选：

- 不做负责人筛选
- 不做手机号筛选
- 不做邮箱筛选
- 不做创新奖筛选
- 不做 CF奖筛选
- 不做多届参展筛选
- 不做品牌展商筛选
- 不做中华老字号筛选
- 不做乡村振兴筛选
- 不做新展商筛选
- 不做专精特新筛选
- 不做绿色奖筛选
- 不做海关认证筛选
- 不做高新展商筛选

### 6.3 公司资料页

页面路径：

> `/companies/[slug]`

页面语言：英文。

展示模块：

- Company name
- Industry
- Province and city
- Official website button
- Main products
- Product keywords
- Company profile fields
- Trade mode
- Company size
- Company type
- Ownership type
- Year established
- Registered capital
- Exhibition history
- Similar suppliers
- Suppliers in the same industry
- Suppliers in the same city
- Buyer verification checklist
- Report incorrect data
- Request profile removal

官方联系按钮文案：

> Visit Official Website

不要展示：

- Contact person
- Mobile number
- Phone number
- Fax
- Email
- Full street address

免责声明：

> This profile is compiled from public trade fair and company-related sources for supplier discovery and research. It is not an official certification, endorsement, or verification of the company. Buyers should independently verify all suppliers before making purchasing decisions.

### 6.4 行业页

页面路径：

> `/industries/[slug]`

页面语言：英文。

功能和内容：

- Industry overview
- Supplier count
- Top provinces
- Top cities
- Common product keywords
- Company size distribution
- Company type distribution
- Trade mode distribution
- Sample supplier profiles
- Download industry report CTA
- View full database CTA

不要在行业页展示不用字段的统计，例如创新奖、CF奖、品牌展商、高新展商等。

### 6.5 产品关键词页

页面路径：

> `/products/[slug]`

页面语言：英文。

功能和内容：

- Product keyword overview
- Matching supplier count
- Related industries
- Top provinces
- Top cities
- Supplier preview list
- Related product keywords
- Buyer verification tips
- View full database CTA

### 6.6 城市页

页面路径：

> `/cities/[slug]`

页面语言：英文。

功能和内容：

- City supplier overview
- Industry distribution
- Product keyword distribution
- Sample suppliers
- Link to city + industry combinations
- View suppliers in this city CTA

### 6.7 Pricing 页面

页面路径：

> `/pricing`

页面语言：英文。

展示套餐：

- Free
- Starter
- Pro
- Team
- Industry Report
- Custom Shortlist

## 7. 用户 Dashboard 功能

页面语言：英文。

### 7.1 Dashboard 首页

路径：

> `/app`

功能：

- Saved searches
- Saved supplier lists
- Recent viewed suppliers
- Export usage
- Report downloads
- Recommended industries
- Recommended product keywords

### 7.2 Saved Lists

路径：

> `/app/lists`

功能：

- Create supplier list
- Rename supplier list
- Delete supplier list
- Add supplier to list
- Remove supplier from list
- Add private notes
- Export list
- Share list with team members

### 7.3 Supplier Comparison

路径：

> `/app/compare`

功能：

- Compare up to 5 suppliers
- Compare industry
- Compare city and province
- Compare main products
- Compare product keywords
- Compare company size
- Compare company type
- Compare trade mode
- Compare year established
- Compare registered capital
- Compare exhibition history
- Export comparison

### 7.4 Exports

路径：

> `/app/exports`

功能：

- Export current search results
- Export saved list
- Export comparison table
- View export history
- Download previous exports
- Show monthly export quota

导出字段只能包含：

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

导出字段不能包含：

- Contact Person
- Mobile
- Phone
- Fax
- Email
- Full Address
- Postal Code
- All ignored award/tag fields

### 7.5 Reports

路径：

> `/app/reports`

功能：

- Purchased reports
- Download PDF
- Download CSV appendix if included
- Browse available reports
- Request custom shortlist

### 7.6 Account and Billing

路径：

> `/app/billing`

功能：

- Current plan
- Upgrade plan
- Cancel subscription
- Invoice history
- Payment method
- Team seats
- Usage limits

## 8. 中文 Admin 功能

Admin 语言：中文。

路径建议：

> `/admin`

### 8.1 管理后台模块

功能一次性列出：

- 登录
- 管理员权限
- 展商列表
- 展商详情
- 原始数据查看
- 数据导入
- 数据清洗
- 字段映射
- 行业管理
- 产品关键词管理
- 城市/省份管理
- 公司 slug 管理
- 官网 URL 校验
- 重复公司合并
- 隐私字段屏蔽状态
- 忽略字段状态
- 用户管理
- 订阅管理
- 导出记录
- PDF 报告管理
- 自定义 shortlist 订单管理
- 数据更正申请
- 删除申请
- 投诉记录
- SEO 页面管理
- 操作日志

### 8.2 Admin 字段显示策略

中文 Admin 可以显示：

- 行业
- 展商名称
- 官网
- 省份
- 城市
- 地址
- 邮编
- 主营产品
- 主营关键词
- 成立时间
- 注册资金
- 企业规模
- 企业类型
- 贸易形式
- 参展历史
- 企业性质

中文 Admin 默认隐藏，需要二次点击才能看：

- 负责人
- 手机
- 电话
- 传真
- 邮箱

中文 Admin 标记为“产品不用字段”：

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

这些字段即使在 Admin 可见，也只能用于排查原始数据，不能用于前台功能。

## 9. 定价和套餐

价格不要做区间，先固定如下。

当前数据量按约 20,335 条供应商记录设计。套餐限制要让免费用户能感知数据库价值，但不能完成实质采购筛选；付费用户按导出深度分层。

导出额度占全库比例：

| 套餐 | 每月导出额度 | 约占 20,335 条数据比例 | 产品意义 |
|---|---:|---:|---|
| Free | 0 | 0% | 只能预览，不能带走数据 |
| Starter | 200 | 约 1% | 适合单个小行业或小批量采购研究 |
| Pro | 1,600 | 约 8% | 适合 sourcing agent 和重度买家 |
| Team | 8,000 | 约 39% | 适合团队级研究，但仍不能一次搬完整库 |
| Data License | 全量非敏感数据 | 100% | 年度授权，服务企业和数据合作 |

套餐字段可见矩阵：

| 字段 | Free | Starter | Pro | Team | Data License |
|---|---:|---:|---:|---:|---:|
| Company Name | 是 | 是 | 是 | 是 | 是 |
| Industry | 是 | 是 | 是 | 是 | 是 |
| Province | 是 | 是 | 是 | 是 | 是 |
| City | 是 | 是 | 是 | 是 | 是 |
| Main Products | 是 | 是 | 是 | 是 | 是 |
| Product Keywords | 部分 | 是 | 是 | 是 | 是 |
| Company Size | 档案页可见 | 是 | 是 | 是 | 是 |
| Company Type | 是 | 是 | 是 | 是 | 是 |
| Trade Mode | 档案页可见 | 是 | 是 | 是 | 是 |
| Year Established | 档案页可见 | 是 | 是 | 是 | 是 |
| Official Website | 否 | 是 | 是 | 是 | 是 |
| Registered Capital | 否 | 是 | 是 | 是 | 是 |
| Exhibition History | 否 | 是 | 是 | 是 | 是 |
| Ownership Type | 否 | 是 | 是 | 是 | 是 |
| Similar Suppliers | 否 | 是 | 是 | 是 | 否 |
| Saved Lists | 否 | 是 | 是 | 是 | 否 |
| Supplier Comparison | 否 | 是 | 是 | 是 | 否 |
| CSV Export | 否 | 是 | 是 | 是 | 是 |

所有套餐都不能看到、不能导出、不能通过 API 获取：

- Contact Person
- Mobile
- Phone
- Fax
- Email
- Full Address
- Postal Code
- All ignored award/tag fields

### 9.1 Free

价格：

> $0/month

包含：

- View public SEO pages
- Search database with limited results: 2 pages per search, 10 results per page, 20 visible results per search
- View 5 supplier profiles per month
- Use basic keyword search
- Use industry filter
- Use province filter
- Use city filter

免费搜索结果可见字段：

- Company Name
- Industry
- Province
- City
- Main Products，最多 3 个产品
- Company Type

免费供应商档案可见字段：

- Company Name
- Industry
- Province
- City
- Main Products
- Product Keywords，最多 5 个关键词
- Company Size
- Company Type
- Trade Mode
- Year Established

不包含：

- Official website access
- CSV export
- Saved lists
- Supplier comparison
- Advanced filters
- PDF report download
- Registered capital
- Exhibition history
- Ownership type
- Team seats
- API

### 9.2 Starter

价格：

> $49/month

年付：

> $490/year

包含：

- Unlimited supplier profile views
- Basic filters
- Advanced filters
- Save up to 5 supplier lists
- Save up to 200 suppliers
- Compare up to 5 suppliers
- Export 200 supplier records per month
- Visit official website links
- View registered capital
- View exhibition history
- View ownership type
- 50% discount on Basic Industry Reports
- Email support

适合：

- Individual buyers
- Amazon sellers
- Shopify sellers
- Small importers

### 9.3 Pro

价格：

> $199/month

年付：

> $1,990/year

包含：

- Everything in Starter
- Save unlimited supplier lists
- Save up to 3,000 suppliers
- Export 1,600 supplier records per month
- Download 1 included Basic Industry Report per month
- 50% discount on Full Industry Reports
- Supplier comparison
- Search URL sharing
- Export history
- Priority email support

适合：

- Sourcing consultants
- Importers
- Wholesale teams
- Product research teams

### 9.4 Team

价格：

> $499/month

年付：

> $4,990/year

包含：

- Everything in Pro
- 5 team seats
- Shared supplier lists
- Team notes
- Export 8,000 supplier records per month
- Download 3 included Basic Industry Reports per month
- Download 1 included Full Industry Report per month
- 50% discount on Premium Industry Reports
- Custom fields
- Admin seat management
- Priority support

适合：

- Sourcing agencies
- Consulting companies
- Import teams
- Market research teams

### 9.5 Basic Industry PDF Report

单份价格：

> $49/report

包含：

- Industry overview
- Supplier count
- Province distribution
- City distribution
- Product keyword clusters
- Company size distribution summary
- Company type distribution summary
- Trade mode distribution summary
- 10 sample supplier profiles
- Basic buyer verification checklist

定位：

> SEO 转化产品和低门槛成交产品，用来告诉用户这个行业有什么机会。

不包含：

- CSV download
- Full supplier list
- Official website links for all suppliers
- Custom shortlist

### 9.6 Full Industry PDF Report

单份价格：

> $99/report

包含：

- Everything in Basic Industry PDF Report
- Deeper industry analysis
- 50 sample supplier profiles
- Province and city opportunity notes
- Product keyword cluster analysis
- Company type analysis
- Trade mode analysis
- Buyer verification checklist
- Recommended search filters to use in the database

定位：

> 主力行业报告版本，用来建立专业感，并推动用户升级到 Pro 订阅。

不包含：

- Full supplier list
- CSV download
- Contact information
- Unlimited filtering
- Custom shortlist

### 9.7 Premium Industry PDF Report

单份价格：

> $299/report

包含：

- Everything in Full Industry PDF Report
- 100 supplier shortlist examples
- Manual screening notes
- Procurement strategy suggestions
- Risk notes for buyer verification
- Recommended next search paths in the database

定位：

> 面向企业采购和 sourcing agent 的高价值报告，价格锚定定制研究，但仍然低于 Custom Shortlist。

PDF 不包含：

- 负责人
- 手机
- 电话
- 传真
- 邮箱
- 详细地址
- 禁用奖项和标签字段

### 9.8 Canton Fair Exhibitor Intelligence Report

单份价格：

> $149/report

包含：

- Canton Fair exhibitor dataset overview
- Industry distribution
- Province distribution
- City distribution
- Product keyword clusters
- Company type distribution
- Trade mode distribution
- Buyer search trends and SEO entry points
- 50 sample exhibitor profiles
- Buyer verification checklist

定位：

> 专门承接 Canton Fair suppliers、Canton Fair exhibitors list、China factory database 等搜索需求的报告产品。

不包含：

- Official Canton Fair claim
- Full exhibitor list
- Contact information
- CSV export

### 9.9 Custom Shortlist

单次价格：

> $399/request

交付内容：

- Up to 50 supplier candidates
- Product and industry matching
- Province and city notes
- Company profile summary
- Official website links
- Buyer verification checklist

不交付：

- 私人联系人
- 手机号
- 邮箱
- 电话营销名单

### 9.10 Data License

价格展示：

> $6,000/year

Data License 走表单咨询，不提供前台直接在线付款。

包含：

- Annual access to non-sensitive supplier dataset
- Quarterly data refresh
- CSV delivery
- Commercial internal use
- 1 onboarding call

不包含：

- 联系人
- 手机
- 电话
- 传真
- 邮箱
- 详细地址
- API
- 转售权

## 10. PDF 报告策略

PDF 值得做，但不是主产品。主产品是数据库订阅。

PDF 报告由中文 Admin 后台人工上传，不由系统自动生成。上传后必须同步 Cloudflare R2 文件、数据库报告记录、前台报告详情页和用户 Dashboard 下载权限。

PDF 的角色：

- SEO 转化产品
- 低价成交产品
- 给用户建立信任
- 给行业页面增加收入入口
- 帮用户快速理解一个行业

PDF 和数据库的关系：

- PDF 负责回答：这个行业有什么机会。
- 数据库负责回答：我应该筛选、比较、导出哪些供应商。
- PDF 不能替代数据库，不能包含完整供应商名单、完整 CSV、联系方式或无限筛选能力。

报告产品分层：

| 报告 | 价格 | 角色 | 样本供应商数量 | 是否含完整名单 |
|---|---:|---|---:|---|
| Basic Industry PDF Report | $49 | SEO 转化和低门槛成交 | 10 | 否 |
| Full Industry PDF Report | $99 | 主力报告产品 | 50 | 否 |
| Premium Industry PDF Report | $299 | 企业采购和 sourcing agent | 100 | 否 |
| Canton Fair Exhibitor Intelligence Report | $149 | 展会关键词 SEO 转化 | 50 | 否 |

Basic Industry PDF 的固定结构：

1. Industry Overview
2. Supplier Count
3. Province Distribution
4. City Distribution
5. Product Keyword Clusters
6. Company Size Distribution Summary
7. Company Type Distribution Summary
8. Trade Mode Distribution Summary
9. 10 Sample Supplier Profiles
10. Basic Buyer Verification Checklist

Full Industry PDF 的固定结构：

1. Industry Overview
2. Supplier Count
3. Province Distribution
4. City Distribution
5. Product Keyword Clusters
6. Company Size Distribution
7. Company Type Distribution
8. Trade Mode Distribution
9. 50 Sample Supplier Profiles
10. Buyer Verification Checklist
11. Recommended Database Filters
12. Search Strategy Suggestions

Premium Industry PDF 的固定结构：

1. Full Industry PDF 全部内容
2. 100 Supplier Shortlist Examples
3. Manual Screening Notes
4. Procurement Strategy Suggestions
5. Risk Notes for Buyer Verification
6. Recommended Next Search Paths

Canton Fair Exhibitor Intelligence Report 的固定结构：

1. Canton Fair Exhibitor Dataset Overview
2. Industry Distribution
3. Province Distribution
4. City Distribution
5. Product Keyword Clusters
6. Company Type Distribution
7. Trade Mode Distribution
8. Buyer Search Trends
9. 50 Sample Exhibitor Profiles
10. Buyer Verification Checklist

不要把 PDF 做成原始表格导出。PDF 应该是采购研究报告，而不是通讯录。

价格逻辑：

- $49 Basic Report 是引流价，不再继续降价。
- $99 Full Report 是主力单份报告价格。
- $299 Premium Report 用来锚定高价值采购研究。
- Starter 订阅不免费赠送完整报告，只提供 Basic Report 折扣，避免 $49/月订阅抢掉 $99 报告价值。
- Pro 和 Team 可以包含少量 Basic 或 Full 报告，用来提升订阅转化，但不能让报告权益超过订阅本身价格。

## 11. SEO 页面规划

### 11.1 行业 SEO 页面

URL 示例：

- `/industries/stationery-suppliers-china`
- `/industries/building-materials-suppliers-china`
- `/industries/consumer-electronics-suppliers-china`
- `/industries/auto-parts-suppliers-china`

标题模板：

> China [Industry] Suppliers and Trade Fair Exhibitors

### 11.2 产品 SEO 页面

URL 示例：

- `/products/gel-pen-manufacturers-china`
- `/products/colored-pencil-suppliers-china`
- `/products/ceramic-tile-manufacturers-china`

标题模板：

> China [Product] Manufacturers and Supplier Profiles

### 11.3 城市 SEO 页面

URL 示例：

- `/cities/shanghai-suppliers`
- `/cities/guangzhou-suppliers`
- `/cities/ningbo-suppliers`

标题模板：

> Supplier Profiles in [City], China

## 12. 数据加工规则

### 12.1 英文化字段

需要把中文字段映射为英文：

- 行业 -> Industry
- 展商名称 -> Company Name
- 官网 -> Official Website
- 省份 -> Province
- 城市 -> City
- 主营产品 -> Main Products
- 主营关键词 -> Product Keywords
- 成立时间 -> Year Established
- 注册资金 -> Registered Capital
- 企业规模 -> Company Size
- 企业类型 -> Company Type
- 贸易形式 -> Trade Mode
- 参展历史 -> Exhibition History
- 企业性质 -> Ownership Type

### 12.2 搜索索引字段

只索引：

- Company Name
- Industry
- Province
- City
- Main Products
- Product Keywords
- Company Type
- Trade Mode
- Ownership Type

不要索引：

- 负责人
- 手机
- 电话
- 传真
- 邮箱
- 详细地址
- 禁用奖项和标签字段

### 12.3 Supplier Match Score

可以做一个简单的匹配分，但不要使用禁用字段。

可用因素：

- Product keyword match
- Main product match
- Industry match
- City/province match
- Company type match
- Trade mode match
- Company size match
- Website exists
- Exhibition history count

分数名称：

> Supplier Match Score

不要叫：

- Verified Score
- Certification Score
- Trust Score
- Official Score

## 13. 合规和风控

### 13.1 默认红线

默认红线：

> 不公开、不导出、不售卖负责人、手机、电话、传真、邮箱和详细地址。

### 13.2 删除和更正机制

必须有页面：

> `/legal/data-removal`

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

### 13.3 法务页面

需要页面：

- `/legal/privacy`
- `/legal/terms`
- `/legal/data-removal`
- `/legal/disclaimer`

## 14. 完整版本开发顺序

本项目不按 MVP 缩减功能。以下阶段只是工程依赖顺序，不代表砍掉后续功能。最终交付必须覆盖所有阶段。

### 14.1 第一阶段：项目基础和数据底座

目标：

> 建好完整产品的技术地基，确保原始数据能安全进入业务数据库，并且敏感字段、禁用字段不会泄漏到前台能力中。

必须完成：

- Next.js App Router + TypeScript 项目初始化
- Tailwind CSS + shadcn/ui 初始化
- Prisma 初始化
- Neon PostgreSQL 连接
- Clerk Auth 初始化
- Cloudflare R2 SDK 和环境变量配置
- Brevo 邮件配置
- Sentry 配置
- PostHog 配置
- 基础布局：英文前台、英文 Dashboard、中文 Admin
- 数据库 schema 第一版
- Excel 导入脚本
- 字段映射
- 英文字段标准化
- 禁用字段隔离
- 敏感字段隔离
- 公司 slug 生成
- 行业 slug 生成
- 产品关键词 slug 生成
- 城市 slug 生成
- 重复公司识别规则
- 数据导入日志
- Admin 操作日志基础表

验收标准：

- 原始 Excel 可以导入 Neon PostgreSQL。
- 禁用字段不能进入搜索索引。
- 敏感字段不能进入前台 API。
- Admin 可以看到导入批次和导入错误。
- 前台、Dashboard、Admin 三套布局可以区分语言和权限。

### 14.2 第二阶段：供应商数据库和英文 SEO 前台

目标：

> 完成面向海外用户的核心浏览和搜索体验。

必须完成：

- 首页 `/`
- 数据库搜索页 `/database`
- 公司资料页 `/companies/[slug]`
- 行业页 `/industries/[slug]`
- 产品关键词页 `/products/[slug]`
- 城市页 `/cities/[slug]`
- Pricing 页面 `/pricing`
- 法务页面
- PostgreSQL full-text search
- `pg_trgm` 模糊搜索
- 筛选：行业、省份、城市、产品关键词、成立时间、注册资金、企业规模、企业类型、贸易形式、企业性质、参展历史、有官网
- 排序：相关性、公司名称、成立时间、企业规模
- Free 搜索结果限制
- Free 每月 5 个供应商档案限制
- Free 禁止访问官网
- 付费用户字段可见控制
- sitemap
- robots
- canonical
- SEO title/meta 模板

验收标准：

- Free 用户每次搜索最多看 2 页，每页 10 条。
- Free 用户每月最多查看 5 个供应商档案。
- Free 用户看不到官网、注册资金、参展历史、企业性质。
- 登录付费用户可以看到对应套餐允许的字段。
- 禁用字段不出现在任何前台页面。

### 14.3 第三阶段：用户 Dashboard 和采购工作流

目标：

> 让用户不只是搜索，还能沉淀供应商研究工作流。

必须完成：

- Dashboard 首页 `/app`
- Saved Lists `/app/lists`
- Supplier Comparison `/app/compare`
- Exports `/app/exports`
- Reports `/app/reports`
- Billing `/app/billing`
- 创建供应商名单
- 重命名供应商名单
- 删除供应商名单
- 保存供应商
- 移除供应商
- 私人备注
- 供应商对比
- 搜索 URL 分享
- 最近查看记录
- 导出历史
- 报告下载历史

验收标准：

- Starter 最多保存 5 个名单、200 个供应商。
- Pro 可以保存无限名单、最多 3,000 个供应商。
- Team 支持共享名单和团队备注。
- 对比功能最多同时对比 5 个供应商。
- Dashboard 全部为英文。

### 14.4 第四阶段：订阅、支付、权限和额度

目标：

> 完成商业化闭环。

必须完成：

- 代码内产品和价格表配置
- 基于代码价格表临时创建 Stripe Checkout Session
- Stripe Billing
- Stripe Customer Portal
- Stripe webhook
- Free / Starter / Pro / Team 权限
- 年付价格
- 订阅升级
- 订阅降级
- 订阅取消
- 付款失败处理
- 发票入口
- 每月导出额度
- 每月档案查看额度
- 报告折扣权益
- Team seats
- 权限中间件
- 额度重置 GitHub Actions

验收标准：

- Starter 每月最多导出 200 条。
- Pro 每月最多导出 1,600 条。
- Team 每月最多导出 8,000 条。
- 超额导出会被拦截并提示升级。
- Stripe webhook 可以正确同步订阅状态。
- 取消订阅后权限按规则失效。

### 14.5 第五阶段：CSV 导出和 Cloudflare R2 文件交付

目标：

> 完成用户可带走数据的付费能力，但严格控制导出字段。

必须完成：

- 当前搜索结果导出
- Saved List 导出
- Comparison 导出
- 异步导出任务
- 导出文件生成
- R2 上传
- 私有下载链接
- 导出历史
- 导出额度扣减
- 导出失败重试
- 导出完成 Brevo 邮件通知

导出字段只能包含：

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

验收标准：

- CSV 永远不包含负责人、手机、电话、传真、邮箱、详细地址、邮编和禁用奖项/标签字段。
- 导出文件存储在 Cloudflare R2。
- 下载链接需要登录和权限校验。

### 14.6 第六阶段：PDF 报告产品

目标：

> 完成 Basic、Full、Premium、Canton Fair 报告的购买、下载和 Admin 管理。

必须完成：

- 报告列表
- 报告详情页
- Admin 人工上传 PDF
- PDF 上传到 R2
- 数据库写入报告文件 key、版本和发布状态
- Basic Industry PDF Report
- Full Industry PDF Report
- Premium Industry PDF Report
- Canton Fair Exhibitor Intelligence Report
- 单份购买
- 订阅折扣
- Pro/Team 包含报告权益
- 报告购买记录
- 报告下载权限
- Brevo 购买确认邮件
- Admin 报告管理

验收标准：

- 未购买用户不能下载报告。
- Starter 只能获得 Basic Report 折扣，不能免费拿 Full Report。
- PDF 不包含联系方式、完整供应商名单或 CSV 导出。
- 报告下载链接必须鉴权。

### 14.7 第七阶段：Custom Shortlist 和 Data License

目标：

> 完成高客单价服务和年度授权产品。

必须完成：

- Custom Shortlist 购买页
- Custom Shortlist 表单
- Custom Shortlist 支付
- Custom Shortlist Admin 订单管理
- Custom Shortlist R2 文件交付
- Data License 表单咨询流程
- Data License 合同状态
- Data License 年度授权文件交付
- Data License 客户管理
- Brevo 状态通知邮件

验收标准：

- Custom Shortlist 交付不包含私人联系人、手机号、邮箱或电话营销名单。
- Data License 只交付非敏感字段。
- Data License 不提供前台直接在线付款。
- Data License 不包含转售权。

### 14.8 第八阶段：中文 Admin 完整后台

目标：

> 让运营可以用中文管理数据、用户、订单、报告和合规请求。

必须完成：

- Admin 登录权限
- 管理员角色
- 展商列表
- 展商详情
- 原始数据查看
- 敏感字段二次点击查看
- 敏感字段查看日志
- 数据导入
- 数据清洗
- 字段映射
- 行业管理
- 产品关键词管理
- 城市/省份管理
- 官网 URL 校验
- 重复公司合并
- 用户管理
- 订阅管理
- 导出记录
- PDF 报告管理
- Custom Shortlist 订单管理
- Data License 客户管理
- 数据更正申请
- 删除申请
- 投诉记录
- SEO 页面管理
- 操作日志

验收标准：

- Admin 全部为中文。
- 敏感字段默认隐藏。
- 查看敏感字段必须记录管理员、时间、供应商和字段。
- 禁用字段只能用于原始数据排查，不能被配置到前台展示。

### 14.9 第九阶段：合规、通知、监控和上线检查

目标：

> 完成上线前的安全、合规和稳定性闭环。

必须完成：

- `/legal/privacy`
- `/legal/terms`
- `/legal/data-removal`
- `/legal/disclaimer`
- 数据更正流程
- 数据删除流程
- Brevo 邮件模板
- Sentry 错误告警
- PostHog 事件
- GitHub Actions 定时任务
- 数据备份说明
- 环境变量检查
- 权限回归测试
- 禁用字段泄漏测试
- 支付 webhook 测试
- 导出额度测试
- SEO 页面检查

验收标准：

- 禁用字段不出现在前台、Dashboard、CSV、PDF、API、搜索索引。
- 负责人、手机、电话、传真、邮箱、详细地址不出现在前台、Dashboard、CSV、PDF 和公开 API。
- 所有付费能力都有权限校验。
- 关键错误进入 Sentry。
- 关键转化事件进入分析工具。

## 15. 最终产品边界

这个产品可以做：

- 英文供应商搜索数据库
- 英文公司资料页
- 英文行业页
- 英文产品页
- 英文城市页
- 英文用户 Dashboard
- 中文 Admin
- CSV 导出非敏感字段
- 行业 PDF 报告
- Custom shortlist 服务

这个产品不要做：

- 个人联系人售卖
- 手机号售卖
- 邮箱售卖
- 电话营销名单
- 官方认证平台
- 验厂背书平台
- 使用创新奖、CF奖、多届参展、品牌展商、中华老字号、乡村振兴、新展商、专精特新、绿色奖、海关认证、高新展商等字段的筛选或评分

最终一句话：

> Sell supplier research workflow, not contact information.
