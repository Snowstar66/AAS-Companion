import { describe, expect, it } from "vitest";
import { resolveAuthCallbackUrl, resolvePublicSiteUrl } from "@/lib/auth/public-site-url";

describe("public auth site url resolution", () => {
  it("falls back to the incoming request origin when no site url is configured", () => {
    expect(
      resolvePublicSiteUrl({
        requestUrl: "https://aas-companion.vercel.app/login"
      })
    ).toBe("https://aas-companion.vercel.app");
  });

  it("uses the configured site url when it is a valid non-localhost value", () => {
    expect(
      resolvePublicSiteUrl({
        requestUrl: "https://aas-companion-git-feature.vercel.app/login",
        configuredSiteUrl: "https://app.example.com"
      })
    ).toBe("https://app.example.com/");
  });

  it("ignores localhost config in production and uses the request origin instead", () => {
    expect(
      resolveAuthCallbackUrl({
        requestUrl: "https://aas-companion.vercel.app/login",
        configuredSiteUrl: "http://localhost:3000",
        nodeEnv: "production"
      })
    ).toBe("https://aas-companion.vercel.app/auth/callback");
  });
});
