import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    // Disable ESLint during builds to focus on TypeScript errors
    ignoreDuringBuilds: true,
  },
}

export default nextConfig
