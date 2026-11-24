"use client";

import Link from "next/link";
import { Show, UserButton } from "@clerk/nextjs";
import { Bookmark, MessageCircle } from "lucide-react";
import { DISCORD_INVITE_URL } from "@/config/community";

export function PublicAuthActions({ clerkEnabled = false }: { clerkEnabled?: boolean }) {
  return (
    <div className="flex shrink-0 items-center gap-2.5">
      <a
        href={DISCORD_INVITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-9 items-center gap-2 rounded-lg bg-teal-600 px-3.5 text-sm font-semibold !text-white shadow-sm transition-colors hover:bg-teal-700"
      >
        <MessageCircle className="h-4 w-4" />
        Join Discord
      </a>

      {clerkEnabled ? (
        <>
          <Show when="signed-out">
            <Link
              href="/sign-in"
              className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Sign In
            </Link>
          </Show>
          <Show when="signed-in">
            <Link
              href="/app/lists"
              className="hidden h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors md:inline-flex"
            >
              <Bookmark className="h-3.5 w-3.5 text-teal-600" />
              Saved
            </Link>
            <UserButton />
          </Show>
        </>
      ) : (
        <Link
          href="/sign-in"
          className="inline-flex h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Sign In
        </Link>
      )}
    </div>
  );
}
