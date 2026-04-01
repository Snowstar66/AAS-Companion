import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react"
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@aas-companion/domain/navigation": fileURLToPath(new URL("../../packages/domain/src/navigation.ts", import.meta.url))
    }
  },
  test: {
    environment: "jsdom",
    include: ["src/test/**/*.test.ts?(x)"]
  }
});
