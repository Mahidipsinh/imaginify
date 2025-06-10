import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: ''
      }
    ]
  },
  module : {
  reactStrictMode: true,
  eslint: {
      ignoreDuringBuilds: true,
  },
}
};

export default nextConfig;