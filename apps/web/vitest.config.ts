import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const domainSourceRoot = `${fileURLToPath(new URL("../../packages/domain/src/", import.meta.url)).replace(/\\/g, "/")}$1.ts`;

export default defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react"
  },
  resolve: {
    alias: [
      {
        find: "@aas-companion/domain/navigation",
        replacement: fileURLToPath(new URL("../../packages/domain/src/navigation.ts", import.meta.url))
      },
      {
        find: "@aas-companion/domain/demo",
        replacement: fileURLToPath(new URL("../../packages/domain/src/demo.ts", import.meta.url))
      },
      {
        find: /^@aas-companion\/domain\/(.+)$/,
        replacement: domainSourceRoot
      },
      {
        find: "@aas-companion/domain",
        replacement: fileURLToPath(new URL("../../packages/domain/src/index.ts", import.meta.url))
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url))
      }
    ]
  },
  test: {
    environment: "jsdom",
    include: ["src/test/**/*.test.ts?(x)"]
  }
});
