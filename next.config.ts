import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'upgraded-adventure-v6w77g99469phxwq9-3000.app.github.dev',
    '*.app.github.dev'
  ],

  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost',
        'localhost:3000',
        '127.0.0.1',
        '127.0.0.1:3000',
        'upgraded-adventure-v6w77g99469phxwq9-3000.app.github.dev',
        '*.app.github.dev',
        '*.github.dev'
      ]
    }
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 85, 90, 95],
    deviceSizes: [360, 390, 430, 640, 750, 828, 1080, 1200, 1440, 1536, 1920],
    imageSizes: [32, 48, 56, 64, 96, 128, 140, 192, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**'
      }
    ]
  },

  compress: true,

  poweredByHeader: false
};

export default nextConfig;
