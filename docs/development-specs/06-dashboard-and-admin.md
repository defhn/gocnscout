# 06. Dashboard 与中文 Admin

## 全局原则

Dashboard 全部使用英文。Admin 全部使用中文。

所有 Dashboard 功能必须基于实际可提供服务，不写夸大文案，不暗示已经验证供应商，不暗示提供私人联系人。

## Dashboard 信息架构

左侧导航：

- Dashboard
- Supplier Lists
- Compare Suppliers
- Exports
- Reports
- Custom Shortlist
- Billing
- Settings

顶部区域：

- 当前用户
- 当前套餐
- Upgrade 按钮
- Usage 简短提示

## `/app` Dashboard Home

页面目的：

> 让用户快速看到当前套餐、额度、最近研究进展和下一步动作。

布局：

1. Header
   - 标题：`Dashboard`
   - 副标题：`Track your supplier research, exports, reports, and plan usage.`
2. Usage cards，四张卡片
   - `Plan`
   - `Supplier profile views`
   - `CSV exports`
   - `Reports`
3. Recent activity
   - 最近查看供应商
   - 最近导出
   - 最近购买报告
4. Saved lists preview
5. Recommended next steps

空状态文案：

> Start by searching the supplier database or browsing industry pages.

主要按钮：

- `Search suppliers`
- `View saved lists`
- `Browse reports`

验收标准：

- Free 用户显示本月已查看档案数和 5 个上限。
- 付费用户显示本月导出额度和剩余额度。
- 页面不显示任何敏感字段。

## `/app/lists` Supplier Lists

页面目的：

> 帮用户把候选供应商整理成项目名单。

列表页布局：

1. Header
   - 标题：`Supplier Lists`
   - 按钮：`Create list`
2. Lists table
   - List name
   - Suppliers
   - Last updated
   - Visibility
   - Actions
3. Empty state

空状态文案：

> Save suppliers while researching, then export or compare them later.

详情页 `/app/lists/[id]` 布局：

1. List header
   - 名称
   - 供应商数量
   - Export 按钮
2. Supplier table
   - Company Name
   - Industry
   - Province
   - City
   - Main Products
   - Company Type
   - Trade Mode
   - Note
3. Note panel
4. Actions
   - `Remove`
   - `Compare`
   - `Export CSV`

限制：

- Starter 最多 5 个名单、200 个供应商。
- Pro 无限名单、最多 3,000 个供应商。
- Team 支持共享名单和团队备注。

验收标准：

- 超出保存上限时服务端拒绝。
- Team 共享名单只有同团队成员可见。
- 导出名单时仍受月度导出额度限制。

## `/app/compare` Supplier Comparison

页面目的：

> 让用户比较最多 5 个候选供应商。

布局：

1. Header
   - 标题：`Compare Suppliers`
   - 副标题：`Compare public supplier profile fields side by side.`
2. Supplier selector
3. Comparison table

对比字段：

- Company Name
- Industry
- Province
- City
- Official Website，付费可见
- Main Products
- Product Keywords
- Year Established
- Registered Capital
- Company Size
- Company Type
- Trade Mode
- Exhibition History
- Ownership Type

固定说明：

> Comparison is based on public profile fields and supplier signals in the database. It is not a supplier verification or audit.

验收标准：

- 最多 5 个供应商。
- 不显示敏感字段。
- Free 用户不能使用对比。

## `/app/exports` Exports

页面目的：

> 管理 CSV 导出历史和下载。

布局：

1. Usage summary
   - `Exported this month`
   - `Monthly export limit`
   - `Remaining exports`
2. Export history table
   - Created
   - Source
   - Records
   - Status
   - Expires
   - Download
3. Failed exports section

状态文案：

- `Queued`
- `Processing`
- `Ready`
- `Failed`
- `Expired`

验收标准：

- 过期文件不能下载。
- 下载链接必须鉴权。
- 失败导出不扣额度。

## `/app/reports` Reports

页面目的：

> 查看已购报告、包含权益和可购买报告。

布局：

1. Included reports usage
2. Purchased reports table
3. Available reports cards

表格字段：

- Report
- Type
- Purchased
- Download

文案：

> Reports are for supplier discovery and market research. They do not include private contact information or supplier verification.

验收标准：

- 未购买报告不能下载。
- Pro/Team 包含报告权益扣减正确。

## `/app/custom-shortlist`

页面目的：

> 收集用户定制名单需求。

表单字段：

- Product or category
- Target industry
- Preferred province or city
- Preferred company type
- Trade mode preference
- Notes

页面文案：

> Request a manually prepared shortlist of up to 50 supplier candidates. We use public supplier profile fields and sourcing signals; this is not a factory audit or supplier certification.

验收标准：

- 表单提交后创建订单。
- 支付成功后 Admin 可处理。
- 不承诺联系人、邮箱、手机号。

## `/app/billing`

页面目的：

> 管理套餐、发票和付款。

布局：

1. Current plan
2. Plan usage
3. Upgrade options
4. Billing actions
5. Invoice history
6. Team seats，Team 可见

按钮文案：

- `Upgrade plan`
- `Manage billing`
- `Cancel subscription`
- `View invoices`

验收标准：

- 套餐状态来自本地订阅表，订阅表由 Stripe webhook 同步。
- 降级后新增操作按新套餐限制。

## 中文 Admin

Admin 左侧导航：

- 后台首页
- 展商管理
- 数据导入
- 分类管理
- 用户管理
- 订阅管理
- 导出记录
- 报告管理
- 定制名单
- 数据授权
- 删除/更正申请
- 操作日志

## `/admin` 后台首页

显示指标：

- 总供应商数量
- 可公开供应商数量
- 本月搜索次数
- 本月导出条数
- 本月报告销售
- 本月订阅收入
- 待处理删除/更正申请
- 失败导出任务

## `/admin/suppliers`

功能：

- 搜索展商
- 按行业、城市、公开状态筛选
- 查看详情
- 编辑公开字段
- 下架资料页
- 标记重复

表格字段：

- 展商名称
- 行业
- 省份
- 城市
- 官网状态
- 公开状态
- 导入批次
- 更新时间

## `/admin/suppliers/[id]`

结构：

1. 基础公开字段
2. 产品字段
3. 内部敏感字段，默认隐藏
4. 禁用字段，只读
5. 导入信息
6. 操作日志

敏感字段按钮文案：

> 查看敏感字段

确认提示：

> 该操作会记录审计日志。敏感字段仅用于数据排查，不得用于前台展示、导出或销售。

## Admin 验收标准

- Admin 全部中文。
- 敏感字段默认隐藏。
- 查看敏感字段必须写入审计日志。
- 禁用字段不能配置到前台、导出、报告或搜索。
- 所有删除、更正、下架、合并操作都有操作日志。

