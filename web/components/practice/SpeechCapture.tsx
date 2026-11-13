"use client";

import { useEffect, useRef, useState } from "react";

/* ---------------------------------------------------------------------------
   Minimal shape of the Web Speech API. It is not in lib.dom.d.ts because it is
   still a draft; declaring only what we use keeps `any` out of the file.
--------------------------------------------------------------------------- */
type SpeechResultAlternative = { transcript: string; confidence: number };
type SpeechResult = { isFinal: boolean; 0: SpeechResultAlternative; length: number };
type SpeechEvent = { resultIndex: number; results: { length: number; [i: number]: SpeechResult } };
type SpeechErrorEvent = { error: string };

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechEvent) => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function clock(totalSeconds: number): string {
  const s = Math.max(0, Math.ceil(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * Records a spoken answer as text.
 *
 * Transcription happens in the browser, so no audio ever reaches our servers —
 * which is also why it costs nothing to run. The transcript is editable on
 * purpose: recognition mishears names, and a learner should not be scored on
 * Google's spelling of their own sentence.
 *
 * The hidden inputs are what the surrounding form submits. Nothing here talks to
 * the database; the server action decides whether to keep it.
 */
export default function SpeechCapture({
  promptTitle,
  beats,
  seconds,
  text,
  onText,
  onDuration,
}: {
  promptTitle: string;
  beats: readonly string[];
  seconds: number;
  /** Controlled by the wizard: the transcript outlives this component when the
   *  learner moves to the review step, so it cannot live here. */
  text: string;
  onText: (value: string) => void;
  onDuration: (milliseconds: number) => void;
}) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [remaining, setRemaining] = useState(seconds);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const recognition = useRef<SpeechRecognitionLike | null>(null);
  const startedAt = useRef<number | null>(null);
  const elapsedMs = useRef(0);
  const wanted = useRef(false);
  const baseText = useRef("");

  useEffect(() => {
    setSupported(getRecognition() !== null);
    return () => {
      wanted.current = false;
      recognition.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!listening) return;
    const id = window.setInterval(() => {
      if (!startedAt.current) return;
      const used = (Date.now() - startedAt.current) / 1000;
      const left = seconds - used;
      setRemaining(Math.max(0, left));
      if (left <= 0) {
        stop();
      }
    }, 200);
    return () => window.clearInterval(id);
    // `stop` is stable enough for this effect's lifetime; re-running on every
    // render would reset the interval constantly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening, seconds]);

  function start() {
    const Ctor = getRecognition();
    if (!Ctor) {
      setError("This browser can't transcribe speech. Type your answer instead — it works exactly the same.");
      return;
    }

    setError(null);
    setNotice(null);
    setInterim("");
    baseText.current = text ? `${text.trim()} ` : "";
    wanted.current = true;
    startedAt.current = Date.now();
    setRemaining(seconds);

    const rec = new Ctor();
    rec.lang = "en-IN";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (event) => {
      let finalPart = "";
      let interimPart = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const chunk = result[0]?.transcript ?? "";
        if (result.isFinal) finalPart += chunk;
        else interimPart += chunk;
      }
      if (finalPart) {
        baseText.current = `${baseText.current}${finalPart} `.replace(/\s+/g, " ");
        onText(baseText.current.trim());
      }
      setInterim(interimPart.trim());
    };

    rec.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("Microphone access was refused. Allow it in the address bar, or type your answer.");
      } else if (event.error === "no-speech") {
        setNotice("We didn't hear anything. Try again, a little closer to the mic.");
      } else if (event.error === "network") {
        setError("The browser's speech service couldn't be reached. Type your answer instead.");
      } else {
        setError("Recording stopped unexpectedly. You can type or try again.");
      }
      wanted.current = false;
      setListening(false);
    };

    rec.onend = () => {
      if (startedAt.current) {
        elapsedMs.current = Date.now() - startedAt.current;
        onDuration(elapsedMs.current);
      }
      setListening(false);
      setInterim("");
      if (wanted.current) {
        // Chrome ends the stream after a pause; if the clock has not run out,
        // restart so a thinking pause does not silently truncate the answer.
        wanted.current = false;
      }
    };

    recognition.current = rec;
    try {
      rec.start();
      setListening(true);
    } catch {
      setError("Recording couldn't start. Type your answer instead.");
    }
  }

  function stop() {
    wanted.current = false;
    if (startedAt.current) {
      elapsedMs.current = Date.now() - startedAt.current;
      onDuration(elapsedMs.current);
    }
    recognition.current?.stop();
    setListening(false);
    setInterim("");
  }

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const pct = Math.min(1, Math.max(0, (seconds - remaining) / seconds));

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <p className="font-display text-[0.6rem] uppercase tracking-[0.18em] text-faint">
        The prompt
      </p>
      <p className="mt-1.5 font-display text-[1.05rem] font-medium leading-snug tracking-[-0.01em] text-fg">
        {promptTitle}
      </p>

      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {beats.map((beat, i) => (
          <li key={beat} className="flex items-baseline gap-1.5 text-[0.78rem] text-muted">
            <span aria-hidden="true" className="font-display text-[0.6rem] text-brand">
              0{i + 1}
            </span>
            {beat}
          </li>
        ))}
      </ul>

      {/* ---- transport ---- */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {listening ? (
          <button type="button" onClick={stop} className="btn btn-primary btn-sm">
            <span aria-hidden="true" className="capture-dot mr-1.5 inline-block h-2 w-2 rounded-full bg-white" />
            Stop — {clock(remaining)} left
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            disabled={supported === false}
            className="btn btn-primary btn-sm disabled:opacity-40"
          >
            <span aria-hidden="true" className="mr-1.5">●</span>
            {text ? "Record more" : `Record ${seconds} seconds`}
          </button>
        )}

        <span className="font-display text-[0.7rem] tabular-nums tracking-[0.06em] text-faint">
          {words} {words === 1 ? "word" : "words"}
        </span>

        <span className="ml-auto text-[0.7rem] text-faint">
          Audio is never uploaded — only the words
        </span>
      </div>

      {/* ---- progress ---- */}
      <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-line" aria-hidden="true">
        <div
          className={listening ? "h-full bg-flare transition-[width] duration-200 ease-linear" : "h-full bg-brand transition-[width] duration-200 ease-linear"}
          style={{ width: `${pct * 100}%` }}
        />
      </div>

      {error ? (
        <p role="alert" className="mt-3 rounded-lg border border-flare/35 bg-flare-soft px-3 py-2 text-[0.78rem] leading-relaxed text-fg">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="mt-3 text-[0.78rem] leading-relaxed text-muted">{notice}</p>
      ) : null}

      {/* ---- transcript ---- */}
      <label
        htmlFor="calibration-transcript"
        className="mt-5 flex items-baseline justify-between gap-3 font-display text-[0.6rem] uppercase tracking-[0.18em] text-faint"
      >
        <span>What you said</span>
        {text ? (
          <button
            type="button"
            onClick={() => {
              onText("");
              onDuration(0);
              baseText.current = "";
              setInterim("");
            }}
            className="link-underline normal-case tracking-normal text-[0.72rem] text-faint hover:text-fg"
          >
            Clear
          </button>
        ) : null}
      </label>

      <textarea
        id="calibration-transcript"
        rows={5}
        value={listening && interim ? `${text} ${interim}`.trim() : text}
        onChange={(e) => {
          onText(e.target.value);
          baseText.current = e.target.value;
        }}
        readOnly={listening}
        maxLength={4000}
        placeholder={
          supported === false
            ? "Type what you would have said."
            : "Press record and speak — the words appear here. You can edit them afterwards."
        }
        className="mt-2 w-full resize-y rounded-xl border border-line bg-surface-2 px-4 py-3 text-[0.9rem] leading-relaxed text-fg outline-none transition-colors placeholder:text-faint focus:border-brand focus:ring-4 focus:ring-brand/12"
      />

      <p className="mt-2 text-[0.72rem] leading-relaxed text-faint">
        Recognisers mishear names and numbers. Fix anything wrong — the words here
        are what your baseline is read from.
      </p>

    </div>
  );
}
