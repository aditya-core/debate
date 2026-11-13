import type { Metadata, Viewport } from "next";
import "./globals.css";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Gift of Words — Unlock the power of your words",
  description:
    "An intelligent communication training experience for debate, extempore and thinking on your feet — with feedback specific enough to change how you speak.",
  // Falls back to the domain we intend to own; NEXT_PUBLIC_SITE_URL wins once
  // it exists, so canonical/OG URLs follow the deployment rather than a guess.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://giftofwords.app"),
  openGraph: {
    title: "Gift of Words",
    description:
      "Think clearly. Speak confidently. Communicate exceptionally.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f1e9" },
    { media: "(prefers-color-scheme: dark)", color: "#08070f" },
  ],
  width: "device-width",
  initialScale: 1,
};

/**
 * Runs before first paint:
 *  1. resolves the theme (stored choice → system preference) with no flash,
 *  2. marks the document as JS-capable,
 *  3. guarantees content becomes visible even if the motion layer fails.
 */
const BOOT = `
(function () {
  var root = document.documentElement;
  try {
    var stored = localStorage.getItem("gow-theme");
    var system = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme =
      stored === "dark" || stored === "light" ? stored : system ? "dark" : "light";
  } catch (e) {
    root.dataset.theme = "light";
  }
  root.dataset.js = "1";
  window.addEventListener("load", function () {
    setTimeout(function () {
      root.classList.add("reveal-fallback");
    }, 4000);
  });
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
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
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-fg focus:px-4 focus:py-2 focus:text-sm focus:text-canvas"
        >
          Skip to content
        </a>

        {children}
        <ScrollReveal />
      </body>
    </html>
  );
}
