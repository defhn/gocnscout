import * as React from "react";
import Link from "next/link";
import { Shield, Lock, Activity, RefreshCw, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SITE } from "@/config/seo";

type LegalLayoutProps = {
  title: string;
  activePath: string;
  children: React.ReactNode;
};

export function LegalLayout({ title, activePath, children }: LegalLayoutProps) {
  const sidebarItems = [
    { href: "/legal/terms", label: "Terms of Service", icon: Shield },
    { href: "/legal/privacy", label: "Privacy Policy", icon: Lock },
    { href: "/legal/acceptable-use", label: "Acceptable Use", icon: Activity },
    { href: "/legal/refund-policy", label: "Refund Policy", icon: RefreshCw },
  ];

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900">
      <div className="container-page py-10 grid gap-8 lg:grid-cols-[260px_1fr] items-start">
        {/* Left Sidebar Navigation */}
        <aside className="space-y-6 lg:sticky lg:top-24">
          <div className="px-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Legal Directory</h2>
            <p className="text-[10px] text-slate-500 mt-1">Compliance & Policies</p>
          </div>
          
          <nav className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-1.5 pb-3 lg:pb-0 border-b lg:border-b-0 border-slate-200">
            {sidebarItems.map((item) => {
              const isActive = activePath === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2.5 rounded-xl px-4 py-3 text-xs font-bold tracking-tight transition-all shrink-0 ${
                    isActive
                      ? "bg-white text-teal-600 border border-slate-200/80 shadow-sm"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-teal-500" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Quick Support widget */}
          <div className="hidden lg:block rounded-2xl bg-teal-950 text-white p-5 shadow-sm relative overflow-hidden border border-teal-900">
            <div className="absolute right-0 top-0 w-24 h-24 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />
            <h3 className="text-xs font-bold">Need Sourcing Help?</h3>
            <p className="text-[10px] text-slate-300 leading-normal mt-1.5">
              Have questions regarding data safety or purchase options? Reach out directly.
            </p>
            <div className="mt-4 flex items-center space-x-2 text-[10px] text-teal-300 font-mono">
              <Mail className="h-3.5 w-3.5" />
              <span>{SITE.supportEmail}</span>
            </div>
          </div>
        </aside>

        {/* Right Main Content Card */}
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-hidden">
          <CardContent className="p-6 md:p-10">
            <div className="border-b border-slate-100 pb-5 mb-8">
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-950">
                {title}
              </h1>
              <p className="text-xs text-slate-400 mt-2 font-mono">Last updated: July 2026</p>
            </div>
            
            <div className="prose prose-slate max-w-none text-slate-700 text-xs md:text-sm leading-relaxed space-y-6 
              [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:border-b [&_h2]:border-slate-50 [&_h2]:pb-2 
              [&_h3]:text-xs [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-6 [&_h3]:mb-2 
              [&_p]:mb-4 [&_p]:text-slate-600 [&_p]:leading-relaxed"
            >
              {children}
            </div>

            {/* Compliance Guarantee badge at legal footer */}
            <div className="mt-10 border-t border-slate-100 pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 text-[10px] text-slate-400 leading-normal">
              <span>© 2026 {SITE.name}. All corporate records structured in accordance with global sourcing compliance models.</span>
              <span className="shrink-0 font-bold uppercase tracking-wider text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                Verified Compliance Safe
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
