# 13. 全量开发执行步骤

本文档是 `gocnscout` 全量开发执行清单。开发必须按顺序推进，除非某一步明确可以并行。每一步完成后，应能通过对应的本地检查或人工验收。

## Phase 0: 准备与约束确认

1. 确认项目在仓库根目录开发，不创建子项目目录。
2. 确认包管理器使用 `pnpm`。
3. 确认前台语言为英文。
4. 确认用户 Dashboard 语言为英文。
5. 确认 Admin 语言为中文。
6. 确认品牌显示为 `gocnscout`。
7. 确认主域名为 `gocnscout.com`。
8. 确认支持邮箱为 `gerry@gocnscout.com`。
9. 确认所有支付货币仅使用 USD。
10. 确认 Data License 只走表单咨询，不做前台直接付款。
11. 确认 PDF 报告由 Admin 人工上传，不自动生成。
12. 确认 Stripe 产品和价格不在 Stripe 后台创建，全部由代码 catalog 定义。
13. 确认搜索初始使用 PostgreSQL full-text search + `pg_trgm`。
14. 确认分析工具使用 PostHog。
15. 确认文件存储使用 Cloudflare R2。
16. 确认 Auth 使用 Clerk。
17. 确认数据库使用 Neon PostgreSQL。
18. 确认邮件使用 Brevo。
19. 确认错误监控使用 Sentry。
20. 确认文档未明确的法律、退款、授权、服务能力问题必须先询问项目负责人。

## Phase 1: 初始化工程

21. 在仓库根目录初始化 Next.js App Router + TypeScript 项目。
22. 配置 `pnpm`。
23. 安装 React、Next.js、TypeScript 相关依赖。
24. 安装 Tailwind CSS。
25. 初始化 Tailwind 配置。
26. 初始化 shadcn/ui。
27. 配置 `components.json`。
28. 添加基础 shadcn 组件：button、input、select、table、dialog、dropdown-menu、tabs、badge、card、tooltip、textarea、form。
29. 配置 ESLint。
30. 配置 Prettier 或使用项目默认格式化策略。
31. 配置 TypeScript strict。
32. 配置路径别名 `@/*`。
33. 创建 `src/app` 目录结构。
34. 创建 `src/components` 目录结构。
35. 创建 `src/lib` 目录结构。
36. 创建 `src/server` 目录结构。
37. 创建 `src/types` 目录结构。
38. 创建基础 `app/layout.tsx`。
39. 创建基础 `app/page.tsx`。
40. 确认 `pnpm dev` 可以启动。

## Phase 2: 环境变量和配置

41. 保留 `.env.example` 作为模板。
42. 保留 `.env.local` 给本地开发填写。
43. 安装环境变量校验依赖，建议使用 `@t3-oss/env-nextjs` 或 Zod 自定义校验。
44. 创建 `src/lib/env.ts`。
45. 校验 `APP_URL`。
46. 校验 `SUPPORT_EMAIL`。
47. 校验 Neon `DATABASE_URL` 和 `DIRECT_URL`。
48. 校验 Clerk 变量。
49. 校验 Stripe 变量。
50. 校验 R2 变量。
51. 校验 Brevo 变量。
52. 校验 PostHog 变量。
53. 校验 Sentry 变量。
54. 对可选变量做空值容忍。
55. 对必填变量在生产环境强校验。
56. 确认本地缺少生产变量时不会阻止静态 UI 开发。
57. 创建环境变量文档链接到 `11-environment-and-integration-runbook.md`。

## Phase 3: 数据库和 Prisma

58. 安装 Prisma 和 Prisma Client。
59. 初始化 Prisma。
60. 配置 PostgreSQL datasource。
61. 创建 `prisma/schema.prisma`。
62. 定义 `User` model。
63. 定义 `Team` model。
64. 定义 `TeamMember` model。
65. 定义 `Subscription` model。
66. 定义 `UsageCounter` model。
67. 定义 `Supplier` model。
68. 定义 `SupplierPrivateFields` model。
69. 定义 `SupplierIgnoredFields` model。
70. 定义 `Industry` model。
71. 定义 `ProductKeyword` model。
72. 定义 `Province` model。
73. 定义 `City` model。
74. 定义 `ImportBatch` model。
75. 定义 `SavedList` model。
76. 定义 `SavedListItem` model。
77. 定义 `SupplierNote` model。
78. 定义 `ExportJob` model。
79. 定义 `ExportFile` model。
80. 定义 `Report` model。
81. 定义 `ReportPurchase` model。
82. 定义 `CustomShortlistRequest` model。
83. 定义 `DataLicenseInquiry` model。
84. 定义 `DataLicenseAccount` model。
85. 定义 `DataRemovalRequest` model。
86. 定义 `AdminAuditLog` model。
87. 定义 `SensitiveFieldAccessLog` model。
88. 添加必要枚举：Plan、SubscriptionStatus、ReportType、ExportStatus、RequestStatus。
89. 添加唯一索引：supplier slug、industry slug、product keyword slug、city slug。
90. 添加查询索引：industryId、cityId、provinceId、companyType、tradeMode。
91. 添加 export、report、subscription 相关外键。
92. 创建 `src/lib/db/prisma.ts`。
93. 创建 PostgreSQL extension migration：`pg_trgm`。
94. 运行 `pnpm prisma generate`。
95. 运行首次 migration。

