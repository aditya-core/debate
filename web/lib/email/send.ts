/**
 * Delivery for the six-digit code.
 *
 * Brevo's HTTP API rather than SMTP, for three reasons: no extra dependency, it
 * works in a serverless function without holding a socket open, and a single
 * verified sender address is enough — no domain required (which is the entire
 * reason we are here).
 *
 * In development, with no key configured, the code goes to the server console
 * instead. That is deliberate: it lets the whole flow be tested before a sender
 * exists, and it is gated on NODE_ENV so a production build can never do it.
 */

const BREVO_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

export type SendResult =
  | { ok: true; dev: true }
  | { ok: true; dev: false }
  | { ok: false; reason: "no-sender" | "provider-error"; detail?: string };

function body(code: string, name: string | null) {
  const greeting = name ? `Hi ${name.split(/\s+/)[0]},` : "Hi,";
  return {
    subject: `${code} is your Gift of Words code`,
    textContent: [
      greeting,
      "",
      `Your verification code is ${code}.`,
      "",
      "It expires in 10 minutes and can be used once.",
      "If you didn't ask for this, you can ignore this email — nobody can use the code without your password.",
      "",
      "— Gift of Words",
    ].join("\n"),
    htmlContent: `<!doctype html>
<html><body style="margin:0;background:#f6f1e9;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#16121f">
  <div style="max-width:480px;margin:0 auto;padding:40px 24px">
    <p style="font-size:13px;letter-spacing:.18em;text-transform:uppercase;color:#938da0;margin:0 0 28px">
      Gift of Words
    </p>
    <p style="font-size:16px;line-height:1.6;margin:0 0 8px">${greeting}</p>
    <p style="font-size:16px;line-height:1.6;margin:0 0 24px">Here is your verification code.</p>
    <div style="background:#ffffff;border:1px solid rgba(22,18,31,.11);border-radius:16px;padding:24px;text-align:center">
      <div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:34px;letter-spacing:.32em;color:#16121f">${code}</div>
    </div>
    <p style="font-size:14px;line-height:1.6;color:#6a6379;margin:20px 0 0">
      Expires in 10 minutes, single use. If you didn't ask for this, ignore this
      email — nobody can use the code without your password.
    </p>
  </div>
</body></html>`,
  };
}

export async function sendVerificationCode({
  to,
  code,
  name,
}: {
  to: string;
  code: string;
  name: string | null;
}): Promise<SendResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM;
  const fromName = process.env.EMAIL_FROM_NAME ?? "Gift of Words";

  if (!apiKey || !from) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`\n[email] (dev, no sender configured) code for ${to}: ${code}\n`);
      return { ok: true, dev: true };
    }
    console.error("[email] no sender configured: set BREVO_API_KEY and EMAIL_FROM");
    return { ok: false, reason: "no-sender" };
  }

  const payload = body(code, name);

  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: fromName, email: from },
        to: [{ email: to }],
        subject: payload.subject,
        textContent: payload.textContent,
        htmlContent: payload.htmlContent,
      }),
      // A hung provider must not hold the sign-up request open.
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[email] brevo rejected the send:", res.status, detail.slice(0, 300));
      return { ok: false, reason: "provider-error", detail: String(res.status) };
    }

    return { ok: true, dev: false };
  } catch (error) {
    console.error("[email] brevo request failed:", error instanceof Error ? error.message : error);
    return { ok: false, reason: "provider-error" };
  }
}
