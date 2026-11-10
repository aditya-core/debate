"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resendCodeAction, verifyCodeAction } from "@/lib/auth/otp-actions";

const LENGTH = 6;

export default function OtpForm({
  maskedEmail,
  initialResendAfter,
  devPreview,
  senderMissing,
}: {
  maskedEmail: string;
  initialResendAfter: number;
  devPreview: boolean;
  senderMissing: boolean;
}) {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [verified, setVerified] = useState(false);
  const [submitting, startSubmit] = useTransition();
  const [resendPending, startResend] = useTransition();
  const [cooldown, setCooldown] = useState(initialResendAfter);
  const [dev, setDev] = useState(devPreview);

  const inputs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const submit = useCallback(
    (next: string[]) => {
      const code = next.join("");
      if (code.length !== LENGTH) return;

      startSubmit(async () => {
        const result = await verifyCodeAction({ code });

        if (result.status === "verified") {
          setError(null);
          setVerified(true);
          // Let the tick land before the page changes. Long enough to register,
          // short enough not to feel like a wait.
          setTimeout(() => router.push("/onboarding"), 1150);
          return;
        }

        setError(result.message ?? "That didn't work. Try again.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
        setDigits(Array(LENGTH).fill(""));
        inputs.current[0]?.focus();
      });
    },
    [router],
  );

  function write(index: number, raw: string) {
    const cleaned = raw.replace(/\D/g, "");
    if (!cleaned) {
      setDigits((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }

    setDigits((prev) => {
      const next = [...prev];
      // A pasted or fast-typed run fills forward from this cell.
      for (let i = 0; i < cleaned.length && index + i < LENGTH; i += 1) {
        next[index + i] = cleaned[i];
      }
      const filledTo = Math.min(index + cleaned.length, LENGTH) - 1;
      inputs.current[Math.min(filledTo + 1, LENGTH - 1)]?.focus();
      if (next.every(Boolean)) submit(next);
      return next;
    });
  }

  function onKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      setDigits((prev) => {
        const next = [...prev];
        next[index - 1] = "";
        return next;
      });
      event.preventDefault();
    }
    if (event.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < LENGTH - 1) inputs.current[index + 1]?.focus();
  }

  function resend() {
    startResend(async () => {
      const result = await resendCodeAction();
      setNotice(result.message ?? null);
      setError(result.status === "error" ? result.message ?? null : null);
      setCooldown(result.resendAfter ?? 120);
      setDev(Boolean(result.dev));
      setDigits(Array(LENGTH).fill(""));
      inputs.current[0]?.focus();
    });
  }

  /* ----------------------------- success ----------------------------- */
  if (verified) {
    return (
      <div className="text-center">
        <div className="otp-ring mx-auto grid h-20 w-20 place-items-center rounded-full border border-mint/40 bg-mint/12">
          <svg viewBox="0 0 32 32" className="otp-check h-10 w-10" aria-hidden="true">
            <path
              d="M7 17.2 13 23 25 10"
              fill="none"
              stroke="var(--c-mint)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p
          className="mt-5 font-display text-[1.35rem] font-medium tracking-[-0.02em] text-fg"
          role="status"
        >
          Verified
        </p>
        <p className="mt-1.5 text-[0.88rem] text-muted">Taking you to setup…</p>

        <div className="mx-auto mt-6 h-1 w-40 overflow-hidden rounded-full bg-line">
          <div className="otp-progress h-full w-full bg-linear-to-r from-brand via-sky to-mint" />
        </div>
      </div>
    );
  }

  /* ------------------------------ form ------------------------------- */
  return (
    <div>
      <p className="text-[0.9rem] leading-relaxed text-muted">
        We sent six digits to{" "}
        <span className="font-medium text-fg">{maskedEmail}</span>. They expire in ten
        minutes.
      </p>

      {dev ? (
        <p className="mt-4 rounded-xl border border-sun/40 bg-sun/10 px-3.5 py-2.5 text-[0.78rem] leading-relaxed text-sun-text">
          <span className="font-display uppercase tracking-[0.12em]">Dev:</span> no
          sender configured, so the code is printed in your terminal — the line
          starting <span className="font-display">[email]</span>.
        </p>
      ) : null}

      {senderMissing ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-flare/35 bg-flare-soft px-3.5 py-2.5 text-[0.8rem] leading-relaxed text-fg"
        >
          Our mail sender isn&apos;t configured, so no code can leave. This is ours
          to fix, not yours.
        </p>
      ) : null}

      <div
        className={["mt-7 flex justify-between gap-2 sm:gap-3", shake ? "otp-row-shake" : ""].join(" ")}
        onPaste={(event) => {
          const text = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
          if (!text) return;
          event.preventDefault();
          const next = Array(LENGTH).fill("");
          for (let i = 0; i < text.length; i += 1) next[i] = text[i];
          setDigits(next);
          inputs.current[Math.min(text.length, LENGTH - 1)]?.focus();
          if (text.length === LENGTH) submit(next);
        }}
      >
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputs.current[index] = el;
            }}
            value={digit}
            onChange={(event) => write(index, event.target.value)}
            onKeyDown={(event) => onKeyDown(index, event)}
            inputMode="numeric"
            autoComplete={index === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${index + 1} of ${LENGTH}`}
            aria-invalid={Boolean(error)}
            data-filled={digit !== ""}
            data-error={Boolean(error)}
            maxLength={1}
            disabled={submitting || resendPending}
            className="otp-cell h-14 w-full rounded-xl border border-line bg-surface text-center font-display text-[1.35rem] tabular-nums text-fg outline-none focus:border-brand focus:ring-4 focus:ring-brand/12 data-[error=true]:border-flare sm:h-16 sm:text-[1.5rem]"
          />
        ))}
      </div>

      <div aria-live="polite" className="min-h-[1.5rem]">
        {error ? (
          <p className="mt-3 text-center text-[0.82rem] text-flare-text">{error}</p>
        ) : notice ? (
          <p className="mt-3 text-center text-[0.82rem] text-mint-text">{notice}</p>
        ) : null}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-5">
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0 || resendPending || submitting}
          className="btn btn-outline btn-sm disabled:cursor-not-allowed disabled:opacity-45"
        >
          {resendPending
            ? "Sending…"
            : cooldown > 0
              ? `Resend in ${Math.floor(cooldown / 60)}:${String(cooldown % 60).padStart(2, "0")}`
              : "Resend code"}
        </button>

        <button
          type="button"
          onClick={() => submit(digits)}
          disabled={digits.some((d) => !d) || submitting}
          className="btn btn-primary btn-sm disabled:cursor-not-allowed disabled:opacity-45"
        >
          {submitting ? "Checking…" : "Verify"}
          {!submitting && <span aria-hidden="true">→</span>}
        </button>
      </div>
    </div>
  );
}