## Phase 4: 数据导入和清洗

96. 安装 Excel 读取依赖，例如 `xlsx`。
97. 创建 `scripts/import-exhibitors.ts`。
98. 读取根目录 Excel 文件。
99. 定位目标工作表。
100. 实现字段映射。
101. 行业字段只保留行业名称。
102. 标准化官网 URL。
103. 拆分主营产品。
104. 拆分主营关键词。
105. 标准化省份和城市。
106. 生成 supplier slug。
107. 生成 industry slug。
108. 生成 product keyword slug。
109. 生成 city slug。
110. 公开字段写入 `Supplier`。
111. 敏感字段写入 `SupplierPrivateFields`。
112. 禁用字段写入 `SupplierIgnoredFields`。
113. 写入 `ImportBatch`。
114. 统计成功和失败行。
115. 输出导入错误报告。
116. 创建 `pnpm import:exhibitors` 脚本。
117. 创建 `pnpm search:rebuild` 脚本。
118. 生成或更新搜索向量。
119. 验证敏感字段不进入公开表序列化。
120. 验证禁用字段不进入搜索。

## Phase 5: Auth、用户和权限

121. 安装 Clerk Next.js SDK。
122. 配置 Clerk provider。
123. 创建登录页面或使用 Clerk 组件。
124. 创建注册入口。
125. 创建退出入口。
126. 创建 `src/lib/auth/current-user.ts`。
127. 创建本地用户同步逻辑。
128. 支持用户首次登录时写入 `User`。
129. 创建 Admin 判断逻辑。
130. 创建 `/admin` 路由保护。
131. 创建 `/app` 路由保护。
132. 创建 `src/lib/permissions/plans.ts`。
133. 定义 Free、Starter、Pro、Team、Data License 权限。
134. 创建字段可见性函数。
135. 创建导出额度检查函数。
136. 创建 profile view 额度检查函数。
137. 创建 saved list 限制函数。
138. 创建 report entitlement 检查函数。
139. 确保所有权限服务端执行。

## Phase 6: 基础布局和 UI

140. 创建公开前台 layout。
141. 创建 Dashboard layout。
142. 创建 Admin layout。
143. 创建公开 Header。
144. 创建公开 Footer。
145. 创建 Dashboard sidebar。
146. 创建 Admin sidebar。
147. 创建 Breadcrumb 组件。
148. 创建 SEO metadata helper。
149. 创建 JSON-LD helper。
150. 创建 Empty State 组件。
151. 创建 Loading State 组件。
152. 创建 Error State 组件。
153. 创建 Data Table 组件。
154. 创建 Filter Sidebar 组件。
155. 创建 Pagination 组件。
156. 创建 Upgrade Prompt 组件。
157. 创建 Disclaimer 组件。
158. 验证所有公开页面只有一个 H1。
159. 验证公开页面 breadcrumb 规则。

## Phase 7: 公开页面和 SEO

