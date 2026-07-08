import { describe, expect, it } from "vitest";
import { EXPORT_SUPPLIER_FIELDS, IGNORED_SOURCE_FIELDS, PRIVATE_SUPPLIER_FIELDS } from "@/config/field-policy";

describe("field policy", () => {
  it("never exports private contact fields", () => {
    for (const field of PRIVATE_SUPPLIER_FIELDS) {
      expect(EXPORT_SUPPLIER_FIELDS).not.toContain(field as never);
    }
  });

  it("keeps ignored award and tag fields out of the product", () => {
    expect(IGNORED_SOURCE_FIELDS).toContain("创新奖");
    expect(IGNORED_SOURCE_FIELDS).toContain("高新展商");
    expect(IGNORED_SOURCE_FIELDS).toContain("isSpecializedSpecializedSpecialNewEnterprise");
  });
});
