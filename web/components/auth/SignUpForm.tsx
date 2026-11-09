"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { INITIAL_STATE, signUpAction } from "@/lib/auth/actions";
import {
  ADULT_AGE,
  MIN_AGE,
  ageFrom,
  passwordScore,
  passwordsMatch,
} from "@/lib/auth/validation";

export default function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpAction, INITIAL_STATE);
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const age = useMemo(() => ageFrom(dob), [dob]);
  const needsGuardian = age !== null && age < ADULT_AGE && age >= MIN_AGE;
  const tooYoung = age !== null && age < MIN_AGE;
  const strength = passwordScore(password);
  // Only complain once they've started typing the confirmation.
  const mismatch = confirm.length > 0 && !passwordsMatch(password, confirm);
  const errors = state.fieldErrors ?? {};

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

      <Field
        label="Your name"
        name="fullName"
        autoComplete="name"
        placeholder="Aditya Sharma"
        error={errors.fullName}
        required
      />

      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email}
        required
      />

      <div>
        <div className="flex items-baseline justify-between">
          <label
            htmlFor="password"
            className="font-display text-[0.8rem] font-medium text-fg"
          >
            Password
          </label>
          <span className="text-[0.72rem] text-faint">10+ characters</span>
        </div>
        <div className="relative mt-1.5">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(errors.password)}
            aria-describedby="password-strength"
            className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 pr-16 text-[0.92rem] text-fg outline-none transition-colors placeholder:text-faint focus:border-brand focus:ring-4 focus:ring-brand/12 aria-[invalid=true]:border-flare"
            placeholder="Something only you know"
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

        <div id="password-strength" className="mt-2 flex items-center gap-2">
          <div className="flex flex-1 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="h-1 flex-1 rounded-full transition-colors duration-300"
                style={{
                  background:
                    i < strength.score
                      ? strength.score <= 1
                        ? "var(--c-flare)"
                        : strength.score === 2
                          ? "var(--c-sun)"
                          : "var(--c-mint)"
                      : "var(--c-line)",
                }}
              />
            ))}
          </div>
          <span className="w-16 text-right text-[0.7rem] text-faint">
            {password ? strength.label : ""}
          </span>
        </div>
        {errors.password ? (
          <p className="mt-1.5 text-[0.78rem] text-flare-text">{errors.password}</p>
        ) : null}
      </div>

      <Field
        label="Confirm password"
        name="confirmPassword"
        type={showPassword ? "text" : "password"}
        autoComplete="new-password"
        placeholder="Type it again"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        error={mismatch ? "Those passwords don't match yet." : errors.confirmPassword}
        required
      />

      <div>
        <Field
          label="Date of birth"
          name="dateOfBirth"
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          error={errors.dateOfBirth}
          required
        />
        {tooYoung ? (
          <p className="mt-1.5 text-[0.78rem] text-flare-text">
            Gift of Words is for ages {MIN_AGE} and up.
          </p>
        ) : null}
      </div>

      {needsGuardian ? (
        <div className="guardian-note rounded-xl border border-line bg-surface-2 p-3.5">
          <p className="font-display text-[0.7rem] uppercase tracking-[0.16em] text-faint">
            Under 18
          </p>
          <p className="mt-1 text-[0.82rem] leading-relaxed text-muted">
            We need a parent or guardian to approve this account before any
            practice is recorded.
          </p>
          <div className="mt-3">
            <Field
              label="Guardian's email"
              name="guardianEmail"
              type="email"
              placeholder="parent@example.com"
              error={errors.guardianEmail}
              required
            />
          </div>
        </div>
      ) : null}

      <label className="flex cursor-pointer items-start gap-2.5 pt-1">
        <input
          type="checkbox"
          name="acceptedTerms"
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-line accent-[var(--c-brand)]"
        />
        <span className="text-[0.8rem] leading-relaxed text-muted">
          I agree to the{" "}
          <Link href="/legal#terms" className="link-underline text-fg">
            terms
          </Link>{" "}
          and{" "}
          <Link href="/legal#privacy" className="link-underline text-fg">
            privacy notice
          </Link>
          .
        </span>
      </label>
      {errors.acceptedTerms ? (
        <p className="-mt-2 text-[0.78rem] text-flare-text">{errors.acceptedTerms}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending || tooYoung}
        className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Creating your account…" : "Create my account"}
        {!pending && <span aria-hidden="true">↗</span>}
      </button>

      <p className="pt-1 text-center text-[0.78rem] text-faint">
        Already have an account?{" "}
        <Link href="/signin" className="link-underline text-fg">
          Sign in
        </Link>
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  error,
  required,
  value,
  onChange,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="font-display text-[0.8rem] font-medium text-fg"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-[0.92rem] text-fg outline-none transition-colors placeholder:text-faint focus:border-brand focus:ring-4 focus:ring-brand/12 aria-[invalid=true]:border-flare"
      />
      {error ? (
        <p id={`${name}-error`} className="mt-1.5 text-[0.78rem] text-flare-text">
          {error}
        </p>
      ) : null}
    </div>
  );
}