160. 实现首页 `/`。
161. 首页读取真实 supplier、industry、city、product keyword 统计。
162. 首页实现行业、产品、城市入口。
163. 首页实现报告 CTA。
164. 实现 `/database`。
165. `/database` 默认 `noindex,follow`。
166. 实现搜索栏。
167. 实现筛选侧边栏。
168. 实现搜索结果表格/卡片。
169. 实现 Free 搜索页数限制。
170. 实现 Free 官网隐藏。
171. 实现行业页 `/industries/[slug]`。
172. 行业页真实读取 supplier count。
173. 行业页真实读取 top provinces/cities。
174. 行业页真实读取 product keyword clusters。
175. 行业页实现 noindex 阈值。
176. 实现产品页 `/products/[slug]`。
177. 产品页真实读取匹配 supplier。
178. 产品页实现 noindex 阈值。
179. 实现城市页 `/cities/[slug]`。
180. 城市页真实读取行业和产品分布。
181. 城市页实现 noindex 阈值。
182. 实现公司页 `/companies/[slug]`。
183. 公司页按权限返回字段。
184. 公司页 Free 查看次数计数。
185. 公司页 JSON-LD 不包含隐藏字段。
186. 实现 Pricing 页。
187. 实现 Reports 列表页。
188. 实现 Report 详情页。
189. 实现 legal 页面。
190. 实现 sitemap。
191. 实现 robots。
192. 实现 canonical。
193. 实现 BreadcrumbList JSON-LD。

## Phase 8: API 和 Server Services

194. 实现 `GET /api/suppliers/search`。
195. 实现 `GET /api/suppliers/:slug`。
196. 实现 industry page server service。
197. 实现 product page server service。
198. 实现 city page server service。
199. 实现 report list API/service。
200. 实现 report detail API/service。
201. 实现 saved lists API。
202. 实现 list items API。
203. 实现 supplier compare API。
204. 实现 data license inquiry API。
205. 实现 export job API。
206. 实现 export download API。
207. 实现 billing checkout API。
208. 实现 report checkout API。
209. 实现 Stripe webhook API。
210. 实现 admin import API。
211. 实现 admin report CRUD API。
212. 实现 admin report upload API。
213. 实现 admin sensitive fields API。
214. 统一 API 错误格式。
215. 全部 API 输入使用 Zod 校验。

## Phase 9: Dashboard

216. 实现 `/app` Dashboard 首页。
217. Dashboard 读取当前套餐。
218. Dashboard 读取 usage counters。
219. Dashboard 显示最近查看。
220. Dashboard 显示最近导出。
221. Dashboard 显示已购报告。
222. 实现 `/app/lists`。
223. 实现创建名单。
224. 实现重命名名单。
225. 实现删除名单。
226. 实现保存供应商。
227. 实现移除供应商。
228. 实现名单备注。
229. 实现 Team shared list。
230. 实现 `/app/compare`。
231. 对比最多 5 个供应商。
232. 实现 `/app/exports`。
233. 显示导出历史。
234. 显示下载状态。
235. 实现 `/app/reports`。
236. 显示已购报告。
237. 显示套餐包含报告权益。
238. 实现 `/app/custom-shortlist`。
239. 实现 Custom Shortlist 表单。
240. 实现 `/app/data-license`。
241. 实现 Data License 咨询表单。
242. 实现 `/app/billing`。
243. 显示当前套餐和发票入口。

## Phase 10: Stripe Billing

244. 创建 `src/lib/billing/catalog.ts`。
245. 在 catalog 中定义 Starter monthly/yearly。
246. 在 catalog 中定义 Pro monthly/yearly。
247. 在 catalog 中定义 Team monthly/yearly。
248. 在 catalog 中定义报告 one-time 产品。
249. 在 catalog 中定义 Custom Shortlist one-time 产品。
250. 确认 Data License 不进入 checkout catalog。
251. 创建 checkout session helper。
252. 使用 `price_data`。
253. 使用 `product_data`。
254. currency 固定 `usd`。
255. metadata 写入 userId、productKey、orderType。
256. 实现 subscription checkout。
257. 实现 report checkout。
258. 实现 custom shortlist checkout。
259. 实现 Stripe webhook 签名校验。
260. 实现 webhook 幂等。
261. 处理 checkout completed。
262. 处理 subscription created。
263. 处理 subscription updated。
264. 处理 subscription deleted。
265. 处理 invoice payment failed。
266. 本地订阅表同步。
267. 本地报告购买表同步。
268. 本地 Custom Shortlist 表同步。

## Phase 11: R2、PDF、CSV 和邮件

269. 安装 S3-compatible SDK。
270. 创建 R2 client。
271. 创建 upload helper。
272. 创建 signed download helper。
273. 实现 Admin PDF 上传到 R2。
274. 上传后写入 reports object key。
275. 实现报告版本字段。
276. 实现报告发布状态。
277. 实现已购报告下载。
278. 实现 CSV 生成。
279. CSV 只使用白名单字段。
280. 实现 export job queue 简化版本。
281. 实现 export job 状态更新。
282. 实现导出文件上传 R2。
283. 实现导出完成后扣额度。
284. 实现导出失败不扣额度。
285. 实现 Brevo client。
286. 实现报告购买邮件。
287. 实现导出完成邮件。
288. 实现导出失败邮件。
289. 实现 Data License inquiry 邮件。
290. 实现删除/更正请求邮件。

