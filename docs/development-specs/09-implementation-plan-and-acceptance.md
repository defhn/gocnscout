# 09. 开发顺序与验收标准

## 开发原则

本项目不是 MVP。可以分阶段开发，但每一阶段都必须服务于完整产品交付。

## Phase 1: 项目基础

完成：

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + Neon
- Clerk
- Stripe
- R2
- Brevo
- Sentry
- 分析工具
- PostHog
- 仅 USD 支付配置
- 基础路由布局

验收：

- 应用可启动。
- 数据库可连接。
- 登录可用。
- Admin 和用户区域权限隔离。

## Phase 2: 数据导入和字段安全

完成：

- Excel 导入脚本。
- 字段映射。
- 公开字段、敏感字段、禁用字段分表或隔离。
- slug 生成。
- 搜索向量生成。
- Admin 导入记录。

验收：

- 禁用字段不进入搜索索引。
- 敏感字段不进入前台 API。
- 导入失败有错误报告。

## Phase 3: 公开前台和搜索

完成：

- 首页。
- `/database`。
- 公司页。
- 行业页。
- 产品页。
- 城市页。
- SEO metadata。
- sitemap。
- `05-search-seo-and-public-pages.md` 中定义的 title、meta、H1、noindex、结构化数据、内链和内容真实性规则。
- 每个公开页面只有 1 个 H1，H2/H3 层级合理。
- 除首页和纯应用页外，公开页面必须有可见 breadcrumb 和 BreadcrumbList JSON-LD。

验收：

- Free 每次搜索最多 20 条可见。
- Free 每月最多 5 个档案。
- Free 不能访问官网。
- 禁用字段不出现在页面源码和 API 返回中。
- 统计数字、分布、样本供应商和报告说明均来自数据库或 Admin 已上传内容，不能编造。
- Heading outline 检查通过。
- 面包屑导航检查通过。

## Phase 4: Dashboard

完成：

- `/app`。
- Saved Lists。
- Supplier Comparison。
- Exports。
- Reports。
- Billing。

验收：

- Dashboard 全英文。
- Saved Lists 权限符合套餐。
- 对比最多 5 个供应商。

## Phase 5: 订阅和权限

完成：

- Stripe Checkout。
- Stripe Billing。
- Customer Portal。
- Webhook。
- 套餐权限。
- 月度额度。

验收：

- Starter 200/月导出。
- Pro 1,600/月导出。
- Team 8,000/月导出。
- 超额被服务端拦截。

## Phase 6: 导出和文件交付

完成：

- 异步导出。
- CSV 生成。
- R2 上传。
- 私有下载。
- 邮件通知。

验收：

- CSV 只包含白名单字段。
- 导出文件必须鉴权下载。
- 失败导出不扣额度。

## Phase 7: 报告和购买

完成：

- 报告列表。
- 报告详情。
- 报告购买。
- 报告下载。
- 报告权益和折扣。
- Admin 报告管理。

验收：

- 未购买不能下载。
- PDF 不包含敏感字段和完整供应商名单。
- Starter 不免费赠送 Full Report。

## Phase 8: Custom Shortlist 和 Data License

完成：

- Custom Shortlist 表单和支付。
- Admin 订单处理。
- R2 文件交付。
- Data License 咨询表单。
- Data License inquiry 后台管理。

验收：

- 交付不包含联系人、手机、邮箱。
- Data License 不提供前台直接付款。
- Data License 不包含转售权。

## Phase 9: 中文 Admin 和合规闭环

完成：

- 中文 Admin 完整模块。
- 敏感字段查看日志。
- 删除/更正请求。
- 操作日志。
- 监控和分析事件。

验收：

- Admin 全中文。
- 敏感字段默认隐藏。
- 所有敏感字段查看都有日志。
- 删除/更正流程可闭环。

## 上线总验收

必须全部满足：

- 前台英文。
- Dashboard 英文。
- Admin 中文。
- 所有套餐权限正确。
- 所有导出额度正确。
- 禁用字段没有泄漏。
- 敏感字段没有泄漏。
- Stripe webhook 幂等。
- R2 文件下载鉴权。
- Sentry 可收到错误。
- 分析事件可收到关键转化。
- 所有价格均为 USD。
- 法律页面没有未确认的自行编造条款。
- `10-api-contracts-and-server-boundaries.md` 中的核心 API 契约已实现。
- `11-environment-and-integration-runbook.md` 中的联调清单已通过。
- `12-end-to-end-data-flows.md` 中的核心端到端链路已跑通。
- 前台、Dashboard、Admin 都读取真实数据库和第三方服务状态，不使用静态假数据作为完成状态。
- `npm run build` 通过。
