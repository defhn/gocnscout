import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("AdminBlogTable server/client boundary", () => {
  it("passes serializable sort links instead of a query-builder function", () => {
    const pageSource = readFileSync(
      resolve(process.cwd(), "src/app/admin/blog/page.tsx"),
      "utf8",
    );
    const tableSource = readFileSync(
      resolve(process.cwd(), "src/components/blog/admin-blog-table.tsx"),
      "utf8",
    );

    const tableElement = pageSource.match(/<AdminBlogTable[\s\S]*?\/>/)?.[0] ?? "";

    expect(tableElement).not.toContain("createQuery=");
    expect(tableElement).toContain("viewCountSortHref=");
    expect(tableElement).toContain("updatedAtSortHref=");
    expect(tableSource).not.toMatch(/createQuery:\s*\(/);
  });
});
