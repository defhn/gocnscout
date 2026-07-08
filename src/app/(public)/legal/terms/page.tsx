import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { LegalLayout } from "@/components/layout/legal-layout";
import { createMetadata, SITE } from "@/config/seo";

export const metadata = createMetadata({
  title: "Terms of Service | gocnscout",
  description: "Terms of Service for using the gocnscout supplier intelligence platform.",
  path: "/legal/terms",
});

export default function TermsPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Legal", href: "/legal/terms" }, { label: "Terms" }]} />
      <LegalLayout title="Terms of Service" activePath="/legal/terms">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or utilizing the gocnscout platform, database, category reports, and custom shortlist services, you expressly agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you are prohibited from utilizing our digital assets and platform APIs.
        </p>

        <h2>2. Service Scope and Database Access</h2>
        <h3>2.1 Supplier Database Research</h3>
        <p>
          gocnscout provides analytical directories compile using non-sensitive, public manufacturer registry listings, export exhibition catalogs, and active company website records. The platform is designed strictly for manufacturer cluster mapping and capability research.
        </p>
        <h3>2.2 Compliance Boundary & Sensitive Data Exclusion</h3>
        <p>
          We deliberately exclude personal identifiers, direct mobile phone catalogs, home addresses, private emails, and fax listings from all public listings, dashboard views, CSV downloads, and reports. The service is provided to support procurement diligence, not direct marketing lists resale.
        </p>
        <h3>2.3 No Procurement Guarantee</h3>
        <p>
          gocnscout gathers public business intelligence. We do not underwrite, guarantee, or represent manufacturer product quality, financial solvency, logistics delivery capacities, pricing accuracy, or legal compliance. Sourcing entities retain absolute responsibility for sample tests and physical factory audits.
        </p>

        <h2>3. User Responsibilities & Acceptable Use</h2>
        <h3>3.1 Independent Verification Vetting</h3>
        <p>
          Users agree to implement independent vetting procedures (such as hiring third-party inspection firms, requesting registration scopes, and ordering gold samples) prior to executing contract negotiations or transferring payments to listed suppliers.
        </p>
        <h3>3.2 Prohibited Exploitation and Abuse</h3>
        <p>
          You are strictly prohibited from harvesting database rows to reconstruct direct email list targets, conducting mass marketing spam, scraping platform UI codes, reselling exported CSV data, or sharing subscription accounts across unauthorized team seats.
        </p>

        <h2>4. Billing, Stripe Portal & Terminations</h2>
        <p>
          All premium plans, custom shortlists, and PDF reports are managed securely via Stripe. Subscriptions automatically renew monthly unless canceled through the Stripe self-service billing portal. Failure to pay monthly billing allocations will result in immediate termination of search limits and dashboard export privileges.
        </p>

        <h2>5. Modifications & Contact Information</h2>
        <p>
          gocnscout reserves the right to modify these terms to align with China&apos;s Data Security Law, GDPR, and other regulatory frameworks. Continued utilization of our platform constitutes agreement to terms updates. Direct policy questions to our data support inbox: <strong>{SITE.supportEmail}</strong>.
        </p>
      </LegalLayout>
    </>
  );
}
