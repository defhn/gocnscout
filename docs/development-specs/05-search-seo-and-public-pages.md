# 05. 搜索、SEO 与公开页面

## 目标和边界

目标：公开前台页面要具备参与 Google 自然排名竞争的基础资格，尤其是行业、产品、城市、公司和报告页面。

不能承诺“保证前三”。Google 官方也明确没有任何 SEO 操作能保证进入某个固定排名。开发目标是满足可抓取、可索引、内容有用、结构清晰、加载快、没有虚假承诺、没有薄内容泛滥。

依据原则：

- Google Search Essentials 和 SEO Starter Guide：页面必须可抓取、可索引、标题和链接清晰、内容对用户有帮助。
- Google helpful content：内容必须为用户而写，不能为了搜索排名批量制造无价值页面。
- Google structured data：结构化数据用于帮助搜索引擎理解页面，但不能标注页面上不存在或不真实的内容。

## 站点基础信息

- 主站域名：`gocnscout.com`
- 支持邮箱：`gerry@gocnscout.com`
- 品牌显示：`gocnscout`
- 支付货币：仅 USD
- 前台语言：英文
- 不使用夸大、虚假、认证式文案

## 全站 SEO 硬规则

### Heading 结构

所有公开页面必须有合理的 heading 层级。

规则：

- 每个页面只能有 1 个 H1。
- H1 必须描述页面主主题，不能只写品牌名。
- H2 用于页面主要内容区块。
- 每个 H2 下尽量包含 2 个及以上 H3，用于拆分具体信息。
- 如果某个 H2 下确实只有一个内容点，可以不用强行制造 H3，但不能让整页长期只有 H1 和 H2。
- H4 只用于 H3 下面的细分内容，例如报告目录、FAQ 子项或复杂对比表。
- 不能跳级，例如 H2 后直接 H4。
- 不能为了视觉样式使用 heading 标签；样式用 CSS 控制。
- Footer、导航、按钮、卡片小标签不要滥用 H2/H3。

推荐结构：

```text
H1: Page topic
  H2: Main section
    H3: Subsection
    H3: Subsection
  H2: Main section
    H3: Subsection
    H3: Subsection
```

页面验收时必须检查 heading outline。

### Breadcrumb 面包屑

公开 SEO 页面必须有面包屑导航，首页除外。

必须有 breadcrumb 的页面：

- `/database`
- `/companies/[slug]`
- `/industries/[slug]`
- `/products/[slug]`
- `/cities/[slug]`
- `/reports`
- `/reports/[slug]`
- `/pricing`
- `/legal/privacy`
- `/legal/terms`
- `/legal/data-removal`
- `/legal/disclaimer`

不需要 breadcrumb 的页面：

- `/`
- `/app/*`
- `/admin/*`
- Stripe 成功/失败回跳页，如果页面非常短可以省略

Breadcrumb 示例：

- `Home > Database`
- `Home > Industries > Office Supplies`
- `Home > Products > Gel Pens`
- `Home > Cities > Shanghai`
- `Home > Reports > China Stationery Supplier Report`
- `Home > Legal > Privacy Policy`

技术要求：

- 面包屑必须在页面可见。
- 面包屑链接必须可点击，最后一项为当前页文本。
- 公开页面需要输出 `BreadcrumbList` JSON-LD。
- Breadcrumb 名称必须和页面主题一致，不能堆关键词。

### 内容真实性

所有统计、分布、样本、供应商数量、产品关键词、城市分布都必须来自数据库真实查询结果。

不能写：

- `verified suppliers`
- `certified factories`
- `official Canton Fair database`
- `audited manufacturers`
- `guaranteed suppliers`
- `direct contacts included`
- `email list included`
- `phone numbers included`
- 无数据支持的 “top”、“best”、“leading”、“trusted”

可以写：

- `public-source supplier profiles`
- `structured supplier data`
- `supplier discovery`
- `sourcing research`
- `buyer verification checklist`
- `official website links when available`
- `trade fair exhibitor profiles`

