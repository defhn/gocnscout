# 01. 产品范围与路由

## 产品定位

产品名称：`gocnscout`

主站域名：`gocnscout.com`

支持邮箱：`gerry@gocnscout.com`

支付货币：仅 USD

定位：

> A supplier discovery and sourcing intelligence database for China trade fair exhibitors.

产品不是联系人数据库，不是官方广交会数据库，不是验厂认证平台。

## 用户角色

| 角色 | 说明 |
|---|---|
| Visitor | 未登录访问者，可访问 SEO 页面和受限数据库搜索 |
| Free User | 已登录免费用户，可有限搜索和每月查看 5 个供应商档案 |
| Starter User | 个人买家、小卖家、小进口商 |
| Pro User | 采购代理、进口商、批发团队 |
| Team User | 团队成员 |
| Team Admin | 管理团队席位、共享名单和账单 |
| Data License Customer | 年度数据授权客户 |
| Admin | 中文后台管理员 |

## 页面路由

### 英文公开前台

| 路由 | 页面 | 登录要求 | 说明 |
|---|---|---:|---|
| `/` | Home | 否 | 首页、搜索入口、行业入口、报告入口 |
| `/database` | Supplier Database | 否 | 供应商搜索页，按套餐限制结果和字段 |
| `/companies/[slug]` | Supplier Profile | 否 | 公司资料页，Free 每月限 5 个 |
| `/industries/[slug]` | Industry Page | 否 | 行业 SEO 页面 |
| `/products/[slug]` | Product Keyword Page | 否 | 产品关键词 SEO 页面 |
| `/cities/[slug]` | City Page | 否 | 城市 SEO 页面 |
| `/reports` | Reports Listing | 否 | 报告列表 |
| `/reports/[slug]` | Report Detail | 否 | 报告详情和购买入口 |
| `/pricing` | Pricing | 否 | 套餐和报告价格 |
| `/legal/privacy` | Privacy | 否 | 隐私政策 |
| `/legal/terms` | Terms | 否 | 服务条款 |
| `/legal/data-removal` | Data Removal | 否 | 删除/更正申请 |
| `/legal/disclaimer` | Disclaimer | 否 | 免责声明 |

### 英文用户 Dashboard

| 路由 | 页面 | 登录要求 | 说明 |
|---|---|---:|---|
| `/app` | Dashboard Home | 是 | 最近查看、保存名单、导出额度、报告 |
| `/app/lists` | Saved Lists | 是 | 供应商名单 |
| `/app/lists/[id]` | List Detail | 是 | 名单详情、备注、导出 |
| `/app/compare` | Supplier Comparison | 是 | 最多对比 5 个供应商 |
| `/app/exports` | Exports | 是 | 导出历史和下载 |
| `/app/reports` | Purchased Reports | 是 | 已购报告和下载 |
| `/app/custom-shortlist` | Custom Shortlist | 是 | 定制名单申请 |
| `/app/data-license` | Data License Inquiry | 是 | 年度数据授权咨询表单 |
| `/app/billing` | Billing | 是 | 当前套餐、发票、升级、取消 |
| `/app/settings` | Account Settings | 是 | 用户设置 |

### 中文 Admin

| 路由 | 页面 | 登录要求 | 说明 |
|---|---|---:|---|
| `/admin` | 后台首页 | 是，Admin | 管理概览 |
| `/admin/suppliers` | 展商列表 | 是，Admin | 数据管理 |
| `/admin/suppliers/[id]` | 展商详情 | 是，Admin | 原始字段、清洗字段、状态 |
| `/admin/imports` | 数据导入 | 是，Admin | Excel 导入和错误查看 |
| `/admin/taxonomy` | 分类管理 | 是，Admin | 行业、产品关键词、城市、省份 |
| `/admin/users` | 用户管理 | 是，Admin | 用户、套餐、状态 |
| `/admin/subscriptions` | 订阅管理 | 是，Admin | Stripe 同步状态 |
| `/admin/exports` | 导出记录 | 是，Admin | 导出审计 |
| `/admin/reports` | PDF 报告管理 | 是，Admin | 报告上传、价格、状态 |
| `/admin/shortlists` | 定制名单订单 | 是，Admin | Custom Shortlist 交付 |
| `/admin/licenses` | 数据授权客户 | 是，Admin | Data License 管理 |
| `/admin/requests` | 更正/删除申请 | 是，Admin | 合规请求处理 |
| `/admin/audit-logs` | 操作日志 | 是，Admin | 管理员操作审计 |

## 完整产品范围

必须实现：

- 英文 SEO 前台
- 供应商搜索数据库
- 公司资料页
- 用户登录和套餐权限
- Saved Lists
- Supplier Comparison
- CSV 导出
- PDF 报告购买和下载
- Custom Shortlist
- Data License 管理
- 中文 Admin
- 数据导入和清洗
- 删除/更正流程
- 支付、邮件、监控、分析

不做：

- 公开联系人
- 手机号/邮箱售卖
- 电话营销名单
- 官方认证或验厂背书
- 使用禁用奖项/标签字段作为卖点或筛选能力

## 文案真实性原则

所有页面、按钮、报告、邮件和提示文案必须符合实际可提供服务。

如果开发、运营或文案遇到本文档没有明确说明的服务能力、法律条款、退款规则或授权范围，必须先询问项目负责人，不能自行编造。

不能写：

- 已验证供应商
- 官方认证
- 官方广交会数据库
- 验厂通过
- 保证找到供应商
- 直接联系负责人
- 包含手机号或邮箱
- 完整官方参展商名单

可以写：

- Public-source supplier profiles
- Supplier discovery
- Sourcing research
- Buyer-side verification checklist
- Official website links, when available
- Structured exhibitor and supplier data
