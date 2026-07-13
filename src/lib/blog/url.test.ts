import { describe, expect, it } from "vitest";
import { blogPostUrl } from "@/lib/blog/url";

describe("blogPostUrl", () => {
  it("does not duplicate slashes when APP_URL has a trailing slash", () => {
    const previousAppUrl = process.env.APP_URL;
    process.env.APP_URL = "https://gocnscout.com/";

    try {
      expect(blogPostUrl("get-refund-alibaba-suppliers")).toBe(
        "https://gocnscout.com/blog/get-refund-alibaba-suppliers",
      );
    } finally {
      if (previousAppUrl === undefined) {
        delete process.env.APP_URL;
      } else {
        process.env.APP_URL = previousAppUrl;
      }
    }
  });
});