## Phase 12: 中文 Admin

291. 实现 `/admin` 首页。
292. Admin 首页显示真实指标。
293. 实现 `/admin/suppliers`。
294. 实现供应商搜索和筛选。
295. 实现 `/admin/suppliers/[id]`。
296. 实现公开字段编辑。
297. 实现敏感字段默认隐藏。
298. 实现查看敏感字段审计日志。
299. 实现禁用字段只读查看。
300. 实现 `/admin/imports`。
301. 实现导入批次查看。
302. 实现 `/admin/taxonomy`。
303. 实现行业/产品/城市管理。
304. 实现 `/admin/users`。
305. 实现 `/admin/subscriptions`。
306. 实现 `/admin/exports`。
307. 实现 `/admin/reports`。
308. 实现报告创建。
309. 实现报告编辑。
310. 实现报告上传。
311. 实现报告发布/下架。
312. 实现 `/admin/shortlists`。
313. 实现 Custom Shortlist 状态管理。
314. 实现交付文件上传。
315. 实现 `/admin/licenses`。
316. 实现 Data License inquiry 管理。
317. 实现 Data License account 管理。
318. 实现 `/admin/requests`。
319. 实现删除/更正请求处理。
320. 实现 `/admin/audit-logs`。

## Phase 13: 合规、SEO 和质量

321. 确认所有公开页面没有敏感字段。
322. 确认所有公开页面没有禁用字段。
323. 确认所有 CSV 没有敏感字段。
324. 确认所有 PDF 文案不承诺认证或验厂。
325. 确认所有页面 title 唯一。
326. 确认所有页面 meta description 唯一。
327. 确认所有页面 H1 唯一。
328. 确认 heading outline 合理。
329. 确认 breadcrumb 可见。
330. 确认 BreadcrumbList JSON-LD 正确。
331. 确认 sitemap 不包含 noindex 页面。
332. 确认 `/app` 和 `/admin` 禁止索引。
333. 确认参数页 noindex。
334. 确认 Core Web Vitals 基础目标。
335. 接入 PostHog。
336. 接入 Sentry。
337. 记录搜索事件。
338. 记录档案查看事件。
339. 记录 checkout started。
340. 记录 report purchased。
341. 记录 export requested。
342. 记录 data license inquiry submitted。

## Phase 14: 测试和联调

343. 添加单元测试框架。
344. 测试权限函数。
345. 测试字段白名单。
346. 测试导出额度。
347. 测试 Free profile view 限制。
348. 测试 API 错误格式。
349. 测试 Stripe webhook 幂等。
350. 测试 R2 signed URL 权限。
351. 测试 Admin 敏感字段审计日志。
352. 测试 Data License 不触发 Stripe。
353. 按 `11-environment-and-integration-runbook.md` 完成联调。
354. 按 `12-end-to-end-data-flows.md` 跑通核心链路。
355. 运行 `pnpm lint`。
356. 运行 `pnpm typecheck`。
357. 运行 `pnpm build`。
358. 修复所有 build error。
359. 修复所有 lint error。
360. 修复所有类型错误。

## Phase 15: 最终验收

361. 验收 Excel -> Neon -> 前台 SEO 页面。
362. 验收 Clerk 登录 -> Dashboard。
363. 验收 Stripe Checkout -> webhook -> 本地权限。
364. 验收 Admin PDF upload -> R2 -> reports table。
365. 验收 report page -> purchase -> dashboard download。
366. 验收 Search -> Saved List -> Export -> R2 -> download。
367. 验收 Data License form -> Admin inquiry。
368. 验收 Data removal form -> Admin workflow -> email。
369. 验收非 Admin 不能访问 Admin。
370. 验收 Free 不能访问官网。
371. 验收 Starter 导出 200 条限制。
372. 验收 Pro 导出 1,600 条限制。
373. 验收 Team 导出 8,000 条限制。
374. 验收所有价格为 USD。
375. 验收 Data License 无直接付款按钮。
376. 验收所有公开页面无虚假认证文案。
377. 验收所有服务真实读取数据库和第三方服务状态。
378. 验收 `.env.example` 与代码变量一致。
379. 验收 README 和开发规格链接完整。
380. 完成后给出运行命令、环境变量填写说明和剩余人工配置清单。

