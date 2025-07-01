import { env } from '@/lib/env';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    authInterrupts: true,
  },
  images: {
    remotePatterns: [
      new URL(`${env.REMOTE_IMAGE_DOMAIN}/**`),
    ],
  },
};

export default nextConfig;
