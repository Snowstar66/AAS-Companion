import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@aas-companion/config", "@aas-companion/domain", "@aas-companion/ui"]
};

export default nextConfig;
