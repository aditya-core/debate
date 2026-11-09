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
    <main className="relative flex min-h-[100svh] flex-col items-center justify-center px-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_50%_20%,rgba(121,69,232,0.18),transparent_60%)]" />

      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-6 max-w-[18ch] text-center font-display text-[clamp(2rem,5vw,3.4rem)] font-medium leading-[1.02] tracking-[-0.03em]">
        {title}
      </h1>
      <p className="mt-5 max-w-[46ch] text-center text-[0.95rem] leading-[1.7] text-paper/55">
        {body}
      </p>

      <Link href="/" className="btn-ghost mt-10">
        <span aria-hidden="true" className="arrow rotate-90">
          ↓
        </span>
        Back to the beginning
      </Link>
    </main>
  );
}
