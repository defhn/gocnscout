import Link from "next/link";
import { DISCORD_INVITE_URL } from "@/config/community";
import { SITE } from "@/config/seo";

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-white">
      <div className="container-page grid gap-8 py-10 md:grid-cols-5">
        <div>
          <div className="flex items-center gap-2 text-lg font-extrabold text-slate-950">
            <img src="/logo-96.webp" alt="GoCNScout Logo" width={40} height={40} className="h-10 w-10 object-contain" />
            <span>gocnscout</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Non-sensitive supplier research tools based on China sourcing exhibition registries.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-950">Product</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <Link href="/about">About</Link>
            <Link href="/database">Database</Link>
            <Link href="/industries">Industries</Link>
            <Link href="/products">Products</Link>
            <Link href="/cities">Cities</Link>
            <Link href="/pricing">Human Services</Link>
            <Link href="/sitemap">Sitemap</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-950">Services</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <Link href="/sample-report">Sample Report</Link>
            <Link href="/data-license">Data License</Link>
            <Link href="/china-exporter-database">China Exporter Database</Link>
            <a href={DISCORD_INVITE_URL} target="_blank" rel="noopener noreferrer">Join Discord</a>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-950">Legal</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <Link href="/methodology">Methodology</Link>
            <Link href="/data-policy">Data Policy</Link>
            <Link href="/legal/terms">Terms</Link>
            <Link href="/legal/privacy">Privacy</Link>
            <Link href="/legal/refund-policy">Refund Policy</Link>
            <Link href="/legal/acceptable-use">Acceptable Use</Link>
            <Link href="/llms.txt">LLMs.txt</Link>
            <Link href="/pricing.md">Pricing.md</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-950">Support</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-600">
            <Link href="/contact">Contact</Link>
            <span>{SITE.supportEmail}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
