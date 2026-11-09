/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Production builds go to .next-build so they can never clobber the
  // dev server's .next directory (which silently serves a mismatched
  // HTML/CSS pair — exactly the bug that broke the preview on 9 Nov).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Allow the sandbox preview host to reach the dev server.
  allowedDevOrigins: ["*.e2b.app", "*.arena.ai", "*.e2b.dev"],
};

export default nextConfig;
