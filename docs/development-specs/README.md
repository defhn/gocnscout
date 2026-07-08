# gocnscout 开发规格索引

本目录是 `gocnscout` 的开发级交付文档。目标是让开发者在不反复追问产品细节的情况下，能按统一规则完成完整版本。

完整版本不是 MVP。可以分阶段开发，但最终必须覆盖所有文档中的功能、权限、字段、合规和商业化规则。

## 文档清单

1. [产品范围与路由](01-product-scope-and-routes.md)
2. [技术架构与项目约定](02-technical-architecture.md)
3. [数据模型与字段策略](03-data-model-and-field-policy.md)
4. [权限、套餐与额度](04-permissions-plans-and-quotas.md)
5. [搜索、SEO 与公开页面](05-search-seo-and-public-pages.md)
6. [Dashboard 与中文 Admin](06-dashboard-and-admin.md)
7. [支付、报告、导出与交付](07-billing-reports-exports-delivery.md)
8. [数据导入、合规与运营](08-data-ingestion-compliance-ops.md)
9. [开发顺序与验收标准](09-implementation-plan-and-acceptance.md)
10. [API 契约与服务端边界](10-api-contracts-and-server-boundaries.md)
11. [环境变量与联调 Runbook](11-environment-and-integration-runbook.md)
12. [端到端数据流](12-end-to-end-data-flows.md)
13. [全量开发执行步骤](13-full-development-execution-plan.md)

## 全局硬规则

- 前端公开网站必须是英文。
- 用户 Dashboard 必须是英文。
- Admin 必须是中文。
- 品牌显示使用 `gocnscout`。
- 只收 USD。
- 分析工具使用 PostHog。
- Data License 走表单咨询，不做前台直接付款。
- PDF 报告由 Admin 人工上传，并同步到 R2、数据库、前台和 Dashboard 下载权限。
- 不公开、不导出、不售卖负责人、手机、电话、传真、邮箱、详细地址、邮编。
- 不使用创新奖、CF奖、多届参展、品牌展商、中华老字号、乡村振兴特色展商、新展商、专精特新、绿色奖展商、海关认证展商、高新展商等字段做前台展示、筛选、评分、SEO、导出或报告。
- 供应商数据产品卖的是 research workflow，不是 contact information。
- 文档没有明确的法律、服务能力、退款、授权范围问题，必须先询问项目负责人，不能自行编造。
- 前端页面必须通过 API 或 server-only service 读取真实数据库数据，不能用静态假数据伪装完成。
- 填完环境变量后必须按 `11-environment-and-integration-runbook.md` 完成联调验收。
- 核心链路必须按 `12-end-to-end-data-flows.md` 跑通。
