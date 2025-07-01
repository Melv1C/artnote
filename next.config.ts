import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    authInterrupts: true,
  },
  images: {
    remotePatterns: [
      new URL(`${process.env.REMOTE_IMAGE_DOMAIN}/**`),
    ],
  },
};

export default nextConfig;
