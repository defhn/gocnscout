import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { LegalLayout } from "@/components/layout/legal-layout";
import { createMetadata, SITE } from "@/config/seo";

export const metadata = createMetadata({
  title: "Acceptable Use Policy",
  description: "Understand allowed and restricted uses of gocnscout supplier data, exports, reports, custom shortlists, and internal research workflows.",
  path: "/legal/acceptable-use",
});

export default function AcceptableUsePage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Legal", href: "/legal/terms" }, { label: "Acceptable Use" }]} />
      <LegalLayout title="Acceptable Use Policy" activePath="/legal/acceptable-use">
        <h2>1. Purpose of this Policy</h2>
        <p>
          This Acceptable Use Policy outlines the legal boundaries, usage parameters, and functional constraints governing your search queries, CSV data exports, and category report downloads.
        </p>

        <h2>2. Permitted Sourcing Research</h2>
        <h3>2.1 Supplier Vetting & Verification</h3>
        <p>
          gocnscout is designed to support B2B importing entities, Shopify and Amazon e-commerce merchants, and wholesale agencies in mapping out Chinese production hubs. You may use our search interface to build qualified supplier pools, cross-reference exhibition years, and confirm registered capital benchmarks.
        </p>
        <h3>2.2 Internal Sourcing Vetting Workflows</h3>
        <p>
          CSV files exported from the dashboard and PDF category analysis documents may be distributed internally among your procurement officers and supply chain advisors to guide purchase decisions.
        </p>

        <h2>3. Prohibited Exploitations & Abuse Cases</h2>
        <h3>3.1 Personal Contact Scraping & Harvesting</h3>
        <p>
          You are strictly prohibited from attempting to bypass search limits, utilizing crawler scripts to scrape company directories, or reversing data filters to reconstruct private personal contacts (such as names, direct numbers, or postal coordinates).
        </p>
        <h3>3.2 Database Reselling & Redistribution</h3>
        <p>
          You may not copy, upload, license, publish, or distribute exported records to third-party databases, public directories, CSV resale portals, or lead generation marketplaces.
        </p>
        <h3>3.3 Automated API Abuse</h3>
        <p>
          Unless granted explicit licensing rights, you are prohibited from building scripts or crawlers that trigger heavy queries on our search server endpoints, bypass authentication mechanisms, or overload neonatal servers.
        </p>

        <h2>4. Reporting Abuse & Compliance Inquiries</h2>
        <p>
          If you detect or suspect any unauthorized harvesting, reselling, or digital compliance violations regarding the records displayed on our platform, report the case to our compliance officer: <strong>{SITE.supportEmail}</strong>.
        </p>
      </LegalLayout>
    </>
  );
}
