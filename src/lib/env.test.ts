import { describe, expect, it, vi } from "vitest";

describe("getR2PublicBaseUrl", () => {
  it("uses the legacy R2_PUBLIC_URL when R2_PUBLIC_BASE_URL is not configured", async () => {
    const previousBaseUrl = process.env.R2_PUBLIC_BASE_URL;
    const previousLegacyUrl = process.env.R2_PUBLIC_URL;
    delete process.env.R2_PUBLIC_BASE_URL;
    process.env.R2_PUBLIC_URL = "https://images.example.com";
    vi.resetModules();

    try {
      const { getR2PublicBaseUrl } = await import("@/lib/env");

      expect(getR2PublicBaseUrl()).toBe("https://images.example.com");
    } finally {
      if (previousBaseUrl === undefined) delete process.env.R2_PUBLIC_BASE_URL;
      else process.env.R2_PUBLIC_BASE_URL = previousBaseUrl;
      if (previousLegacyUrl === undefined) delete process.env.R2_PUBLIC_URL;
      else process.env.R2_PUBLIC_URL = previousLegacyUrl;
      vi.resetModules();
    }
  });
});
