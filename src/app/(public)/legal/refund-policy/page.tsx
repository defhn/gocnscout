import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { LegalLayout } from "@/components/layout/legal-layout";
import { createMetadata, SITE } from "@/config/seo";

export const metadata = createMetadata({
  title: "Refund Policy",
  description: "Review refund rules for gocnscout human supplier reviews, custom supplier shortlists, data licenses, and legacy subscriptions.",
  path: "/legal/refund-policy",
});

export default function RefundPolicyPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Legal", href: "/legal/terms" }, { label: "Refund Policy" }]} />
      <LegalLayout title="Refund Policy" activePath="/legal/refund-policy">
        <h2>1. Overview</h2>
        <p>
          The company database, sourcing guides and Discord community are free and involve no payment. This policy covers paid
          human services: supplier identity checks, buyer decision reviews, custom supplier shortlists and data licenses.
        </p>

        <h2>2. Scope Is Confirmed Before Payment</h2>
        <p>
          We confirm what will be checked, what cannot be checked, the price and the timeline with you before sending a payment
          link. Please review that confirmation carefully before you pay.
        </p>

        <h2>3. Human Reviews and Shortlists</h2>
        <h3>3.1 Before work starts</h3>
        <p>
          If you change your mind before research work has started, contact us and we will refund the payment in full.
        </p>
        <h3>3.2 After work has started</h3>
        <p>
          These services are personalized research that takes analyst time, so they are generally non-refundable once work has
          started. If we cannot complete the agreed scope, for example because the required public records are not available,
          we will refund the affected part or the full amount as appropriate.
        </p>
        <h3>3.3 Nature of the result</h3>
        <p>
          A review is research on public information. It does not guarantee that a supplier is safe, compliant or suitable for
          payment, and a disappointing supplier outcome by itself is not a basis for a refund.
        </p>

        <h2>4. Data Licenses</h2>
        <p>Data license terms and refund conditions are agreed in writing with each licensee before payment.</p>

        <h2>5. Legacy Subscriptions and Report Purchases</h2>
        <p>
          Database subscriptions and standalone PDF reports are no longer offered. Existing customers can contact support about
          cancellation or billing questions for past purchases.
        </p>

        <h2>6. Contact</h2>
        <p>
          Direct questions about payments or refund requests to: <strong>{SITE.supportEmail}</strong>.
        </p>
      </LegalLayout>
    </>
  );
}
