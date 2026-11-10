import "react";

/**
 * Allow CSS custom properties in inline styles without casting everywhere.
 * Used for staggered reveal delays (`--d`).
 */
declare module "react" {
  interface CSSProperties {
    [key: `--${string}`]: string | number | undefined;
  }
}
