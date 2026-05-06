/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@tiarh/engine', '@tiarh/ui'],
  webpack: (config) => {
    config.resolve.symlinks = false;
    return config;
  },
};

export default nextConfig;
