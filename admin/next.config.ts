import type { NextConfig } from "next";

const adminApiProxyTarget =
  process.env.ADMIN_API_PROXY_TARGET ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api",
        destination: `${adminApiProxyTarget}/api`,
      },
      {
        source: "/api/:path*",
        destination: `${adminApiProxyTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
