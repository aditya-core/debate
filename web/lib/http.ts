/**
 * The public origin of the current request.
 *
 * `request.url` reports the host the Node server bound to — behind the preview
 * proxy that is `http://0.0.0.0:3000`, which would send the browser to an
 * address it cannot resolve. The proxy's forwarded headers carry the real one.
 */
export function requestOrigin(request: Request): string {
  const url = new URL(request.url);
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? url.host;
  const rawProto = request.headers.get("x-forwarded-proto") ?? url.protocol;
  const proto = rawProto === "http:" || rawProto === "http" ? "http" : "https";
  return `${proto}://${host}`;
}

/** Only ever redirect within this site. */
export function safePath(candidate: string | null, fallback: string): string {
  if (candidate && /^\/(?!\/)/.test(candidate)) return candidate;
  return fallback;
}
