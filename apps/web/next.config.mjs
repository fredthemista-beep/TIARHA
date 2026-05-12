import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Workspace root so Next traces files across the pnpm monorepo
  outputFileTracingRoot: path.join(__dirname, '../..'),
  transpilePackages: ['@tiarh/ui'],
  webpack: (config) => {
    config.resolve.symlinks = false;
    return config;
  },
};

export default nextConfig;
