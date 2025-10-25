/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:5000/api',
  },
}

module.exports = nextConfig