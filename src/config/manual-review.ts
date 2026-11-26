import type { ManualReviewPackageCode } from "@/server/analysis/contract";

export type ManualReviewPackage = {
  code: ManualReviewPackageCode;
  name: string;
  shortName: string;
  amountUsdCents: number;
  supplierSlots: 1 | 3;
  delivery: string;
  description: string;
  features: string[];
};

export type ManualReviewComparisonRow = {
  feature: string;
  identity: string;
  decision: string;
};

const IDENTITY_CHECK_FEATURES = [
  "Company identity check (public registry data, not a scanned license copy): company name / legal entity name, registration number / unified social credit code, registered address (text), legal representative, registered capital (and paid-in capital when disclosed), establishment date / establishment year, registration status / business status (including deregistration / simplified cancellation notices), business scope, and import/export-related fields when available",
  "Alibaba / website consistency check (when a website or B2B store link is provided or publicly listed): store name, company name, address, contact details, product category, and whether the business scope broadly matches the target product — explicitly noting when no official website exists",
  "Basic risk screen: business abnormality, serious violation, dishonest judgment debtor / enforcement records (current & historical), administrative penalty, deregistration flags, and obvious litigation-risk signals",
  "Website and public footprint check (when publicly available): whether the official site is reachable, whether ICP / site owner signals match the company, whether the product line is consistent, and whether public contact details look reasonable",
  "Short human conclusion: initial confidence, main risk points, and documents the buyer should request directly from the supplier before payment (e.g. stamped business license, bank beneficiary confirmation, and overseas product test reports)",
];

const DECISION_REVIEW_FEATURES = [
  "Everything in Supplier Identity Check",
  "Ownership and control judgment: shareholder structure, group / subsidiary signals, possible entity-mixing risk (including related entities sharing phone/email), and historical shareholder / representative / address / capital changes",
  "Legal and operating-risk interpretation: litigation types (plaintiff vs defendant), hearing trends, enforcement / dishonest debtor risk (current & historical), administrative penalties, chattel mortgages, guarantees, equity pledge, labor arbitrations, and business abnormality signals",
  "Operating capability check: domestic Chinese public certificates & status (valid / revoked / expired, e.g. ISO / customs exporter registration), administrative licenses, import/export credit, tax & environmental credit ratings, tender / recruitment / business activity, insured employee count, and scale signals",
  "IP and brand signal check: trademarks (valid vs invalid), patents (active vs terminated for unpaid annuity), software copyrights, website filings, standards information, and whether IP signals support the supplier's product claims",
  "Social / content platform judgment: Xiaohongshu, Douyin, and Zhihu public signals checked manually when available",
  "Buyer decision advice: whether to contact, request samples, or pause, plus tailored RFQ questions, document request list (business license scan, bank account proof, overseas CE/FCC/FDA test reports), and payment-before-order notes",
];

export const MANUAL_REVIEW_PACKAGES: ManualReviewPackage[] = [
  {
    code: "IDENTITY_SINGLE",
    name: "Supplier Identity Check",
    shortName: "Identity Check",
    amountUsdCents: 14900,
    supplierSlots: 1,
    delivery: "Delivered within 24-48 hours",
    description:
      "Pure online desk research on Chinese public corporate & credit records for one supplier. (No on-site visits, phone calls, bank-account checks, or overseas lab-certificate audits).",
    features: IDENTITY_CHECK_FEATURES,
  },
  {
    code: "IDENTITY_BUNDLE",
    name: "Supplier Identity Check - 3 Suppliers",
    shortName: "3 Identity Checks",
    amountUsdCents: 39900,
    supplierSlots: 3,
    delivery: "Delivered within 24-48 hours",
    description: "Pure online desk research & public record verification for up to three supplier targets.",
    features: [
      "Up to three company profiles or B2B store links reviewed",
      ...IDENTITY_CHECK_FEATURES,
    ],
  },
  {
    code: "DECISION_SINGLE",
    name: "Buyer Decision Review",
    shortName: "Decision Review",
    amountUsdCents: 24900,
    supplierSlots: 1,
    delivery: "Delivered within 24-48 hours",
    description:
      "Deep online desk research across Chinese corporate, court, mortgage, IP, domestic certificate, and social signals before payment. (No phone calls, on-site visits, bank checks, or overseas certificate audits).",
    features: DECISION_REVIEW_FEATURES,
  },
  {
    code: "DECISION_BUNDLE",
    name: "Buyer Decision Review - 3 Suppliers",
    shortName: "3 Decision Reviews",
    amountUsdCents: 49900,
    supplierSlots: 3,
    delivery: "Delivered within 24-48 hours",
    description: "Deep online desk research & risk interpretation for up to three supplier targets.",
    features: [
      "Up to three suppliers reviewed via multi-source Chinese public data",
      ...DECISION_REVIEW_FEATURES,
    ],
  },
];

