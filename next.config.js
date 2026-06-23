/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      '/**/*': ['./public/dev.db'],
    },
  },
}

module.exports = nextConfig

