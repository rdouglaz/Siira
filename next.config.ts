import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
}

export default nextConfig
