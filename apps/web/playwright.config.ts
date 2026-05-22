import { defineConfig, devices } from "@playwright/test";

const useInstalledChrome = process.env.PLAYWRIGHT_USE_INSTALLED_CHROME === "1";
const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER === "1";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  use: {
    baseURL: "http://127.0.0.1:3001",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: useInstalledChrome ? "off" : "retain-on-failure"
  },
  webServer: skipWebServer
    ? undefined
    : {
        command:
          "node ../../scripts/sync-prisma-client.mjs && node --env-file=../../.env.local ./node_modules/next/dist/bin/next dev --port 3001",
        url: "http://127.0.0.1:3001",
        reuseExistingServer: !process.env.CI
      },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(useInstalledChrome ? { channel: "chrome" } : {})
      }
    }
  ]
});
