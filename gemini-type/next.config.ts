// gemini-type/next.config.ts

import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Production-ready: Don't ignore errors in production builds
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
}

export default nextConfig