### 页面质量

公开 SEO 页面必须满足：

- 有唯一 URL、title、meta description、H1。
- 页面主体内容不能只是一张列表。
- 至少包含一个数据支持的说明模块。
- 至少包含一个用户决策辅助模块，例如验证清单、筛选建议、相关页面。
- 页面上的数字必须可由数据库查询得到。
- 页面没有足够数据时不应 index。

### 索引规则

允许 index：

- 首页
- Pricing
- Reports
- 已发布报告详情页
- 有足够数据的行业页
- 有足够数据的产品页
- 有足够数据的城市页
- 有足够公开字段的公司页

默认 noindex：

- `/database` 搜索结果页
- 带多个筛选参数的结果页
- 用户 Dashboard
- Admin
- 私有下载链接
- 数据太少的行业/产品/城市页
- 被下架的公司页

建议 index 阈值：

- 行业页：至少 30 个供应商。
- 产品页：至少 10 个供应商。
- 城市页：至少 30 个供应商。
- 公司页：必须有公司名、行业、城市、省份、主营产品。

如果低于阈值：

- 页面可以存在供用户访问。
- meta robots 设置为 `noindex,follow`。
- 不进入 sitemap。

## 搜索字段

搜索索引只包含：

- Company Name
- Industry
- Province
- City
- Main Products
- Product Keywords
- Company Type
- Trade Mode
- Ownership Type

不索引：

- 负责人
- 手机
- 电话
- 传真
- 邮箱
- 详细地址
- 邮编
- 所有禁用奖项/标签字段

## 搜索能力

必须支持：

- 关键词搜索
- 模糊搜索，基于 `pg_trgm`
- 行业筛选
- 省份筛选
- 城市筛选
- 产品关键词筛选
- 成立年份筛选
- 注册资金筛选
- 企业规模筛选
- 企业类型筛选
- 贸易形式筛选
- 企业性质筛选
- 参展历史筛选
- 有官网筛选

排序：

- relevance
- company name
- year established
- company size

## 搜索分页

| 套餐 | 页数 | 每页 | 单次搜索最多可见 |
|---|---:|---:|---:|
| Free | 2 | 10 | 20 |
| Starter | 20 | 25 | 500 |
| Pro | 80 | 25 | 2,000 |
| Team | 200 | 25 | 5,000 |

公开搜索页 `/database` 不作为 SEO 落地页。它是产品体验页，不进入 sitemap，默认 `noindex,follow`。

## 页面结构总要求

所有公开页面必须包含：

- Header
- Main content
- Footer
- Breadcrumb，除首页和纯应用页外
- 明确 CTA
- 合规免责声明或轻量边界说明
- 内链到相关行业、产品、城市、报告或数据库

## 首页 `/`

### 搜索意图

首页主要服务品牌词、直接访问、产品理解和转化，不承担长尾关键词排名主力。

### Title

`gocnscout | China Supplier Discovery and Sourcing Research`

### Meta description

`Search structured China supplier profiles by industry, product, location, company type, trade mode, and public sourcing signals.`

### H1

`Find China trade fair suppliers worth shortlisting.`

### 页面布局

1. Header
   - Logo: `gocnscout`
   - Nav: `Database`, `Industries`, `Products`, `Cities`, `Reports`, `Pricing`
   - CTA: `Sign in`
2. Hero
   - H1
   - Subcopy: `Search structured supplier profiles by product, industry, location, company size, trade mode, and exhibition history.`
   - Search placeholder: `Search products, industries, or company names`
   - Primary CTA: `Search suppliers`
   - Secondary CTA: `Browse reports`
3. Data-backed overview
   - `Supplier profiles`
   - `Industries`
   - `Cities`
   - `Product keywords`
   - All numbers must come from database counts.
4. Browse by industry
   - Show 12-20 industries with supplier counts.
5. Browse by product
   - Show 12-20 product keywords with supplier counts.
6. Browse by city
   - Show 12-20 cities with supplier counts.
