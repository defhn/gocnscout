/**
 * 社群与 WhatsApp 1 对 1 咨询入口统一配置。
 * 可通过环境变量 NEXT_PUBLIC_DISCORD_INVITE_URL / NEXT_PUBLIC_WHATSAPP_NUMBER 覆盖默认值。
 */
export const DISCORD_INVITE_URL =
  process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "https://discord.gg/PueMpu2RXT";

export const DISCORD_IS_PLACEHOLDER = false;

export const WHATSAPP_NUMBER =
  (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "8615658901753").replace(/[^\d]/g, "");

export const DEFAULT_WHATSAPP_MESSAGE =
  "Hi GoCNScout, I'd like to verify a Chinese supplier before paying a deposit. Here are the supplier details:";

export function getWhatsAppUrl(message: string = DEFAULT_WHATSAPP_MESSAGE) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_URL = getWhatsAppUrl();

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
