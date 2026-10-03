/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: { unoptimized: true },
  basePath: '/ai-aggregator-web',
  assetPrefix: '/ai-aggregator-web',
}
module.exports = nextConfig
