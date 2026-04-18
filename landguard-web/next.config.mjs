// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [], // Not needed for local public folder, but good to have
    dangerouslyAllowSVG: true, // If you ever use SVGs
    formats: ['image/avif', 'image/webp'], // Auto-optimization
  },
};

export default nextConfig;