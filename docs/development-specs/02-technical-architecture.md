# 02. 技术架构与项目约定

## 技术栈

| 模块 | 技术 |
|---|---|
| 全栈框架 | Next.js App Router + TypeScript |
| UI | Tailwind CSS + shadcn/ui |
| 数据库 | Neon PostgreSQL |
| ORM | Prisma |
| Auth | Clerk |
| 搜索 | PostgreSQL full-text search + `pg_trgm` |
| 后期搜索升级 | Meilisearch，可选，不作为上线依赖 |
| 支付 | Stripe Billing + Stripe Checkout |
| 文件存储 | Cloudflare R2 |
| 部署 | Vercel |
| 定时任务 | GitHub Actions |
| 邮件 | Brevo |
| 分析 | PostHog |
| 错误监控 | Sentry |

## 站点配置

- 主站域名：`gocnscout.com`
- 应用 URL：`https://gocnscout.com`
- 支持邮箱：`gerry@gocnscout.com`
- 交易邮件 reply-to：`gerry@gocnscout.com`
- 支付货币：仅 USD
- 品牌显示：`gocnscout`

## 项目结构建议

```text
src/
  app/
    (public)/
    app/
    admin/
    api/
  components/
    public/
    dashboard/
    admin/
    shared/
  lib/
    auth/
    billing/
    db/
    exports/
    mail/
    permissions/
    reports/
    search/
    seo/
    storage/
  server/
    actions/
    services/
    jobs/
  types/
prisma/
  schema.prisma
  migrations/
scripts/
  import-exhibitors.ts
  rebuild-search-index.ts
docs/
  development-specs/
```

## 环境变量

必须配置：

- `DATABASE_URL`
- `DIRECT_URL`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_BASE_URL`，如使用公开静态文件
- `BREVO_API_KEY`
- `SENTRY_DSN`
- `NEXT_PUBLIC_ANALYTICS_ID`
- `APP_URL`
- `SUPPORT_EMAIL`

禁止把密钥写入代码、文档示例或前端 bundle。

固定值建议：

- `APP_URL=https://gocnscout.com`
- `SUPPORT_EMAIL=gerry@gocnscout.com`

## 代码边界

- `lib/permissions` 负责所有套餐权限判断。
- `lib/search` 负责搜索抽象，先实现 PostgreSQL provider。
- `lib/storage` 负责 R2 上传、签名下载和删除。
- `lib/billing` 负责 Stripe 产品、订阅、webhook。
- `lib/exports` 负责导出任务、字段白名单和额度扣减。
- `lib/reports` 负责报告购买、下载权限和权益。
- `server/services` 放业务服务，不把复杂业务逻辑塞进 React 组件。

## Stripe 工程约定

不在 Stripe 后台手动创建产品和价格。产品、价格、权益全部在代码中维护。

必须实现：

- `src/lib/billing/catalog.ts`：维护产品 key、名称、金额、周期、权益。
- `src/lib/billing/create-checkout-session.ts`：根据 catalog 创建 Checkout Session。
- `src/lib/billing/webhooks.ts`：处理 Stripe webhook 并同步本地订阅、订单和权益。

Checkout line item 必须使用代码中的 `price_data` 和 `product_data` 临时创建支付项。Stripe 后台只作为支付处理和事件来源，不作为产品配置的事实来源。

本地数据库必须保存：

- Stripe customer id
- Stripe subscription id
- plan key
- billing interval
- subscription status
- current period start/end
- cancel at period end

权限判断只读本地数据库，不实时依赖 Stripe API。

支付货币规则：

- 所有 Stripe Checkout Session 的 `currency` 固定为 `usd`。
- 不做多币种。
- Pricing、报告、Custom Shortlist、Data License 页面只展示 USD。

## 分析工具决策

分析工具确定为 PostHog。

原因：

- PostHog 官方提供免费额度，早期成本更低。
- Plausible 托管版有试用和付费起步，当前不选。
- 只接入基础产品分析事件，不做复杂实验和用户画像。

## Meilisearch 决策

当前完整上线版本不用 Meilisearch 作为依赖。

必须预留：

```ts
interface SearchProvider {
  searchSuppliers(input: SupplierSearchInput): Promise<SupplierSearchResult>
}
```

PostgreSQL provider 是默认实现。以后如果启用 Meilisearch，只替换 provider，不改页面和权限逻辑。

## GitHub Actions

需要的定时任务：

- 每月重置导出额度
- 每月重置 Free 档案查看额度
- 定时清理过期导出文件
- 定时检查未完成导出任务
- 可选：定时重建搜索向量

## 测试要求

至少覆盖：

- 字段泄漏测试
- 套餐权限测试
- 导出额度测试
- Stripe webhook 测试
- Free 限制测试
- Admin 敏感字段查看日志测试

上线前必须通过：

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- 权限和字段泄漏回归测试
