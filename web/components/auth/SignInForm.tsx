"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signInAction } from "@/lib/auth/actions";
import { INITIAL_STATE } from "@/lib/auth/state";

export default function SignInForm() {
  const [state, formAction, pending] = useActionState(signInAction, INITIAL_STATE);
  const [showPassword, setShowPassword] = useState(false);

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
          className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[0.92rem] text-fg outline-none transition-colors placeholder:text-faint focus:border-brand focus:ring-4 focus:ring-brand/12"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="font-display text-[0.8rem] font-medium text-fg"
        >
          Password
        </label>
        <div className="relative mt-1.5">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="Your password"
            className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 pr-16 text-[0.92rem] text-fg outline-none transition-colors placeholder:text-faint focus:border-brand focus:ring-4 focus:ring-brand/12"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 font-display text-[0.7rem] uppercase tracking-[0.1em] text-muted transition-colors hover:text-fg"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <Link
          href="/signin/forgot"
          className="link-underline text-[0.78rem] text-faint hover:text-fg"
        >
          Forgot your password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
        {!pending && <span aria-hidden="true">↗</span>}
      </button>

      <p className="pt-1 text-center text-[0.78rem] text-faint">
        New here?{" "}
        <Link href="/signup" className="link-underline text-fg">
          Create an account
        </Link>
      </p>
    </form>
  );
}
