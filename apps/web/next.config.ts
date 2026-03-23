import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@aas-companion/api",
    "@aas-companion/config",
    "@aas-companion/db",
    "@aas-companion/domain",
    "@aas-companion/ui"
  ]
};

export default nextConfig;
