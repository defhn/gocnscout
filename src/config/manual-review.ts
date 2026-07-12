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
  "Company identity check: company name / legal entity name, registration number / unified social credit code, registered address, legal representative, registered capital, establishment date / establishment year, registration status / business status, business scope, and import/export-related fields when available",
  "Alibaba / website consistency check: store name, company name, address, contact details, product category, and whether the business scope broadly matches the target product",
  "Basic risk screen: business abnormality, serious violation, dishonest judgment debtor / enforcement records, administrative penalty, and obvious litigation-risk signals",
  "Website and public footprint check: whether the official site is reachable, whether the site owner signals match the company, whether the product line is consistent, and whether contact details look reasonable",
  "Short human conclusion: initial confidence, main risk points, and documents the buyer should request before payment",
];

const DECISION_REVIEW_FEATURES = [
  "Everything in Supplier Identity Check",
  "Ownership and control judgment: shareholder structure, group / subsidiary signals, possible entity-mixing risk, and historical shareholder / representative / address changes",
  "Legal and operating-risk interpretation: litigation types, hearing trends, enforcement / dishonest debtor risk, administrative penalties, equity pledge, and business abnormality signals",
  "Operating capability check: certificates, administrative licenses, import/export credit, tender / business activity, insured employee count, and scale signals",
  "IP and brand signal check: trademarks, patents, software copyrights, website filings, standards information, and whether IP signals support the supplier's product claims",
  "Social / content platform judgment: Xiaohongshu, Douyin, and Zhihu public signals checked manually when available",
  "Buyer decision advice: whether to contact, request samples, or pause, plus RFQ questions, document request list, and payment-before-order notes",
];

export const MANUAL_REVIEW_PACKAGES: ManualReviewPackage[] = [
  {
    code: "IDENTITY_SINGLE",
    name: "Supplier Identity Check",
    shortName: "Identity Check",
    amountUsdCents: 14900,
    supplierSlots: 1,
    delivery: "Delivered within 24-48 hours",
    description: "Basic identity verification and obvious-risk screening for one supplier before you contact or pay.",
    features: IDENTITY_CHECK_FEATURES,
  },
  {
    code: "IDENTITY_BUNDLE",
    name: "Supplier Identity Check - 3 Suppliers",
    shortName: "3 Identity Checks",
    amountUsdCents: 39900,
    supplierSlots: 3,
    delivery: "Delivered within 24-48 hours",
    description: "Basic identity verification and obvious-risk screening for up to three supplier targets.",
    features: [
      "Up to three Alibaba stores or company websites reviewed",
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
    description: "A deeper buyer-decision review for deciding whether to contact, request samples, continue negotiation, or pause.",
    features: DECISION_REVIEW_FEATURES,
  },
  {
    code: "DECISION_BUNDLE",
    name: "Buyer Decision Review - 3 Suppliers",
    shortName: "3 Decision Reviews",
    amountUsdCents: 49900,
    supplierSlots: 3,
    delivery: "Delivered within 24-48 hours",
    description: "Deeper buyer-decision support for up to three supplier targets.",
    features: [
      "Up to three suppliers reviewed",
      ...DECISION_REVIEW_FEATURES,
    ],
  },
];

export const SINGLE_SUPPLIER_MANUAL_REVIEW_PACKAGES = MANUAL_REVIEW_PACKAGES.filter((pkg) => pkg.supplierSlots === 1);

export const MANUAL_REVIEW_COMPARISON_ROWS: ManualReviewComparisonRow[] = [
  {
    feature: "Best for",
    identity: "Basic identity verification and obvious-risk screening before first contact.",
    decision: "Buyer decision support before contact, samples, negotiation, or payment.",
  },
  {
    feature: "Company identity fields",
    identity: "Company name, registration number / unified social credit code, address, legal representative, registered capital, establishment date, status, business scope, import/export fields when available.",
    decision: "Included, plus interpretation against buyer risk and supplier positioning.",
  },
  {
    feature: "Alibaba / website consistency",
    identity: "Store name, company name, address, contact details, product category, and business-scope fit.",
    decision: "Included, plus judgment on entity-mixing, product-line mismatch, and whether the supplier looks like factory, brand owner, group company, or trader.",
  },
  {
    feature: "Basic risk screen",
    identity: "Business abnormality, serious violation, dishonest debtor / enforcement records, administrative penalty, and obvious litigation-risk signals.",
    decision: "Included, with human interpretation of severity and whether the risk affects sampling, prepayment, or long-term cooperation.",
  },
  {
    feature: "Ownership and control",
    identity: "Not included beyond basic public identity fields.",
    decision: "Shareholder structure, group / subsidiary signals, possible entity-mixing risk, and historical shareholder / representative / address changes.",
  },
  {
    feature: "Legal and operating-risk interpretation",
    identity: "Basic obvious-risk screen only.",
    decision: "Litigation types, hearing trends, enforcement / dishonest debtor risk, administrative penalties, equity pledge, and business abnormality signals.",
  },
  {
    feature: "Operating capability",
    identity: "Basic public footprint only.",
    decision: "Certificates, administrative licenses, import/export credit, tender / business activity, insured employee count, and scale signals.",
  },
  {
    feature: "IP and brand signals",
    identity: "Not included as a deep review.",
    decision: "Trademarks, patents, software copyrights, website filings, standards information, and whether IP signals support product claims.",
  },
  {
    feature: "Social / content platforms",
    identity: "Not included.",
    decision: "Xiaohongshu, Douyin, and Zhihu public signals checked manually when available.",
  },
  {
    feature: "Buyer decision output",
    identity: "Initial confidence, main risk points, and documents to request before payment.",
    decision: "Contact / request sample / pause recommendation, RFQ questions, document request list, and payment-before-order notes.",
  },
];

export function getManualReviewPackage(code: string): ManualReviewPackage {
  const pkg = MANUAL_REVIEW_PACKAGES.find((item) => item.code === code);
  if (!pkg) {
    throw new Error(`Unknown manual review package: ${code}`);
  }
  return pkg;
}
