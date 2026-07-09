import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { BarChart3, CreditCard, Download, FileText, GitCompare, Home, ListChecks, Search } from "lucide-react";

const nav = [
  { href: "/app", label: "Overview", icon: Home },
  { href: "/app/search", label: "Search", icon: Search },
  { href: "/app/lists", label: "Lists", icon: ListChecks },
  { href: "/app/compare", label: "Compare", icon: GitCompare },
  { href: "/app/exports", label: "Exports", icon: Download },
  { href: "/app/reports", label: "Reports", icon: FileText },
  { href: "/app/billing", label: "Billing", icon: CreditCard },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

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
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <BarChart3 className="h-4 w-4" aria-hidden />
              Supplier research dashboard
            </div>
            {clerkEnabled ? <UserButton /> : null}
          </div>
        </header>
        <main className="px-4 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
