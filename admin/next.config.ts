import type { NextConfig } from "next";

const adminApiProxyTarget =
  process.env.ADMIN_API_PROXY_TARGET ?? "http://localhost:8000";

const adminDevOrigins = [
  "localhost",
  "127.0.0.1",
  "localhost:8002",
  "127.0.0.1:8002",
  "http://localhost:8002",
  "http://127.0.0.1:8002",
];

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
  allowedDevOrigins: adminDevOrigins,
};

export default nextConfig;
