"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordResetAction } from "@/lib/auth/actions";
import { INITIAL_STATE } from "@/lib/auth/state";

export default function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(
    requestPasswordResetAction,
    INITIAL_STATE,
  );

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-line bg-surface p-5">
        <p className="text-[0.92rem] leading-relaxed text-fg">{state.message}</p>
        <p className="mt-3 text-[0.8rem] leading-relaxed text-muted">
          The link is good for one use and expires. Check spam before asking
          again — during the build our sender is slow.
        </p>
        <Link href="/signin" className="btn btn-outline btn-sm mt-5">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.status === "error" && state.message ? (
        <div
          role="alert"
          className="rounded-xl border border-flare/35 bg-flare-soft px-3.5 py-3 text-[0.85rem] leading-relaxed text-fg"
        >
          {state.message}
        </div>
      ) : null}

      <div>
        <label htmlFor="email" className="font-display text-[0.8rem] font-medium text-fg">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          aria-invalid={Boolean(state.fieldErrors?.email)}
          className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[0.92rem] text-fg outline-none transition-colors placeholder:text-faint focus:border-brand focus:ring-4 focus:ring-brand/12 aria-[invalid=true]:border-flare"
        />
        {state.fieldErrors?.email ? (
          <p className="mt-1.5 text-[0.78rem] text-flare-text">{state.fieldErrors.email}</p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send a reset link"}
        {!pending && <span aria-hidden="true">↗</span>}
      </button>

      <p className="pt-1 text-center text-[0.78rem] text-faint">
        Remembered it?{" "}
        <Link href="/signin" className="link-underline text-fg">
          Sign in
        </Link>
      </p>
    </form>
  );
}
