import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { DISCORD_INVITE_URL } from "@/config/community";

export function PublicAuthActions() {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <a
        href={DISCORD_INVITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-9 items-center gap-2 rounded-lg bg-teal-600 px-3.5 text-sm font-semibold !text-white shadow-sm transition-colors hover:bg-teal-700"
      >
        <MessageCircle className="h-4 w-4" />
        Join Discord
      </a>
      {/* 管理员后台入口保留,但不在主导航中突出 */}
      <Link href="/sign-in" className="hidden text-xs text-slate-400 hover:text-slate-600 md:inline">
        Admin
      </Link>
    </div>
  );
}
