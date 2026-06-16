"use client";

import { useEffect, useState } from "react";

interface TimerBadgeProps {
  deadlineAt: number | null;
}

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function TimerBadge({ deadlineAt }: TimerBadgeProps) {
  const [remaining, setRemaining] = useState<number | null>(
    deadlineAt !== null ? deadlineAt - Date.now() : null
  );

  useEffect(() => {
    if (deadlineAt === null) {
      setRemaining(null);
      return;
    }

    const tick = () => {
      setRemaining(deadlineAt - Date.now());
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadlineAt]);

  if (deadlineAt === null || remaining === null) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-cream-soft px-3 py-1 text-sm font-medium text-muted">
        ⏱ 대기
      </span>
    );
  }

  if (remaining <= 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-cream-soft px-3 py-1 text-sm font-medium text-muted">
        ⏱ 마감
      </span>
    );
  }

  const isUrgent = remaining <= 10000;

  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold",
        isUrgent
          ? "animate-pulse bg-red-100 text-red-600"
          : "bg-cream-soft text-espresso",
      ].join(" ")}
    >
      ⏱ {formatRemaining(remaining)}
    </span>
  );
}
