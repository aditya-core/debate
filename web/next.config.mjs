/**
 * Security headers are applied here rather than in a proxy route so they are
 * attached to every response by the server itself — including static pages,
 * which never pass through middleware.
 *
 * The CSP allows 'unsafe-inline' for scripts and styles. That is a deliberate,
 * documented compromise: Next injects inline bootstrap scripts and this codebase
 * sets inline style objects, so a nonce-less policy would break both. What the
 * policy still buys us is the important half — no script from another origin,
 * no injected <base>, no forms posting off-site, no plugin content, and no
 * framing by anyone we have not named.
 *
 * See docs/SECURITY.md for the upgrade path to a nonce-based policy.
 */

const SITE_ORIGIN = process.env.NEXT_PUBLIC_SITE_URL ?? "";

// While the app is being previewed, the platform embeds it. Once a real origin
// is configured we stop allowing anyone to frame it.
const FRAME_ANCESTORS = SITE_ORIGIN
  ? "'none'"
  : "'self' https://*.e2b.app https://*.arena.ai https://*.e2b.dev";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co",
  "media-src 'self' blob:",
  `frame-ancestors ${FRAME_ANCESTORS}`,
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "frame-src 'none'",
].join("; ");

const headers = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Microphone will be needed for practice rounds; camera and location will
  // never be. Denying them here means a third-party script cannot ask either.
  {
    key: "Permissions-Policy",
    value: "camera=(), geolocation=(), microphone=(self), payment=(), usb=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

// HSTS only makes sense on a real HTTPS origin; browsers ignore it elsewhere.
if (SITE_ORIGIN) {
  headers.push({
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  });
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Development renders into its own directory so a build can never clobber it
  // — that collision is what served a mismatched HTML/CSS pair on 9 Nov.
  // Production keeps the default `.next` because that is where Vercel looks.
  //
  // The choice is made from NODE_ENV rather than an env var in the npm script:
  // `FOO=bar cmd` is POSIX-only syntax and fails on Windows, where npm runs
  // scripts through cmd.exe. This works identically on every platform.
  distDir:
    process.env.NEXT_DIST_DIR ||
    (process.env.NODE_ENV === "development" ? ".next-dev" : ".next"),
  // Allow the sandbox preview host to reach the dev server.
  allowedDevOrigins: ["*.e2b.app", "*.arena.ai", "*.e2b.dev"],
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers }];
  },
};

export default nextConfig;