7. How it works
   - `Search public supplier profiles`
   - `Compare company and product fields`
   - `Export non-sensitive supplier data`
   - `Verify suppliers independently`
8. Reports CTA
   - Title: `Need a market overview first?`
   - Copy: `Browse industry reports built from structured supplier profile data.`
9. Disclaimer strip
   - `gocnscout is for supplier discovery and research. It does not verify, certify, audit, endorse, or guarantee suppliers.`

### Heading 建议

```text
H1: Find China trade fair suppliers worth shortlisting
  H2: Browse supplier data
    H3: Browse by industry
    H3: Browse by product
    H3: Browse by city
  H2: Supplier research before outreach
    H3: Search public supplier profiles
    H3: Compare sourcing fields
  H2: Industry reports
    H3: What reports include
    H3: Browse available reports
```

### 不能出现

- 不展示联系人、手机、邮箱。
- 不写官方认证。
- 不写保证找到供应商。
- 不写平台已验证供应商。

### Structured data

- `Organization`
- `WebSite`
- `SearchAction`

## 数据库页 `/database`

### 页面目的

提供核心搜索和筛选体验，不作为可索引 SEO 页面。

### Meta robots

`noindex,follow`

### H1

`Supplier Database`

### 页面布局

1. Header
   - Title: `Supplier Database`
   - Subtitle: `Search public supplier profiles and sourcing signals.`
2. Search bar
3. Filter sidebar
   - Industry
   - Province
   - City
   - Product Keywords
   - Year Established
   - Registered Capital
   - Company Size
   - Company Type
   - Trade Mode
   - Ownership Type
   - Exhibition History
   - Has Official Website
4. Results toolbar
   - Result count
   - Sort
   - Clear filters
   - Export CSV，付费可用
5. Results table/cards
   - Company Name
   - Industry
   - Province
   - City
   - Main Products
   - Company Type
   - Trade Mode，付费或详情页可见
6. Pagination
7. Upgrade prompt，Free 触发限制时显示

### Heading 建议

```text
H1: Supplier Database
  H2: Search supplier profiles
    H3: Keyword search
    H3: Filters
  H2: Supplier results
    H3: Result count and sorting
    H3: Supplier profile previews
  H2: Export and saved research
    H3: CSV export
    H3: Saved lists
```

### 固定提示

Free 限制：

`Free accounts can preview up to 20 results per search and view 5 supplier profiles per month. Upgrade to continue your supplier research.`

官网锁定：

`Official website links are available on paid plans.`

### 验收标准

- Free 每次搜索最多看到 20 条。
- Free 不显示官网。
- 搜索结果不含敏感字段和禁用字段。
- 多筛选 URL 不进入 sitemap。

## 行业页 `/industries/[slug]`

### 搜索意图

目标关键词：

- `China [industry] suppliers`
- `[industry] suppliers in China`
- `China [industry] trade fair exhibitors`

### Title 模板

`China [Industry] Suppliers and Trade Fair Exhibitor Profiles`

### Meta description 模板

`Explore [count] China [industry] supplier profiles by city, product keywords, company type, trade mode, and public sourcing fields.`

### H1

`China [Industry] Supplier Profiles`

### 页面布局

1. Breadcrumb
   - Home > Industries > [Industry]
2. Hero
   - H1
   - Intro paragraph using real count, real top cities, real common product keywords.
   - CTA: `Search [Industry] suppliers`
   - CTA: `Download industry report`，如果报告已发布
3. Data summary cards
   - Supplier profiles
   - Top province
   - Top city
   - Common trade mode
4. Industry overview
   - 150-250 words.
   - Must be generated from database fields and generic sourcing context.
   - Must not invent market growth, revenue, export volume, or ranking claims.
5. Regional distribution
   - Top 5 provinces and cities.
   - Use counts and percentages from database.
6. Product keyword clusters
   - Top 10 product keywords from this industry.
   - Link to product pages.
7. Company profile breakdown
   - Company Size distribution
   - Company Type distribution
   - Trade Mode distribution
