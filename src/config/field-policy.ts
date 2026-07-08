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

export function sanitizeWebsiteAccess(planCode: string, websiteUrl?: string | null) {
  if (!websiteUrl) return null;
  return planCode === "FREE" ? null : websiteUrl;
}
