import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gift of Words — Unlock the power of your words",
  description:
    "An intelligent communication training experience designed to help you sharpen your thinking, strengthen your expression and make your voice matter.",
  metadataBase: new URL("https://giftofwords.app"),
  openGraph: {
    title: "Gift of Words — Unlock the power of your words",
    description:
      "Think clearly. Speak confidently. Communicate exceptionally.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#10111D",
  width: "device-width",
  initialScale: 1,
};

/**
 * Runs before first paint. Everything that animates is hidden by CSS only
 * when this attribute is present, so a JS-less or slow-connection visitor
 * sees a complete, readable page instead of an empty one.
 */
const NO_FLASH = `
    document.documentElement.dataset.js = "1";
    window.addEventListener("load", function () {
      // If the entrance choreography never runs, reveal everything anyway.
      setTimeout(function () {
        document.documentElement.classList.add("reveal-fallback");
      }, 4500);
    });
  `;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          href="/fonts/space-grotesk-latin-wght-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/inter-latin-wght-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-ink text-paper antialiased">
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-ink-2 focus:px-4 focus:py-2 focus:text-sm"
        >
          Skip to content
        </a>

        {children}

        <div className="grain-layer" aria-hidden="true" />
      </body>
    </html>
  );
}
