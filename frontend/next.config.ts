import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', '192.168.1.8'],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;

// output: 'standalone',
// reactStrictMode: true,
// swcMinify: true,
// images: {
//   domains: ['localhost'],
//   unoptimized: true,
// },
// env: {
//   NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
// },