8. Sample supplier profiles
   - 10-20 companies.
   - Show only allowed fields.
   - Free users do not see official website.
9. Buyer verification checklist
   - Use fixed checklist.
10. Related pages
   - Related industries
   - Top city pages
   - Related product pages
11. Disclaimer

### Heading 建议

```text
H1: China [Industry] Supplier Profiles
  H2: [Industry] supplier data overview
    H3: Supplier profile count
    H3: Top provinces and cities
  H2: Product keywords in [Industry]
    H3: Common product keywords
    H3: Related product pages
  H2: Company profile breakdown
    H3: Company size distribution
    H3: Company type and trade mode
  H2: Sample supplier profiles
    H3: Supplier list preview
    H3: How to use this shortlist
  H2: Buyer verification checklist
    H3: What to confirm before outreach
    H3: What this page does not verify
```

### Required original value

行业页必须有数据库统计和聚类，不能只写泛泛介绍。

### Noindex 条件

- Supplier count < 30
- 没有产品关键词
- 没有城市/省份分布

### Structured data

- `BreadcrumbList`
- `ItemList` for sample suppliers
- `Dataset` only if page clearly describes a dataset and does not expose private data

## 产品页 `/products/[slug]`

### 搜索意图

目标关键词：

- `China [product] suppliers`
- `[product] manufacturers in China`
- `[product] supplier profiles`

注意：如果数据不能证明 manufacturer，就不要在正文中说 manufacturers；title 可根据关键词策略使用 supplier profiles 更稳。

### Title 模板

`China [Product] Supplier Profiles`

### Meta description 模板

`Find China supplier profiles related to [product], including industry, city, main products, company type, and trade mode where available.`

### H1

`China [Product] Supplier Profiles`

### 页面布局

1. Breadcrumb
2. Hero
   - H1
   - Count-based intro.
   - CTA: `Search [Product] suppliers`
3. Product keyword overview
   - Explain this page is based on matching product keywords and main product fields.
   - Do not claim all suppliers manufacture the product.
4. Matching supplier summary
   - Total matching suppliers
   - Top industries
   - Top provinces
   - Top cities
5. Related product keywords
   - Link to sibling product pages.
6. Supplier preview list
   - 10-20 sample profiles.
7. Suggested database filters
   - Industry
   - Province
   - Company Type
   - Trade Mode
8. Buyer verification tips
9. Related industry and city pages

### Heading 建议

```text
H1: China [Product] Supplier Profiles
  H2: [Product] supplier matches
    H3: Matching supplier count
    H3: Related industries
  H2: Regional distribution
    H3: Top provinces
    H3: Top cities
  H2: Supplier preview
    H3: Sample supplier profiles
    H3: Suggested database filters
  H2: Buyer verification tips
    H3: Confirm product availability
    H3: Check supplier fit before ordering
```

### Fixed disclaimer

`Product matches are based on supplier profile fields such as main products and product keywords. Buyers should confirm current product availability directly with suppliers through official channels.`

### Noindex 条件

- Matching supplier count < 10
- Product term is too broad or ambiguous
- No sample supplier can be shown with useful fields

### Structured data

- `BreadcrumbList`
- `ItemList`

## 城市页 `/cities/[slug]`

### 搜索意图

目标关键词：

- `[city] China suppliers`
- `[city] supplier profiles`
- `[city] trade fair exhibitors`

### Title 模板

`Supplier Profiles in [City], China`

### Meta description 模板

`Browse supplier profiles in [City], China by industry, product keywords, company type, trade mode, and public sourcing fields.`

### H1

`Supplier Profiles in [City], China`

### 页面布局

1. Breadcrumb
2. Hero
   - Count-based intro.
   - CTA: `Search suppliers in [City]`
3. City supplier overview
   - Use real count.
   - Mention top industries only if data supports them.
4. Industry distribution
   - Top 10 industries in city.
5. Product keyword distribution
   - Top 10 product keywords.
