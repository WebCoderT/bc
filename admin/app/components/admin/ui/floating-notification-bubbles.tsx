"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type FloatingBubbleTone = "info" | "success" | "warning" | "error";

export type FloatingBubbleInput = {
  message: string;
  title?: string;
  tone?: FloatingBubbleTone;
  durationMs?: number;
};

type FloatingBubblePhase = "entering" | "visible" | "leaving";

export type FloatingBubbleItem = FloatingBubbleInput & {
  id: string;
  tone: FloatingBubbleTone;
  phase: FloatingBubblePhase;
  durationMs: number;
};

const DEFAULT_DURATION_MS = 3200;
const EXIT_DURATION_MS = 420;

function joinClassNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function resolveToneClassName(tone: FloatingBubbleTone) {
  if (tone === "success") {
    return "border-emerald-200 bg-emerald-500 text-white shadow-emerald-950/20";
  }

  if (tone === "warning") {
    return "border-amber-200 bg-amber-500 text-white shadow-amber-950/20";
  }

  if (tone === "error") {
    return "border-rose-200 bg-rose-500 text-white shadow-rose-950/25";
  }

  return "border-sky-200 bg-sky-500 text-white shadow-sky-950/20";
}

export function useFloatingNotificationBubbles() {
  const [items, setItems] = useState<FloatingBubbleItem[]>([]);
  const timersRef = useRef<Map<string, number[]>>(new Map());

  const clearBubbleTimers = useCallback((id: string) => {
    const timers = timersRef.current.get(id);

    if (!timers) {
      return;
    }

    timers.forEach((timer) => {
      window.clearTimeout(timer);
    });
    timersRef.current.delete(id);
  }, []);

  const removeBubble = useCallback(
    (id: string) => {
      clearBubbleTimers(id);
      setItems((current) => current.filter((item) => item.id !== id));
    },
    [clearBubbleTimers],
  );

  const pushBubble = useCallback(
    ({
      durationMs = DEFAULT_DURATION_MS,
      tone = "info",
      ...input
    }: FloatingBubbleInput) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      setItems((current) => [
        ...current,
        {
          ...input,
          id,
          tone,
          durationMs,
          phase: "entering",
        },
      ]);

      const activateTimer = window.setTimeout(() => {
        setItems((current) =>
          current.map((item) =>
            item.id === id ? { ...item, phase: "visible" } : item,
          ),
        );
      }, 24);

      const leaveTimer = window.setTimeout(
        () => {
          setItems((current) =>
            current.map((item) =>
              item.id === id ? { ...item, phase: "leaving" } : item,
            ),
          );
        },
        Math.max(800, durationMs - EXIT_DURATION_MS),
      );

      const removeTimer = window.setTimeout(() => {
        removeBubble(id);
      }, durationMs);

      timersRef.current.set(id, [activateTimer, leaveTimer, removeTimer]);
    },
    [removeBubble],
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timers) => {
        timers.forEach((timer) => {
          window.clearTimeout(timer);
        });
      });
      timersRef.current.clear();
    };
  }, []);

  return {
    items,
    pushBubble,
    removeBubble,
  };
}

export function FloatingNotificationBubbles({
  items,
}: {
  items: FloatingBubbleItem[];
}) {
  return (
    <div
      aria-atomic="false"
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[120] flex max-w-[min(24rem,calc(100vw-2rem))] flex-col items-end gap-3 sm:bottom-6 sm:right-6"
    >
      {items.map((item) => (
        <div
          key={item.id}
          className={joinClassNames(
            "min-w-[15rem] max-w-full rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-md transition-all duration-500 ease-out",
            resolveToneClassName(item.tone),
            item.phase === "entering" && "translate-y-5 opacity-0",
            item.phase === "visible" && "translate-y-0 opacity-100",
            item.phase === "leaving" && "-translate-y-5 opacity-0",
          )}
        >
          {item.title ? (
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/75">
              {item.title}
            </p>
          ) : null}
          <p
            className={joinClassNames(
              "text-sm leading-6",
              item.title ? "mt-1" : "",
            )}
          >
            {item.message}
          </p>
        </div>
      ))}
    </div>
  );
}
