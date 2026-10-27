import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // NEXT_DIST_DIR permite rodar uma segunda instância (npm run shots) sem disputar a pasta .next.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  reactStrictMode: true,
  devIndicators: false,
  serverExternalPackages: ['better-sqlite3'],
  allowedDevOrigins: ['localhost:3000', '26.216.49.217', '26.216.49.217:3000', 'http://26.216.49.217:3000', 'trainer-card-pro.loca.lt', '*.loca.lt', '*.trycloudflare.com', 'trycloudflare.com'],
  // Imagens enviadas: o navegador não pode adivinhar outro tipo a partir do conteúdo.
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [{ key: 'X-Content-Type-Options', value: 'nosniff' }],
      },
    ];
  },
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
