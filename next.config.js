/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'customerapi.nieuwkoop-europe.com',
      },
      {
        protocol: 'https',
        hostname: 'customerapi_playground.nieuwkoop-europe.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
    ],
  },
}

module.exports = nextConfig