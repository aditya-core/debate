import ThemeToggle from "@/components/ThemeToggle";

/**
 * Chrome for sign-up and sign-in: no marketing nav, no footer — a form is a
 * task, and a four-column sitemap underneath it is noise. Just the theme
 * switch, so the page still respects a visitor who prefers dark.
 *
 * The legal links live at the foot of the form itself (AuthShell).
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="fixed right-4 top-4 z-40 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <main id="main">{children}</main>
    </>
  );
}
