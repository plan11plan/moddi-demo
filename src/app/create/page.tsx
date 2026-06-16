"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "@/lib/api-client";
import { writeIdentity } from "@/hooks/use-identity";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand";

const BUDGETS = ["1만원 이하", "1만원대", "2만원대"];
const TIMERS = [1, 3, 5];

export default function CreatePage() {
  const router = useRouter();
  const [title, setTitle] = useState("점심 모임");
  const [location, setLocation] = useState("강남역");
  const [headcount, setHeadcount] = useState(4);
  const [budget, setBudget] = useState("1만원대");
  const [timerMinutes, setTimerMinutes] = useState(3);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setCreating(true);
    setError(null);
    try {
      const { roomId, hostToken } = await api.createRoom({
        title,
        location,
        headcount,
        budget,
        timerMinutes,
      });
      writeIdentity(roomId, { hostToken });
      router.push(`/room/${roomId}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "방 생성에 실패했어요.");
      setCreating(false);
    }
  }

  return (
    <main className="app-shell flex flex-col gap-6 px-6 py-8">
      <Link href="/" className="w-fit">
        <BrandMark className="text-lg" />
      </Link>
      <header>
        <h1 className="text-2xl font-bold text-espresso">모임 만들기</h1>
        <p className="mt-1 text-sm text-muted">조건만 넣으면 후보는 자동으로 떠요.</p>
      </header>

      <Field label="모임명">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={20}
          className="input"
          placeholder="점심 모임"
        />
      </Field>

      <Field label="위치">
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="input"
          placeholder="강남역"
        />
        <p className="mt-1 text-xs text-muted">데모는 강남역 후보가 가장 풍성해요.</p>
      </Field>

      <Field label="인원">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => setHeadcount((n) => Math.max(2, n - 1))}>
            −
          </Button>
          <span className="min-w-8 text-center text-lg font-bold text-espresso tabular-nums">
            {headcount}
          </span>
          <Button variant="ghost" onClick={() => setHeadcount((n) => Math.min(8, n + 1))}>
            +
          </Button>
        </div>
      </Field>

      <Field label="예산">
        <Segmented options={BUDGETS} value={budget} onChange={setBudget} />
      </Field>

      <Field label="투표 시간">
        <Segmented
          options={TIMERS.map((t) => `${t}분`)}
          value={`${timerMinutes}분`}
          onChange={(v) => setTimerMinutes(Number(v.replace("분", "")))}
        />
      </Field>

      {error && <p className="text-sm font-medium text-terracotta">{error}</p>}

      <Button fullWidth disabled={creating} onClick={submit}>
        {creating ? "후보 뽑는 중…" : "방 만들기"}
      </Button>

      <style>{`
        .input { width:100%; border-radius:1rem; border:1px solid var(--color-line);
          background: var(--color-cream-soft); padding:0.75rem 1rem; color: var(--color-ink); outline:none; }
        .input:focus { border-color: var(--color-terracotta); }
      `}</style>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-espresso">{label}</span>
      {children}
    </label>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={[
            "flex-1 rounded-full border px-3 py-2 text-sm font-semibold transition",
            value === o
              ? "border-terracotta bg-terracotta text-cream"
              : "border-line bg-cream-soft text-espresso",
          ].join(" ")}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
