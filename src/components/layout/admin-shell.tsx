import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Database, FileUp, Home, Inbox, Shield, Users } from "lucide-react";

const nav = [
  { href: "/admin", label: "概览", icon: Home },
  { href: "/admin/suppliers", label: "供应商", icon: Database },
  { href: "/admin/reports", label: "PDF报告", icon: FileUp },
  { href: "/admin/imports", label: "导入任务", icon: FileUp },
  { href: "/admin/inquiries", label: "咨询表单", icon: Inbox },
  { href: "/admin/users", label: "用户订阅", icon: Users },
  { href: "/admin/audit", label: "审计日志", icon: Shield },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-slate-950 p-4 text-white lg:block">
        <Link href="/admin" className="flex items-center gap-2 text-lg font-extrabold text-white">
          <img src="/logo.png" alt="GoCNScout Logo" className="h-8 w-8 object-contain" />
          <span>gocnscout 管理后台</span>
        </Link>
        <nav className="mt-8 grid gap-1" aria-label="Admin navigation">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white">
              <item.icon className="h-4 w-4" aria-hidden />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-white">
          <div className="flex h-16 items-center justify-between px-4 lg:px-8">
            <p className="text-sm font-medium text-slate-600">中文 Admin，仅内部使用</p>
            {clerkEnabled ? <UserButton /> : null}
          </div>
        </header>
        <main className="px-4 py-8 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
