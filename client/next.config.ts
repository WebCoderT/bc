import type { NextConfig } from "next";

const clientApiProxyTarget =
  process.env.CLIENT_API_PROXY_TARGET ?? "http://localhost:8000";

const clientDevOrigins = [
  "localhost",
  "127.0.0.1",
  "localhost:8001",
  "127.0.0.1:8001",
  "http://localhost:8001",
  "http://127.0.0.1:8001",
];

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api",
        destination: `${clientApiProxyTarget}/api`,
      },
      {
        source: "/api/:path*",
        destination: `${clientApiProxyTarget}/api/:path*`,
      },
    ];
  },
  allowedDevOrigins: clientDevOrigins,
};

export default nextConfig;