export const SINGLE_SUPPLIER_MANUAL_REVIEW_PACKAGES = MANUAL_REVIEW_PACKAGES.filter((pkg) => pkg.supplierSlots === 1);

export const MANUAL_REVIEW_COMPARISON_ROWS: ManualReviewComparisonRow[] = [
  {
    feature: "Best for",
    identity: "Basic identity verification, deregistration flags, and obvious-risk screening before first contact.",
    decision: "Deep buyer decision support before samples, negotiation, or paying a deposit.",
  },
  {
    feature: "Company identity fields",
    identity:
      "Company name, registration number / unified social credit code, registered address text, legal representative, registered/paid-in capital, establishment date, active/deregistration status, business scope, import/export fields when available.",
    decision: "Included, plus full interpretation against buyer risk and manufacturer vs trader positioning.",
  },
  {
    feature: "Alibaba / website consistency",
    identity:
      "When a website or B2B store link is provided/public: store name, company name, address, contact details, product category, and business-scope fit (noting clearly if no official site exists).",
    decision:
      "Included, plus judgment on entity-mixing, related companies sharing phone/email, and whether the supplier looks like a factory, brand owner, or trading desk.",
  },
  {
    feature: "Basic risk screen",
    identity:
      "Business abnormality, serious violation, deregistration notices, dishonest debtor / enforcement records, administrative penalty, and obvious litigation-risk signals.",
    decision:
      "Included, with human interpretation of severity (current & historical) and whether the risk affects sampling, prepayment, or long-term cooperation.",
  },
  {
    feature: "Ownership and control",
    identity: "Not included beyond basic public identity fields.",
    decision:
      "Shareholder structure, group / subsidiary / branch signals, related entities sharing phone/email (entity-mixing risk), and historical shareholder / representative / capital / address changes.",
  },
  {
    feature: "Legal and operating-risk interpretation",
    identity: "Basic obvious-risk screen only.",
    decision:
      "Litigation types (plaintiff vs defendant), hearing trends, current & historical enforcement / dishonest debtor risk, administrative penalties, chattel mortgages, guarantees, equity pledge, labor arbitrations, and deregistration flags.",
  },
  {
    feature: "Operating capability",
    identity: "Basic public footprint only.",
    decision:
      "Domestic Chinese public certificates & valid/revoked/expired status (ISO / customs), administrative licenses, tax/environmental/customs credit ratings, recruitment activity, insured employee count, and scale signals.",
  },
  {
    feature: "IP and brand signals",
    identity: "Not included as a deep review.",
    decision:
      "Trademarks (valid vs invalid), patents (active vs terminated for unpaid annuity), software copyrights, website ICP filings, standards information, and whether IP signals support product claims.",
  },
  {
    feature: "Social / content platforms",
    identity: "Not included.",
    decision: "Xiaohongshu, Douyin, and Zhihu public signals checked manually when available.",
  },
  {
    feature: "Buyer decision output",
    identity:
      "Initial confidence, main risk points, and documents to request from the supplier (business license scan, bank proof, overseas test reports).",
    decision:
      "Contact / request sample / pause recommendation, tailored RFQ questions, supplier document request list, and payment-before-order risk notes.",
  },
];

export function getManualReviewPackage(code: string): ManualReviewPackage {
  const pkg = MANUAL_REVIEW_PACKAGES.find((item) => item.code === code);
  if (!pkg) {
    throw new Error(`Unknown manual review package: ${code}`);
  }
  return pkg;
}