6. Company profile distribution
   - Company Type
   - Trade Mode
   - Company Size
7. Sample suppliers
   - 10-20 profiles.
8. Related city + industry links
9. Buyer verification checklist
10. Disclaimer

### Heading 建议

```text
H1: Supplier Profiles in [City], China
  H2: [City] supplier overview
    H3: Supplier profile count
    H3: Main industries
  H2: Industry and product distribution
    H3: Top industries
    H3: Common product keywords
  H2: Company profile breakdown
    H3: Company type distribution
    H3: Trade mode distribution
  H2: Sample suppliers in [City]
    H3: Supplier profile preview
    H3: Related city and industry pages
```

### Noindex 条件

- Supplier count < 30
- No industry distribution
- No sample supplier list

### Structured data

- `BreadcrumbList`
- `ItemList`

## 公司页 `/companies/[slug]`

### 搜索意图

目标：

- Company name searches
- Supplier profile lookup
- Due diligence support

### Title 模板

`[Company Name] Supplier Profile | gocnscout`

### Meta description 模板

`View public supplier profile fields for [Company Name], including industry, city, main products, company type, trade mode, and sourcing research notes.`

### H1

`[Company Name] Supplier Profile`

### 页面布局

1. Breadcrumb
2. Header
   - Company Name
   - Industry
   - Province and City
   - Badge: `Public-source profile`
3. Primary actions
   - `Visit Official Website`，付费可见且官网存在
   - `Save to list`，付费可见
   - `Compare`，付费可见
4. Profile fields
   - Industry
   - Province
   - City
   - Year Established，按权限
   - Registered Capital，按权限
   - Company Size
   - Company Type
   - Trade Mode
   - Ownership Type，按权限
5. Products
   - Main Products
   - Product Keywords
6. Exhibition history
   - 按套餐可见
   - 不解释为认证或稳定背书
7. Buyer verification checklist
8. Similar suppliers
   - 付费可见
   - Based on industry + product keywords + city/province
9. Report incorrect data / Request removal
10. Disclaimer

### Heading 建议

```text
H1: [Company Name] Supplier Profile
  H2: Company profile
    H3: Location and industry
    H3: Company type and size
  H2: Products and keywords
    H3: Main products
    H3: Product keywords
  H2: Sourcing research notes
    H3: Exhibition history
    H3: Buyer verification checklist
  H2: Related supplier research
    H3: Similar suppliers
    H3: Related industry and city pages
```

### 买家验证清单固定文案

- Confirm the company website and current business status.
- Request updated product catalogs and specifications.
- Ask for export experience and production capacity details.
- Verify certifications directly with issuing organizations when relevant.
- Use samples, contracts, and independent checks before placing orders.

### 公司页固定免责声明

`This profile is compiled for supplier discovery and research. It is not an official certification, endorsement, audit, or verification of the company.`

### Noindex 条件

- Missing company name
- Missing industry
- Missing city/province
- Missing main products
- Company is removed or hidden by request

### Structured data

- `BreadcrumbList`
- `Organization` or `ProfilePage` only with fields visible on page.
- Do not include hidden phone, email, address, or contact person in JSON-LD.

## Pricing 页 `/pricing`

### 搜索意图

品牌和商业意图。主要用于转化，不是长尾 SEO 主力。

### Title

`Pricing | gocnscout`

### Meta description

`Choose a gocnscout plan for supplier research, saved lists, CSV exports, industry reports, and team workflows.`

### H1

`Pricing`

### 页面布局

1. Header
   - Title
   - Subtitle: `Choose a plan for supplier research, exports, reports, and team workflows.`
2. Plan cards
   - Free
   - Starter
   - Pro
   - Team
3. Plan comparison table
   - Profile views
   - Search limits
   - Export quota
   - Saved lists
   - Reports
   - Team seats
4. Report pricing
5. Custom Shortlist
6. Data License consultation
7. FAQ
8. Disclaimer

### Heading 建议

