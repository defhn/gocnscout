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
  async redirects() {
    // Legacy URLs are permanently redirected to generic pages. These source paths are
    // only used to catch old links and are never rendered or linked anywhere on the site.
    return [
      { source: "/canton-fair-exhibitor-database", destination: "/china-exporter-database", permanent: true },
      { source: "/canton-fair-exhibitor-intelligence-report", destination: "/industries", permanent: true },
      { source: "/exhibitor-intelligence-report", destination: "/industries", permanent: true },
      { source: "/reports", destination: "/industries", permanent: true },
      { source: "/reports/:path*", destination: "/industries", permanent: true },
    ];
  },
};

export default nextConfig;
