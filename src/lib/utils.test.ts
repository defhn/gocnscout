import { describe, expect, it } from "vitest";
import { slugify, truncate } from "@/lib/utils";

describe("utils", () => {
  it("creates stable slugs", () => {
    expect(slugify("Shanghai Supplier Co., Ltd.")).toBe("shanghai-supplier-co-ltd");
  });

  it("keeps Chinese industry names in slugs", () => {
    expect(slugify("建筑及装饰材料")).toBe("建筑及装饰材料");
  });

  it("truncates long text", () => {
    expect(truncate("abcdef", 4)).toBe("abc...");
  });
});
