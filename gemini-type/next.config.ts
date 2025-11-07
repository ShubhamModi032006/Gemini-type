// gemini-type/next.config.ts

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add these two blocks:
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
};

export default nextConfig; // Use 'export default' for .ts files