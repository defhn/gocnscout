# 自有服务器 PostgreSQL 迁移说明

本方案把应用数据库迁到你自己的服务器，不再依赖 Neon 处理网站数据库请求。快照包含整个应用数据库，而不仅是用户和企业表，以保留文章、报告、关联关系和既有业务数据。原始 Neon 数据不会被删除。快照包含敏感数据，不得上传 GitHub、public 目录或公开下载链接。

注意：用户资料表会迁移，但注册、登录和身份验证仍由 Clerk 提供；Clerk 账号和密码不在此数据库中。此次未替换登录系统。Stripe、R2 等其他外部服务也不会因数据库迁移自动替换。数据库迁移不会自动实现免费开放和 Discord 改版。

## 服务器部署前

需要 Linux 服务器、Docker Compose、Node.js/pnpm（执行迁移与恢复），以及足够存储。先备份服务器已有数据。确保网站停写期间执行最终快照和切换，否则快照之后 Neon 的新增内容不会自动同步。勿把快照和密钥提交 Git。

## 启动数据库

在项目目录创建强随机密码并仅保存在服务器安全位置；以下命令中的变量仅在当前 shell 生效。切勿把真实密码放进代码或聊天记录。

```bash
export POSTGRES_PASSWORD='替换为强随机密码'
docker compose -f compose.database.yml up -d
```

默认数据库只监听服务器的 127.0.0.1:5432，不直接暴露到公网。若端口已使用，应更改映射和下列 URL。确保 Docker volume 定期异地备份；重装服务器或删除 volume 会导致数据丢失。

## 初始化并导入

先将快照通过安全方式复制到服务器私有目录。备份文件有完整个人及业务资料，限制为管理员读取。以下假设应用在宿主机运行，密码中若有 URL 特殊字符需先进行百分号编码。将 `DATABASE_URL`、`DIRECT_URL` 配到服务器私有环境文件中，两者都必须指向这台本地 PostgreSQL，禁止保留 Neon 地址。先安装依赖，使用此项目对应的 Prisma 迁移建表，然后仅向空库恢复：

```bash
export DATABASE_URL='postgresql://cnscout:URL编码后的密码@127.0.0.1:5432/cnscout'
export DIRECT_URL="$DATABASE_URL"
pnpm install --frozen-lockfile
pnpm exec prisma migrate deploy
export RESTORE_DATABASE_URL="$DATABASE_URL"
node scripts/database/restore.cjs /安全目录/neon-snapshot.jsonl.gz
```

恢复程序仅允许连接 localhost，要求所有目标业务表为空，在事务内恢复并核对每表记录数；失败会回滚。不要对已有数据的库运行恢复。迁移后检查企业数量、文章、账户、后台、搜索等，再切换流量。由于应用当前通过 Clerk 验证身份，保留正确的 Clerk 环境配置及域名设置。运行网站时确认构建环境和运行环境的数据库地址都不是 Neon。部署后用网络/日志验证 Neon 无请求，确认后再按需要处理 Neon 服务和账单。

## 重新导出

在安全且能连接源数据库的电脑，项目根目录运行：

```bash
node scripts/database/export.cjs private-backups/新快照.jsonl.gz
```

程序读取现有环境配置，在同一个只读一致性事务中导出所有 public 业务表；不会覆盖已有文件。为切换获取最终快照前先停止网站写入。保存后加密传输并安全保管，快照不是长期备份策略。

本机 `.env.local` 已切换到本地测试数据库，因此上述命令默认导出本地数据，而非 Neon。切换前的环境文件保存在 `private-backups/env.local.before-local-postgres`，包含敏感凭据；需要从 Neon 做最终快照时，应在受控环境中使用原来的源库配置，完成后立即恢复本地配置。不要公开或上传该文件。当前本地 PostgreSQL 使用仅限本机验证的密码，生产服务器必须另设强密码。