```text
H1: Pricing
  H2: Choose a plan
    H3: Starter
    H3: Pro
    H3: Team
  H2: Reports and custom research
    H3: Industry reports
    H3: Custom Shortlist
  H2: Data License
    H3: What is included
    H3: How consultation works
  H2: Pricing FAQ
    H3: Private contact information
    H3: Supplier verification
```

### FAQ 必须包含

`Do plans include private contact information?`

`No. Plans do not include private contacts, mobile numbers, phone numbers, fax numbers, email addresses, or full street addresses.`

`Are suppliers verified?`

`No. Profiles are for discovery and research. Buyers should independently verify suppliers.`

`Can I export supplier data?`

`Paid plans include monthly CSV export limits for non-sensitive fields.`

`What currency do you charge in?`

`All prices are in USD.`

`Is Data License available online?`

`Data License is handled through consultation. Submit the inquiry form and we will follow up by email.`

### Structured data

- `FAQPage`
- `BreadcrumbList`

## 报告列表页 `/reports`

### Title

`Industry Reports | gocnscout`

### Meta description

`Browse industry and exhibitor intelligence reports based on structured supplier profile data. Reports do not include private contact information.`

### H1

`Industry Reports`

### 页面布局

1. Header
   - Title
   - Subtitle: `Market-style reports built from structured supplier profile data.`
2. Report filters
   - Type
   - Industry
   - Price
3. Report cards
   - Report title
   - Type
   - Price
   - Included sections
   - Updated date
   - CTA: `View report`
4. What reports include
5. What reports do not include
6. Disclaimer

### Heading 建议

```text
H1: Industry Reports
  H2: Browse reports
    H3: Report types
    H3: Available reports
  H2: What reports include
    H3: Data-backed sections
    H3: Sample supplier profiles
  H2: What reports do not include
    H3: No private contact information
    H3: No supplier verification
```

### Noindex 条件

If no reports are published, page can be indexable only if it has useful explanatory content and clear upcoming report information. Otherwise noindex.

### Structured data

- `BreadcrumbList`
- `ItemList`

## 报告详情页 `/reports/[slug]`

### Title 模板

`[Report Name] | gocnscout`

### Meta description 模板

`Download the [Report Name], a supplier research report based on structured profile data. Does not include private contact information.`

### H1

`[Report Name]`

### 页面布局

1. Breadcrumb
2. Report hero
   - Report title
   - Report type
   - Price
   - Updated date
   - CTA: `Buy report`
3. Data basis
   - Industry/product/city covered
   - Supplier profile count used
   - Source type: structured supplier profile data
4. What is included
5. What is not included
   - No private contacts
   - No mobile numbers
   - No email addresses
   - No full supplier list
   - No factory audit
6. Sample table of contents
7. Screenshots or preview images，if Admin uploaded them
8. FAQ
9. Disclaimer

### Heading 建议

```text
H1: [Report Name]
  H2: Report overview
    H3: Coverage
    H3: Data basis
  H2: What is included
    H3: Report sections
    H3: Sample supplier profiles
  H2: What is not included
    H3: No private contact information
    H3: No supplier verification
  H2: Buy this report
    H3: Price
    H3: Delivery
```

### Fixed disclaimer

`This report is based on structured exhibitor and supplier profile data available in gocnscout. It is for supplier discovery and research only. It does not include private contact information and does not verify, certify, audit, endorse, or guarantee any supplier.`

### Structured data

- `BreadcrumbList`
- `Product` may be used for the report as a digital product only if price and availability are visible.
- `FAQPage` if FAQ is visible on page.

## Data License 咨询页 `/app/data-license`

该页面需要登录，不作为 SEO 页面。

Meta robots:

`noindex,nofollow`

页面文案：

`Request access to an annual non-sensitive supplier dataset for internal commercial research. Data License does not include resale rights, private contacts, mobile numbers, phone numbers, fax numbers, email addresses, full addresses, or ignored award/tag fields.`

表单字段：

- Company name
- Work email
- Website
- Intended use
- Expected data scope
- Notes

## 法律页面

