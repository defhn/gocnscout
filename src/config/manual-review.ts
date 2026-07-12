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

export const MANUAL_REVIEW_PACKAGES: ManualReviewPackage[] = [
  {
    code: "IDENTITY_SINGLE",
    name: "Supplier Identity Check",
    shortName: "Identity Check",
    amountUsdCents: 14900,
    supplierSlots: 1,
    delivery: "Delivered within 24-48 hours",
    description: "A focused human review of one supplier's public identity, marketplace profile, and basic consistency signals.",
    features: [
      "One Alibaba store or company website reviewed",
      "Public business and marketplace consistency check",
      "Basic website footprint and product-line fit",
      "Manual risk notes and document request list",
    ],
  },
  {
    code: "IDENTITY_BUNDLE",
    name: "Supplier Identity Check - 3 Suppliers",
    shortName: "3 Identity Checks",
    amountUsdCents: 39900,
    supplierSlots: 3,
    delivery: "Delivered within 24-48 hours",
    description: "The same focused identity review for up to three supplier targets in one request.",
    features: [
      "Up to three Alibaba stores or company websites reviewed",
      "Public business and marketplace consistency check",
      "Basic website footprint and product-line fit",
      "Manual risk notes and document request list",
    ],
  },
  {
    code: "DECISION_SINGLE",
    name: "Buyer Decision Review",
    shortName: "Decision Review",
    amountUsdCents: 24900,
    supplierSlots: 1,
    delivery: "Delivered within 24-48 hours",
    description: "A deeper human judgment pass for buyers deciding whether to contact, sample, continue, or pause.",
    features: [
      "Everything in Supplier Identity Check",
      "Human deep judgment across marketplace, official site, and social signals",
      "Target product and destination-market context",
      "Buyer decision notes, RFQ questions, and next-step recommendation",
    ],
  },
  {
    code: "DECISION_BUNDLE",
    name: "Buyer Decision Review - 3 Suppliers",
    shortName: "3 Decision Reviews",
    amountUsdCents: 49900,
    supplierSlots: 3,
    delivery: "Delivered within 24-48 hours",
    description: "Deeper buyer decision support for up to three supplier targets in one request.",
    features: [
      "Up to three suppliers reviewed",
      "Human deep judgment across marketplace, official site, and social signals",
      "Target product and destination-market context",
      "Buyer decision notes, RFQ questions, and next-step recommendation",
    ],
  },
];

export function getManualReviewPackage(code: string): ManualReviewPackage {
  const pkg = MANUAL_REVIEW_PACKAGES.find((item) => item.code === code);
  if (!pkg) {
    throw new Error(`Unknown manual review package: ${code}`);
  }
  return pkg;
}
