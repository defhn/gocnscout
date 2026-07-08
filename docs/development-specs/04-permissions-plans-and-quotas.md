# 04. 权限、套餐与额度

## 套餐

| 套餐 | 价格 | 年付 | 角色 |
|---|---:|---:|---|
| Free | $0/month | 无 | 预览用户 |
| Starter | $49/month | $490/year | 个人买家、小卖家 |
| Pro | $199/month | $1,990/year | 采购代理、进口商 |
| Team | $499/month | $4,990/year | 团队 |
| Data License | $6,000/year | $6,000/year | 年度授权客户 |

## Free 权限

- 每次搜索最多 2 页。
- 每页 10 条。
- 单次搜索最多可见 20 条。
- 每月最多查看 5 个供应商档案。
- 不能访问官网链接。
- 不能导出 CSV。
- 不能保存名单。
- 不能使用供应商对比。
- 不能下载 PDF 报告。

Free 搜索结果字段：

- Company Name
- Industry
- Province
- City
- Main Products，最多 3 个
- Company Type

Free 档案页字段：

- Company Name
- Industry
- Province
- City
- Main Products
- Product Keywords，最多 5 个
- Company Size
- Company Type
- Trade Mode
- Year Established

## Starter 权限

- 无限查看供应商档案。
- 可访问官网链接。
- 每月导出 200 条供应商。
- 最多 5 个 saved lists。
- 最多保存 200 个供应商。
- 最多对比 5 个供应商。
- 可看 Registered Capital、Exhibition History、Ownership Type。
- Basic Industry Report 享 50% 折扣。

## Pro 权限

- 包含 Starter 全部能力。
- 每月导出 1,600 条供应商。
- 无限 saved lists。
- 最多保存 3,000 个供应商。
- 每月包含 1 份 Basic Industry Report。
- Full Industry Report 享 50% 折扣。
- 可使用 Search URL sharing。
- 可看完整导出历史。

## Team 权限

- 包含 Pro 全部能力。
- 5 team seats。
- 每月导出 8,000 条供应商。
- 共享名单。
- 团队备注。
- 每月包含 3 份 Basic Industry Reports。
- 每月包含 1 份 Full Industry Report。
- Premium Industry Report 享 50% 折扣。
- Team Admin 可管理成员。

## Data License 权限

- 年度访问非敏感数据集。
- 可获得全量非敏感 CSV。
- 季度刷新。
- 商业内部使用。
- 不含 API。
- 不含转售权。
- 不含联系人、手机、电话、传真、邮箱、详细地址、邮编和禁用字段。

## 额度计数

需要 `usage_counters` 表按月记录：

- `profileViews`
- `exportedRecords`
- `includedBasicReportsUsed`
- `includedFullReportsUsed`

重置规则：

- 按用户订阅周期月重置。
- Free 用户按自然月重置。
- 使用 GitHub Actions 定时兜底修复。

## 权限实现规则

- 所有权限判断集中在 `lib/permissions`。
- 页面隐藏按钮不是权限控制，服务端 API 必须再次校验。
- 导出前先计算剩余额度。
- 导出成功生成文件后扣减额度。
- 如果导出任务失败，不扣减额度。
- 如果用户降级，保留历史数据，但限制新增操作。

## 验收标准

- Free 不能通过 API 拿到官网。
- Free 第 6 次查看档案必须被拦截。
- Starter 第 201 条月导出必须被拦截。
- Pro 第 1601 条月导出必须被拦截。
- Team 第 8001 条月导出必须被拦截。
- 所有套餐都不能获取敏感字段和禁用字段。

