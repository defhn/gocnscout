import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "pub-f27e22c13e5e4342a67089e6fa5ed831.r2.dev",
      },
    ],
  },
};

export default nextConfig;
