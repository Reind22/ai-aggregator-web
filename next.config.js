/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: { unoptimized: true },
  async redirects() {
    return [
      { source: "/pricing", destination: "/models", permanent: true },
      { source: "/companies", destination: "/models", permanent: true },
    ];
  },
}
module.exports = nextConfig
