import Link from "next/link";

/**
 * Placeholder surface shared by /signup and /signin until Stage 4.
 * Deliberately has no form: a field that silently discards an email is
 * worse than an honest "not yet".
 */
export default function EarlyAccess({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="relative isolate flex min-h-[68vh] flex-col items-center justify-center px-6 py-20 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="orb"
          style={{
            width: 420,
            height: 420,
            top: -80,
            left: "50%",
            transform: "translateX(-50%)",
            background:
              "radial-gradient(circle, var(--c-brand) 0%, transparent 70%)",
            opacity: 0.16,
          }}
        />
      </div>

      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-6 max-w-[18ch] font-display text-[clamp(2rem,5vw,3.2rem)] font-medium leading-[1.03] tracking-[-0.035em] text-fg">
        {title}
      </h1>
      <p className="mt-5 max-w-[46ch] text-[0.95rem] leading-[1.7] text-muted">
        {body}
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link href="/develop" className="btn btn-primary">
          See what we&rsquo;re building
        </Link>
        <Link href="/" className="btn btn-outline">
          Back to the beginning
        </Link>
      </div>
    </div>
  );
}
