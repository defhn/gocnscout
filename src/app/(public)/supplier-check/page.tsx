import { AnalysisForm } from "@/components/supplier-check/analysis-form";
import { createMetadata } from "@/config/seo";

export const metadata = createMetadata({
  title: "Free Alibaba Supplier Check",
  description: "Paste an Alibaba product page, store page, or supplier website URL to get a public-source first-pass supplier analysis.",
  path: "/supplier-check",
});

export default function SupplierCheckPage({
  searchParams,
}: {
  searchParams?: Promise<{ url?: string }>;
}) {
  return (
    <section className="container-page py-12 md:py-16">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-bold uppercase tracking-wide text-teal-700">Free supplier screening tool</p>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
          Check an Alibaba product, supplier store, or company website
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
          Enter any public supplier-related URL. If it is a product page, we keep that product context, identify the supplier or website homepage, then expand from the homepage into key public pages.
        </p>
        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5">
          <SupplierCheckFormLoader searchParams={searchParams} />
        </div>
        <div className="mt-6 grid gap-4 text-sm leading-6 text-slate-600 md:grid-cols-3">
          <div>Works with Alibaba product pages, storefront subpages, official homepages, and official product pages.</div>
          <div>No login, contact unlocking, CAPTCHA bypass, or private data collection.</div>
          <div>Use human review when purchase decisions require cross-source judgment.</div>
        </div>
      </div>
    </section>
  );
}

async function SupplierCheckFormLoader({
  searchParams,
}: {
  searchParams?: Promise<{ url?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  return <AnalysisForm initialUrl={params.url || ""} />;
}
