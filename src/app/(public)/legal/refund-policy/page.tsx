import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { LegalLayout } from "@/components/layout/legal-layout";
import { createMetadata, SITE } from "@/config/seo";

export const metadata = createMetadata({
  title: "Refund Policy | gocnscout",
  description: "Refund Policy for gocnscout database subscriptions, category reports, and custom shortlists.",
  path: "/legal/refund-policy",
});

export default function RefundPolicyPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Legal", href: "/legal/terms" }, { label: "Refund Policy" }]} />
      <LegalLayout title="Refund Policy" activePath="/legal/refund-policy">
        <h2>1. Overview of Digital Assets</h2>
        <p>
          gocnscout provides digital services, downloadable CSV exports, custom shortlist research, and digital PDF whitepapers. Because digital assets are accessible immediately upon delivery, we implement strict guidelines to prevent platform exploitation.
        </p>

        <h2>2. Database Subscriptions</h2>
        <h3>2.1 Self-Service Cancellation</h3>
        <p>
          Subscribers can terminate their Starter, Pro, or Team monthly plans anytime via their Stripe-powered billing dashboard. Cancellation stops subsequent billing auto-renewals. Access to advanced queries and export allowances remains valid until the current billing cycle expires.
        </p>
        <h3>2.2 Subscription Refund Audits</h3>
        <p>
          If you encounter unexpected technical errors or billing discrepancies, refund requests can be directed to support. We review account logs prior to issuing refunds. Accounts that have initiated CSV data exports, downloaded reports, or viewed multiple profile details are ineligible for subscription refunds.
        </p>

        <h2>3. Standalone PDF Reports and Custom Shortlists</h2>
        <h3>3.1 PDF Market Analysis Reports</h3>
        <p>
          All PDF category analysis reports are considered digital download items. Once a PDF file is processed and delivered via the dashboard, the transaction is final and non-refundable. If a system failure blocks PDF file delivery, contact support for immediate assistance.
        </p>
        <h3>3.2 Custom Sourcing Shortlists</h3>
        <p>
          Custom supplier shortlists are personalized consulting requests. Sourcing agents allocate time to cross-reference data and draft profiles. Sourcing requests are non-refundable once researching work has been initiated. If research cannot be completed due to category constraints, we will issue a full refund.
        </p>

        <h2>4. Vetting Support Contact</h2>
        <p>
          Direct all questions regarding billing portals, Stripe errors, or refund requests to our billing support staff: <strong>{SITE.supportEmail}</strong>.
        </p>
      </LegalLayout>
    </>
  );
}
