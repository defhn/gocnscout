/**
 * 社群入口统一配置。
 * 如需更换 Discord 邀请链接,设置环境变量 NEXT_PUBLIC_DISCORD_INVITE_URL 或直接修改默认值即可。
 */
export const DISCORD_INVITE_URL =
  process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/PueMpu2RXT";

export const DISCORD_IS_PLACEHOLDER = false;

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
