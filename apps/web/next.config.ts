import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";

const configDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(configDir, "../..");

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb"
    }
  },
  turbopack: {
    root: repoRoot
  },
  outputFileTracingIncludes: {
    "/*": [
      "./.prisma/client/**/*",
      "./generated/client/**/*",
      "../../packages/db/generated/client/**/*"
    ]
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...(config.plugins ?? []), new PrismaPlugin()];
    }

    return config;
  }
};

export default nextConfig;
