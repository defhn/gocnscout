export const PUBLIC_SUPPLIER_FIELDS = [
  "industryName",
  "exhibitorName",
  "province",
  "city",
  "websiteUrl",
  "productsText",
  "keywordsText",
  "foundedYear",
  "registeredCapital",
  "companySize",
  "companyType",
  "tradeModes",
  "exhibitorHistory",
  "companyNature",
] as const;

export const EXPORT_SUPPLIER_FIELDS = [
  "industryName",
  "exhibitorName",
  "province",
  "city",
  "websiteUrl",
  "productsText",
  "keywordsText",
  "foundedYear",
  "registeredCapital",
  "companySize",
  "companyType",
  "tradeModes",
  "exhibitorHistory",
  "companyNature",
] as const;

export const PRIVATE_SUPPLIER_FIELDS = [
  "contactPerson",
  "mobile",
  "phone",
  "fax",
  "email",
  "fullAddress",
  "postalCode",
] as const;

export const IGNORED_SOURCE_FIELDS = [
  "创新奖",
  "CF奖",
  "多届参展",
  "品牌展商",
  "中华老字号",
  "乡村振兴特色展商",
  "新展商",
  "isSpecializedSpecializedSpecialNewEnterprise",
  "绿色奖展商",
  "海关认证展商",
  "高新展商",
] as const;

/** 官网属于公开字段,对所有访客开放。保留 planCode 参数仅为兼容旧调用。 */
export function sanitizeWebsiteAccess(_planCode: string, websiteUrl?: string | null) {
  return websiteUrl || null;
}

/** 根据参展次数返回等级标签（不含任何展会名称，合规） */
export function getExhibitionTierLabel(count: number | null | undefined): {
  label: string;
  tier: "new" | "rising" | "active" | "established" | "veteran";
} {
  if (!count || count <= 0) return { label: "New Exhibitor", tier: "new" };
  if (count === 1) return { label: "New Exhibitor", tier: "new" };
  if (count <= 3) return { label: "Rising Exhibitor", tier: "rising" };
  if (count <= 6) return { label: "Active Exhibitor", tier: "active" };
  if (count <= 10) return { label: "Established Exhibitor", tier: "established" };
  return { label: "Veteran Exhibitor", tier: "veteran" };
}
