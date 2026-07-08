import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="container-page py-4 text-sm text-slate-500">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1">
            {index > 0 ? <ChevronRight className="h-3.5 w-3.5" aria-hidden /> : null}
            {item.href ? (
              <Link className="hover:text-slate-900" href={item.href}>
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-900">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
