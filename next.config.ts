import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  serverExternalPackages: ['better-sqlite3'],
  allowedDevOrigins: ['localhost:3000', '26.216.49.217', '26.216.49.217:3000', 'http://26.216.49.217:3000', 'trainer-card-pro.loca.lt', '*.loca.lt', '*.trycloudflare.com', 'trycloudflare.com'],
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/*.db',
          '**/*.db-journal',
          '**/*.db-wal',
          '**/dev.db*',
          '**/public/uploads/**',
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
