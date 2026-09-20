import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "gmgn.ai" },
      { protocol: "https", hostname: "**.gmgn.ai" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "ipfs.io" },
    ],
  },
  // Ensure server-only GMGN calls stay on Node
  serverExternalPackages: ["gmgn-cli"],
};

export default nextConfig;
