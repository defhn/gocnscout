import Link from "next/link";
import { SignOutButton, UserButton } from "@clerk/nextjs";
import { ArrowLeft, BarChart3, GitCompare, Home, ListChecks, LogOut, Search, ShieldCheck } from "lucide-react";
import { getClerkPublishableKey } from "@/lib/env";

const nav = [
  { href: "/app", label: "Overview", icon: Home },
  { href: "/app/lists", label: "Saved Lists", icon: ListChecks },
  { href: "/database", label: "Free Database", icon: Search },
  { href: "/app/compare", label: "Compare", icon: GitCompare },
  { href: "/app/screenings", label: "Screenings", icon: ShieldCheck },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const clerkEnabled = Boolean(getClerkPublishableKey());

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-white p-4 lg:block">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold text-slate-950">
          <img src="/logo-96.webp" alt="GoCNScout Logo" width={32} height={32} className="h-8 w-8 object-contain" />
          <span>gocnscout</span>
        </Link>
        <nav className="mt-8 grid gap-1" aria-label="Dashboard navigation">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950">
              <item.icon className="h-4 w-4" aria-hidden />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-white">
          <div className="flex h-16 items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-2 font-medium text-slate-800">
                <BarChart3 className="h-4 w-4 text-teal-600" aria-hidden />
                Account Dashboard
              </span>
              <Link href="/" className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-teal-700">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to site
              </Link>
            </div>
            {clerkEnabled ? (
              <div className="flex items-center gap-3">
                <SignOutButton redirectUrl="/">
                  <button
                    type="button"
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </SignOutButton>
                <UserButton />
              </div>
            ) : null}
          </div>
        </header>
        <main className="px-4 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
