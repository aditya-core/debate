"use client";

import { useEffect, useState } from "react";

/**
 * Types a line out, once. Under reduced motion the sentence is simply there.
 */
export default function Typewriter({
  text,
  speed = 32,
  startDelay = 1100,
  caret = true,
  className = "",
  onDone,
}: {
  text: string;
  speed?: number;
  startDelay?: number;
  caret?: boolean;
  className?: string;
  onDone?: () => void;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(text.length);
      onDone?.();
      return;
    }

    let i = 0;
    let timer = 0;
    const start = window.setTimeout(() => {
      const tick = () => {
        i += 1;
        setCount(i);
        if (i < text.length) {
          timer = window.setTimeout(tick, speed + (text[i] === " " ? 18 : 0));
        } else {
          onDone?.();
        }
      };
      tick();
    }, startDelay);

    return () => {
      window.clearTimeout(start);
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed, startDelay]);

  return (
    <span className={className}>
      {text.slice(0, count)}
      {caret && count < text.length ? <span className="caret" aria-hidden="true" /> : null}
    </span>
  );
}
