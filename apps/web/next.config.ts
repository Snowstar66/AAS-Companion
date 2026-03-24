import type { NextConfig } from "next";
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@aas-companion/api",
    "@aas-companion/config",
    "@aas-companion/db",
    "@aas-companion/domain",
    "@aas-companion/ui"
  ],
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
