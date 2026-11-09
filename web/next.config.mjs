/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow the sandbox preview host to reach the dev server.
  allowedDevOrigins: ["*.e2b.app", "*.arena.ai", "*.e2b.dev"],
};

export default nextConfig;
