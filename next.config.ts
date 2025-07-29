import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/stream/:path*",
        destination: "http://localhost:8000/stream/:path*",
      },
      {
        source: "/pnl",
        destination: "http://localhost:8000/pnl",
      },
      {
        source: "/health",
        destination: "http://localhost:8000/health",
      },
    ];
  },
};

export default nextConfig;
