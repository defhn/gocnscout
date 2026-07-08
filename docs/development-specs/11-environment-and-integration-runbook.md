# 11. 环境变量与联调 Runbook

## 目标

开发完成后，用户只需要填好环境变量、执行数据库迁移和导入数据，就能跑通前端、后端、数据库、支付、存储、邮件、分析和错误监控。

## 必填环境变量

### App

- `APP_URL=https://gocnscout.com`
- `SUPPORT_EMAIL=gerry@gocnscout.com`
- `NODE_ENV`

### Neon PostgreSQL

- `DATABASE_URL`
- `DIRECT_URL`

要求：

- `DATABASE_URL` 给 Prisma runtime 使用。
- `DIRECT_URL` 给 Prisma migrate 使用。
- 必须启用 PostgreSQL `pg_trgm` extension。

### Clerk

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_WEBHOOK_SECRET`，如使用 Clerk webhook 同步用户

要求：

- 登录、注册、退出可用。
- 用户 id 必须能映射到本地 `users.clerkUserId`。

### Stripe

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

要求：

- 不在 Stripe 后台手动配置产品价格。
- 代码内 catalog 创建 Checkout Session。
- Webhook endpoint 指向 `/api/webhooks/stripe`。
- 货币固定 USD。

### Cloudflare R2

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_BASE_URL`，如需要公开预览图

要求：

- PDF 报告、CSV 导出、Data License 文件都存 R2。
- 私有文件通过短期签名链接下载。

### Brevo

- `BREVO_API_KEY`
- `BREVO_FROM_EMAIL`
- `BREVO_FROM_NAME=gocnscout`

要求：

- Reply-to 使用 `gerry@gocnscout.com`。
- 交易邮件发送失败进入 Sentry。

### PostHog

- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`

要求：

- 只记录产品分析事件，不发送敏感字段。

### Sentry

- `SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`，仅 CI/source map 上传需要
- `SENTRY_ORG`
- `SENTRY_PROJECT`

要求：

- API 错误、导出失败、webhook 失败、导入失败进入 Sentry。

## 初始化命令

建议命令：

```bash
pnpm install
pnpm prisma generate
pnpm prisma migrate deploy
pnpm build
pnpm start
```

开发环境：

```bash
pnpm dev
```

数据导入：

```bash
pnpm import:exhibitors
```

重建搜索：

```bash
pnpm search:rebuild
```

## 首次上线步骤

1. 填写 `.env`。
2. 运行 Prisma migration。
3. 确认 `pg_trgm` extension 可用。
4. 创建 Admin 用户或在数据库标记管理员。
5. 登录 Admin。
6. 上传 Excel 或执行导入脚本。
7. 检查导入批次。
8. 检查公开供应商数量。
9. 上传至少 1 个 PDF 报告。
10. 测试报告前台展示。
11. 测试 Stripe Checkout。
12. 测试 Stripe webhook。
13. 测试 CSV 导出到 R2。
14. 测试 Brevo 邮件。
15. 测试 Sentry 错误。
16. 测试 PostHog 事件。

## 联调检查清单

### 数据库

- Prisma 能连接 Neon。
- migration 成功。
- `suppliers` 有数据。
- `industries`、`product_keywords`、`cities` 有数据。
- `supplier_private_fields` 不为空但不会返回前台。
- 搜索向量已生成。

### 前台

- 首页能展示真实统计。
- 行业页能展示真实分布。
- 产品页能展示真实匹配供应商。
- 城市页能展示真实分布。
- 公司页能按权限显示字段。
- noindex 和 sitemap 规则正确。

### Auth

- 未登录能访问公开页面。
- 登录后能进入 `/app`。
- 非 Admin 不能访问 `/admin`。
- Admin 能访问中文后台。

### Billing

- Starter/Pro/Team Checkout 可创建。
- 报告 Checkout 可创建。
- Data License 不出现 Checkout。
- webhook 成功后本地 subscription 更新。
- 取消订阅后权限变化。

### R2

- Admin 能上传 PDF。
- 数据库写入 R2 object key。
- 前台报告详情页能展示报告元数据。
- 购买用户能下载 PDF。
- 未购买用户不能下载 PDF。
- CSV 导出文件能上传和下载。

### Brevo

- 报告购买邮件可发送。
- 导出完成邮件可发送。
- Data License inquiry 邮件可发送。
- 删除/更正请求邮件可发送。

### PostHog

- Search performed
- Supplier profile viewed
- Checkout started
- Report purchased
- Export requested
- Data license inquiry submitted

### Sentry

- 测试错误能进入 Sentry。
- webhook 失败能进入 Sentry。
- 导出失败能进入 Sentry。

## 常见阻断

| 问题 | 可能原因 | 处理 |
|---|---|---|
| 搜索报错 | `pg_trgm` 未启用 | 在 Neon 执行 extension migration |
| 付款后权限没变 | Stripe webhook 未配置或签名失败 | 检查 `STRIPE_WEBHOOK_SECRET` |
| PDF 上传成功但前台看不到 | 报告状态未 published 或数据库未写 object key | 检查 Admin 报告记录 |
| 下载 403 | 用户未购买或签名链接过期 | 检查购买记录和签名生成 |
| Free 能看到官网 | API 字段白名单错误 | 检查 supplier serializer |
| CSV 出现敏感字段 | 导出没有使用白名单 | 阻止上线 |

## 上线验收

- 填完环境变量后，`pnpm build` 通过。
- 数据库迁移后，导入数据可搜索。
- 前台页面真实读取数据库。
- Dashboard 真实读取用户、订阅、额度、报告、导出数据。
- Admin 上传 PDF 后，前台和 Dashboard 权限联动正常。
- Stripe webhook 能改变本地权限。
- R2 文件下载必须鉴权。

