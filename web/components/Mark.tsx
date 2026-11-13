/**
 * The wordmark, on its own.
 *
 * It lives here rather than in Nav because the signed-in app shells import it
 * and must not pull a scroll listener along with it.
 */
export function Mark({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="gow-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--c-brand)" />
          <stop offset="55%" stopColor="var(--c-sky)" />
          <stop offset="100%" stopColor="var(--c-aqua)" />
        </linearGradient>
      </defs>
      <path d="M2.6 18.2h7.6" stroke="url(#gow-mark)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M6 12h9" stroke="url(#gow-mark)" strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
      <path d="M9.6 5.8h11.8" stroke="url(#gow-mark)" strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}
