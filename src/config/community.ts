/**
 * 社群入口统一配置。
 * Discord 邀请链接目前是占位符:建好群后只需设置环境变量
 * NEXT_PUBLIC_DISCORD_INVITE_URL,或直接修改下面的默认值,全站按钮会同步更新。
 */
export const DISCORD_INVITE_URL =
  process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/REPLACE_ME";

export const DISCORD_IS_PLACEHOLDER = DISCORD_INVITE_URL.includes("REPLACE_ME");

/** 免费社群答疑与付费人工服务的边界(用于首页、服务页等文案复用) */
export const COMMUNITY_SCOPE = {
  free: [
    "How to read the company fields on this site",
    "Simple China sourcing process questions",
    "A generic supplier question checklist before you contact anyone",
    "What to check next before samples or payment",
  ],
  paid: [
    "Identity and public-record verification for a specific company ($149)",
    "Deep ownership, legal-risk, IP and social-signal review before payment ($249)",
    "Side-by-side Buyer Decision Reviews for up to three supplier candidates ($499)",
  ],
} as const;