法律页面可 index，但不是 SEO 主力。

必须包含：

- `/legal/privacy`
- `/legal/terms`
- `/legal/data-removal`
- `/legal/disclaimer`

法律页面如果有本文档未明确的内容，开发不得自行编造，必须先询问项目负责人。

## Internal linking

必须实现：

- 首页链接到热门行业、产品、城市、报告。
- 行业页链接到相关产品页、城市页、数据库筛选页、报告页。
- 产品页链接到相关行业页、城市页、数据库筛选页。
- 城市页链接到行业 + 城市组合、产品页。
- 公司页链接到行业页、城市页、相关产品页。
- 报告页链接到相关行业、产品、数据库筛选页。

锚文本必须自然，不堆关键词。

## Structured data 总规则

允许：

- `Organization`
- `WebSite`
- `SearchAction`
- `BreadcrumbList`
- `ItemList`
- `FAQPage`
- `Product`，仅用于付费报告
- `Dataset`，仅在页面清楚描述数据集且不暴露敏感数据时使用
- `ProfilePage` 或 `Organization`，仅用于公司页可见字段

禁止：

- 在 JSON-LD 中加入页面不可见字段。
- 加入联系人、手机、电话、邮箱、详细地址。
- 使用 Review、AggregateRating，除非有真实可验证评价系统。
- 使用 LocalBusiness，除非有真实本地业务信息和地址展示。

## URL 和参数规则

可索引 URL：

- `/industries/[slug]`
- `/products/[slug]`
- `/cities/[slug]`
- `/companies/[slug]`
- `/reports/[slug]`

不可索引 URL：

- `/database?keyword=...`
- `/database?industry=...&city=...`
- 任意多筛选组合参数页
- `/app/*`
- `/admin/*`

如果未来要做可索引的组合页，必须单独生成静态路由，例如：

- `/industries/[industry]/cities/[city]`
- `/products/[product]/cities/[city]`

不能直接让筛选参数页进入索引。

## Sitemap 和 robots

Sitemap 包含：

- 首页
- Pricing
- Reports
- indexable industry pages
- indexable product pages
- indexable city pages
- indexable company pages
- published report pages
- legal pages

Sitemap 不包含：

- noindex 页面
- 参数页
- Dashboard
- Admin
- 私有下载链接

Robots:

- 允许抓取公开页面。
- 禁止抓取 `/admin/`。
- 禁止抓取 `/app/`。
- 禁止抓取私有文件下载路径。

## Core Web Vitals 和 UX

目标：

- LCP < 2.5s
- INP < 200ms
- CLS < 0.1

实现要求：

- 列表页必须分页，不做无限滚动作为唯一导航。
- 图片使用 Next Image 或等效优化。
- 报告预览图片必须压缩。
- 表格在移动端可横向滚动或切换卡片布局。
- 筛选交互不能导致布局大幅跳动。

## 全站 footer

Footer 必须包含：

- Product: `Database`, `Reports`, `Pricing`
- Browse: `Industries`, `Products`, `Cities`
- Legal: `Privacy`, `Terms`, `Data Removal`, `Disclaimer`
- Contact: `gerry@gocnscout.com`
- Copy: `© gocnscout. Supplier discovery and sourcing research based on public-source profile data.`

## 页面验收标准

每个公开页面上线前必须检查：

- title 唯一。
- meta description 唯一。
- H1 唯一。
- Heading 层级合理，H2/H3 不跳级。
- 主要 H2 下尽量有 2 个及以上 H3；例外必须是内容确实不需要拆分。
- Breadcrumb 可见，除首页和纯应用页外。
- BreadcrumbList JSON-LD 正确，且不包含虚假层级。
- canonical 正确。
- noindex 规则正确。
- 没有敏感字段。
- 没有禁用奖项/标签字段。
- 没有虚假认证或保证性文案。
- 数字和统计来自数据库。
- 页面有内链。
- 页面有免责声明或边界说明。
- sitemap 是否包含符合规则。
- 移动端可用。
