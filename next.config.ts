import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @ts-ignore - allowedDevOrigins is present in Next.js but might be missing from types
  experimental: {
    allowedDevOrigins: ["192.168.0.103:3000", "192.168.0.103"],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
};

export default nextConfig;
