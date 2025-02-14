import type { NextConfig } from "next";
// next.config.js

module.exports = {
  reactStrictMode: true,
  eslint: {
      ignoreDuringBuilds: true,
  },
}


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