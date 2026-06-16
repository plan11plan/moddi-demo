"use client";

import { useState } from "react";
import { Button } from "./ui/button";

/** 가입 없는 입장 — 닉네임만. spec: 아하② 진입 마찰 0. */
export function NicknameGate({
  title,
  candidateCount,
  submitting,
  onSubmit,
}: {
  title: string;
  candidateCount: number;
  submitting: boolean;
  onSubmit: (nickname: string) => void;
}) {
  const [nickname, setNickname] = useState("");
  const trimmed = nickname.trim();

  return (
    <main className="app-shell flex flex-col justify-center gap-6 px-6">
      <div className="text-center">
        <p className="text-sm text-muted">초대받은 모임</p>
        <h1 className="mt-1 text-2xl font-bold text-espresso">{title} 🍜</h1>
        <p className="mt-2 text-sm text-muted">
          후보 {candidateCount}개가 준비됐어요. 닉네임만 정하면 바로 입장!
        </p>
      </div>

      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (trimmed && !submitting) onSubmit(trimmed);
        }}
      >
        <input
          autoFocus
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={12}
          placeholder="닉네임 (예: 진수)"
          className="rounded-card border border-line bg-cream-soft px-4 py-3 text-espresso outline-none focus:border-terracotta"
        />
        <Button type="submit" fullWidth disabled={!trimmed || submitting}>
          {submitting ? "입장 중…" : "입장하기"}
        </Button>
      </form>
      <p className="text-center text-xs text-muted">가입·로그인 없이 들어가요</p>
    </main>
  );
}
