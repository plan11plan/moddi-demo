"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Button } from "./ui/button";

interface ResultCelebrationProps {
  winnerName: string;
  winnerDescription: string;
  likes: number;
  onRestart: () => void;
}

export function ResultCelebration({
  winnerName,
  winnerDescription,
  likes,
  onRestart,
}: ResultCelebrationProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const burst = (origin: { x: number; y: number }) => {
      confetti({
        particleCount: 80,
        spread: 70,
        origin,
        colors: ["#e0673c", "#f5efe6", "#c5552e", "#fbf7f0", "#2a2422"],
      });
    };

    burst({ x: 0.3, y: 0.5 });
    const t = setTimeout(() => burst({ x: 0.7, y: 0.4 }), 300);

    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream px-4">
      <div
        className={[
          "w-full max-w-sm rounded-card bg-cream-soft p-8 shadow-pop text-center transition-all duration-500",
          mounted ? "scale-100 opacity-100" : "scale-90 opacity-0",
        ].join(" ")}
      >
        <p className="mb-2 text-2xl font-bold text-espresso">🎉 결정됐어요!</p>

        <div className="my-6">
          <p className="text-3xl font-extrabold text-terracotta">{winnerName}</p>
          <p className="mt-2 text-sm text-muted">{winnerDescription}</p>
        </div>

        <p className="mb-6 text-sm font-medium text-espresso">
          👍 {likes} &middot; 최다 득표
        </p>

        <Button variant="ghost" onClick={onRestart}>
          처음으로
        </Button>
      </div>
    </div>
  );
}
