import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { ChevronDown, ShieldCheck, Sparkles, Layers, FileText, Mail, ShieldAlert } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";

export async function PublicHeader() {
  const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const userId = clerkEnabled ? (await auth()).userId : null;
  const isSignedIn = Boolean(userId);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between gap-4 px-4 lg:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-950 shrink-0">
          <img src="/logo.png" alt="GoCNScout Logo" className="h-8 w-8 object-contain" />
          <span>gocnscout</span>
        </Link>

        {/* Navigation Controls */}
        <nav className="hidden items-center gap-1.5 lg:flex" aria-label="Main navigation">
          {/* 一级重要链接直接平铺展示 */}
          <Link href="/database" className="inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-teal-600 transition-colors">
            Database
          </Link>
          <Link href="/industries" className="inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-teal-600 transition-colors">
            Industries
          </Link>
          <Link href="/products" className="inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-teal-600 transition-colors">
            Products
          </Link>
          <Link href="/cities" className="inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-teal-600 transition-colors">
            Cities
          </Link>
          <Link href="/reports" className="inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-teal-600 transition-colors">
            Reports
          </Link>
          <Link href="/blog" className="inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-teal-600 transition-colors">
            Blog
          </Link>
          <Link href="/pricing" className="inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-teal-600 transition-colors">
            Pricing
          </Link>

          {/* 非一级页面使用 Dropdown 下拉收纳 */}
          <div className="group relative py-4">
            <button className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-teal-600 transition-colors cursor-pointer">
              <span>More Services</span>
              <ChevronDown className="h-3 w-3 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
            </button>
            
            <div className="absolute top-full right-0 mt-1 hidden group-hover:block w-72 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl shadow-slate-200/50 animate-in fade-in-50 slide-in-from-top-1 duration-200 z-50">
              <div className="grid gap-0.5">
                <DropdownItem href="/data-license" title="Enterprise Data License" description="Integrate raw listings to local ERP" icon={ShieldCheck} />
                <DropdownItem href="/custom-shortlist" title="Custom Supplier Shortlist" description="Human-curated factory vetting" icon={Sparkles} />
                <DropdownItem href="/china-exporter-database" title="Exporter Guide Directory" description="Baseline cluster mapping guide" icon={Layers} />
                <DropdownItem href="/exhibitor-intelligence-report" title="Sourcing PDF Report Details" description="Premium analytical sector report details" icon={FileText} />
                <DropdownItem href="/methodology" title="Normalization Methodology" description="Under the hood of data cleaners" icon={FileText} />
                <DropdownItem href="/data-policy" title="Data Protection Policy" description="Fields, boundaries, and regulations" icon={ShieldAlert} />
                <DropdownItem href="/contact" title="Support Help Desk" description="Contact data engineers directly" icon={Mail} />
              </div>
            </div>
          </div>
        </nav>

        {/* Right side CTA Button Panel */}
        <div className="flex shrink-0 items-center gap-2">
          {!isSignedIn ? (
            <ButtonLink href="/sign-in" variant="outline">
              Sign in
            </ButtonLink>
          ) : null}
          <ButtonLink href="/app" variant="secondary">
            Dashboard
          </ButtonLink>
          {isSignedIn ? <UserButton /> : null}
        </div>
      </div>
    </header>
  );
}

function DropdownItem({ href, title, description, icon: Icon }: { href: string; title: string; description: string; icon: LucideIcon }) {
  return (
    <Link
      href={href}
      className="flex items-start space-x-3 rounded-xl p-2.5 hover:bg-slate-50 text-slate-600 hover:text-teal-600 transition-all duration-200"
    >
      <div className="h-8 w-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center shrink-0 border border-slate-100">
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <div>
        <div className="text-xs font-bold text-slate-950 leading-tight">{title}</div>
        <div className="text-[10px] text-slate-500 mt-0.5 leading-normal">{description}</div>
      </div>
    </Link>
  );
}
