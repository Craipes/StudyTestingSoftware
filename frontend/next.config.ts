import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',  
        hostname: 'localhost',
        port: '7015', 
        pathname: '**', 
      },
    ],
  },
};

export default nextConfig;
