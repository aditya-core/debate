import type { ReactNode } from "react";
import ThemeToggle from "@/components/ThemeToggle";

/**
 * The first-rep page is also chrome-free.
 *
 * It is the last ten metres of setup, so it keeps the same rule as onboarding:
 * one exit forward, no nav that invites wandering off. The theme toggle stays,
 * because a dark room is a legitimate preference at 11pm.
 */
export default function WelcomeLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="fixed right-4 top-4 z-40 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      {children}
    </>
  );
}
