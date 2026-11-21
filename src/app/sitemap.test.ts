import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  industryPage: { findMany: vi.fn() },
  productKeywordPage: { findMany: vi.fn() },
  cityPage: { findMany: vi.fn() },
  blogPost: { findMany: vi.fn() },
  supplier: { groupBy: vi.fn() },
}));
vi.mock("@/lib/db", () => ({ prisma: db }));
import sitemap, { dynamic } from "./sitemap";

describe("sitemap", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    const updatedAt = new Date("2026-01-01T00:00:00Z");
    db.industryPage.findMany.mockResolvedValue([{ slug: "toys", updatedAt }]);
    db.productKeywordPage.findMany.mockResolvedValue([{ slug: "dolls", updatedAt }]);
    db.cityPage.findMany.mockResolvedValue([
      { slug: "city-a", city: "Shared", province: "A", updatedAt },
      { slug: "city-b", city: "Shared", province: "B", updatedAt },
    ]);
    db.blogPost.findMany.mockResolvedValue([{ slug: "guide", updatedAt }]);
    db.supplier.groupBy.mockResolvedValue([{ city: "Shared", province: "B", industrySlug: "toys" }]);
  });

  it("includes public listings and maps city-industry pages to the right province", async () => {
    const urls = (await sitemap()).map((entry) => new URL(entry.url).pathname);
    expect(dynamic).toBe("force-dynamic");
    expect(urls).toEqual(expect.arrayContaining(["/blog", "/blog/guide", "/industries/toys", "/products/dolls", "/cities/city-a", "/cities/city-b", "/cities/city-b/toys"]));
    expect(urls).not.toContain("/cities/city-a/toys");
    expect(db.blogPost.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { status: "PUBLISHED" } }));
    expect(db.industryPage.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { isIndexable: true } }));
  });

  it("fails instead of returning a misleading partial sitemap when the database is unavailable", async () => {
    db.blogPost.findMany.mockRejectedValue(new Error("database unavailable"));
    await expect(sitemap()).rejects.toThrow("database unavailable");
  });
});
