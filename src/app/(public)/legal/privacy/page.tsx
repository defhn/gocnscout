import { Breadcrumbs } from "@/components/layout/breadcrumb";
import { LegalLayout } from "@/components/layout/legal-layout";
import { createMetadata, SITE } from "@/config/seo";

export const metadata = createMetadata({
  title: "Privacy Policy",
  description: "Read how gocnscout handles account data, billing data, support requests, analytics, and compliant supplier data publication rules.",
  path: "/legal/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Legal", href: "/legal/terms" }, { label: "Privacy" }]} />
      <LegalLayout title="Privacy Policy" activePath="/legal/privacy">
        <h2>1. Overview and Core Philosophy</h2>
        <p>
          At gocnscout, data safety and regulatory compliance are integral to our operations. We maintain a strict boundary separating customer account profiles from the public industrial supplier analytics processed on our directories.
        </p>

        <h2>2. Information We Process</h2>
        <h3>2.1 Customer Account Profiles</h3>
        <p>
          To handle enquiries, paid services and administration, we may log email addresses, names, messages you send us, payment details handled by Stripe, and basic session diagnostics. Browsing the company directory and downloading reports does not require an account.
        </p>
        <h3>2.2 Supplier Compliance Data Boundaries</h3>
        <p>
          gocnscout collects corporate identity attributes only. In accordance with digital asset laws and international privacy expectations (GDPR, CCPA), we completely scrub private contact details—including personal cell numbers, representative names, domestic addresses, and postal codes—from all export features, PDF files, and search listings.
        </p>

        <h2>3. Third-Party Service Providers</h2>
        <p>
          We partner with industry-standard secure services to host, optimize, and secure user metrics. These providers include:
        </p>
        <ul className="list-disc pl-5 space-y-2 mb-4">
          <li><strong>Clerk</strong>: User identity verification and secure authentication flows.</li>
          <li><strong>Stripe</strong>: Encrypted checkout processing for paid human services.</li>
          <li><strong>Discord</strong>: Our community runs on Discord, a third-party platform with its own privacy practices.</li>
          <li><strong>Self-hosted PostgreSQL &amp; Cloudflare R2</strong>: Application data is stored in a PostgreSQL database on our own server; report and image files are served from Cloudflare R2.</li>
          <li><strong>PostHog & Sentry</strong>: User experience analytics and automated code crash diagnostic logs.</li>
        </ul>

        <h2>4. Data Subject Rights & GDPR Alignment</h2>
        <p>
          Registered customers possess full rights to view, export, restrict, or delete their profile information directly. If you represent an exhibitor listed in our database and wish to verify, request updates, or check the non-sensitive nature of your public listing, you may request database verification reviews anytime.
        </p>

        <h2>5. Privacy Support & Contact Details</h2>
        <p>
          gocnscout dynamically evaluates its processing procedures to assure compliance with China&apos;s Data Security Law and other regulatory requirements. Privacy inquiries or removal requests may be addressed to our data protection team: <strong>{SITE.supportEmail}</strong>.
        </p>
      </LegalLayout>
    </>
  );
}
