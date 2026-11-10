"use client";

import { useActionState, useState } from "react";
import { INITIAL_STATE, updatePasswordAction } from "@/lib/auth/actions";

export default function UpdatePasswordForm() {
  const [state, formAction, pending] = useActionState(updatePasswordAction, INITIAL_STATE);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);

  const mismatch = confirm.length > 0 && confirm !== password;

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
        <div className="flex items-baseline justify-between">
          <label htmlFor="password" className="font-display text-[0.8rem] font-medium text-fg">
            New password
          </label>
          <span className="text-[0.72rem] text-faint">10+ characters</span>
        </div>
        <div className="relative mt-1.5">
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(state.fieldErrors?.password)}
            className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 pr-16 text-[0.92rem] text-fg outline-none transition-colors placeholder:text-faint focus:border-brand focus:ring-4 focus:ring-brand/12 aria-[invalid=true]:border-flare"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 font-display text-[0.7rem] uppercase tracking-[0.1em] text-muted transition-colors hover:text-fg"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
        {state.fieldErrors?.password ? (
          <p className="mt-1.5 text-[0.78rem] text-flare-text">{state.fieldErrors.password}</p>
        ) : null}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="font-display text-[0.8rem] font-medium text-fg">
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type={show ? "text" : "password"}
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          aria-invalid={mismatch || Boolean(state.fieldErrors?.confirmPassword)}
          className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[0.92rem] text-fg outline-none transition-colors placeholder:text-faint focus:border-brand focus:ring-4 focus:ring-brand/12 aria-[invalid=true]:border-flare"
          placeholder="Type it again"
        />
        {mismatch || state.fieldErrors?.confirmPassword ? (
          <p className="mt-1.5 text-[0.78rem] text-flare-text">
            {mismatch ? "Those passwords don't match yet." : state.fieldErrors?.confirmPassword}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pending || mismatch}
        className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Saving…" : "Set new password"}
        {!pending && <span aria-hidden="true">↗</span>}
      </button>
    </form>
  );
}
