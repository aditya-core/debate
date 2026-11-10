import type { ReactNode } from "react";
import ThemeToggle from "@/components/ThemeToggle";

/**
 * Onboarding has no marketing nav and no footer on purpose.
 *
 * A learner in the middle of setup should have exactly two ways out: finish, or
 * sign out. Every link back to the homepage is an invitation to skip a step we
 * cannot let them skip — so there isn't one.
 */
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="fixed right-4 top-4 z-40 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      {children}
    </>
  );
}
