"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { VoteValue } from "@/core/domain/types";
import { api } from "@/lib/api-client";
import { useIdentity } from "@/hooks/use-identity";
import { useRoomPoll } from "@/hooks/use-room-poll";
import { Button } from "@/components/ui/button";
import { CandidateCard } from "@/components/candidate-card";
import { NicknameGate } from "@/components/nickname-gate";
import { TimerBadge } from "@/components/timer-badge";
import { ParticipantCount } from "@/components/participant-count";
import { ResultCelebration } from "@/components/result-celebration";

export default function RoomPage() {
  const roomId = useParams<{ id: string }>().id;
  const router = useRouter();
  const { identity, loaded, update, isHost } = useIdentity(roomId);
  const { view, error, refresh } = useRoomPoll(roomId);

  const [joining, setJoining] = useState(false);
  const [pending, setPending] = useState<Record<string, VoteValue | null>>({});
  const [busy, setBusy] = useState(false);

  if (error && !view) return <Centered>방을 찾을 수 없어요 😢</Centered>;
  if (!loaded || !view) return <Centered>불러오는 중…</Centered>;

  // 입장 전(participantId 없음) → 닉네임 게이트. 방장도 투표자라 동일.
  if (!identity.participantId) {
    return (
      <NicknameGate
        title={view.title}
        candidateCount={view.candidates.length}
        submitting={joining}
        onSubmit={async (nickname) => {
          setJoining(true);
          try {
            const { participantId } = await api.join(roomId, nickname);
            update({ participantId, nickname });
            await refresh();
          } finally {
            setJoining(false);
          }
        }}
      />
    );
  }

  const pid = identity.participantId;
  const serverMyValue = (cid: string): VoteValue | null =>
    view.votes.find((v) => v.participantId === pid && v.candidateId === cid)?.value ?? null;
  const myValue = (cid: string): VoteValue | null =>
    cid in pending ? pending[cid] : serverMyValue(cid);
  const tallyOf = (cid: string) =>
    view.tallies.find((t) => t.candidateId === cid) ?? {
      candidateId: cid,
      likes: 0,
      dislikes: 0,
      score: 0,
    };

  async function vote(cid: string, clicked: VoteValue) {
    const optimistic = myValue(cid) === clicked ? null : clicked;
    setPending((p) => ({ ...p, [cid]: optimistic }));
    try {
      await api.vote(roomId, { participantId: pid, candidateId: cid, value: clicked });
      await refresh();
    } catch {
      await refresh();
    } finally {
      setPending((p) => {
        const { [cid]: _omit, ...rest } = p;
        return rest;
      });
    }
  }

  // 결과
  if (view.status === "decided") {
    const winner = view.candidates.find((c) => c.id === view.decidedCandidateId);
    return (
      <ResultCelebration
        winnerName={winner?.name ?? "결정!"}
        winnerDescription={winner?.description ?? ""}
        likes={winner ? tallyOf(winner.id).likes : 0}
        onRestart={() => router.push("/")}
      />
    );
  }

  const voting = view.status === "voting";

  return (
    <main className="app-shell flex min-h-dvh flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-line bg-cream/90 px-4 py-3 backdrop-blur">
        <h1 className="truncate font-bold text-espresso">{view.title} 🍜</h1>
        <div className="flex items-center gap-2">
          <ParticipantCount count={view.participants.length} />
          <TimerBadge deadlineAt={view.deadlineAt} />
        </div>
      </header>

      {/* 본문 */}
      <div className="flex-1 px-4 py-4">
        {!voting && (
          <div className="mb-4 rounded-card bg-cream-soft p-4 text-center">
            <p className="font-semibold text-espresso">
              {isHost ? "준비됐으면 투표를 시작하세요 🙌" : "방장이 곧 시작해요 🙌"}
            </p>
            <p className="mt-1 text-sm text-muted">
              지금 {view.participants.length}명 모이는 중
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {view.candidates.map((c) => (
            <CandidateCard
              key={c.id}
              candidate={c}
              tally={tallyOf(c.id)}
              myValue={myValue(c.id)}
              disabled={!voting}
              onVote={(v) => vote(c.id, v)}
            />
          ))}
        </div>

        <AddCandidate
          onAdd={async (name) => {
            await api.addCandidate(roomId, { name });
            await refresh();
          }}
        />
      </div>

      {/* 푸터 (방장 운영 / 참여자 안내) */}
      <footer className="sticky bottom-0 border-t border-line bg-cream/90 px-4 py-3 backdrop-blur">
        {!voting ? (
          isHost ? (
            <div className="flex gap-2">
              <CopyLinkButton />
              <Button
                fullWidth
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await api.start(roomId, identity.hostToken!);
                    await refresh();
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                투표 시작
              </Button>
            </div>
          ) : (
            <p className="text-center text-sm text-muted">방장이 시작하면 투표가 열려요</p>
          )
        ) : isHost ? (
          <Button
            variant="danger"
            fullWidth
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await api.close(roomId, identity.hostToken!);
                await refresh();
              } finally {
                setBusy(false);
              }
            }}
          >
            지금 마감하기
          </Button>
        ) : (
          <p className="text-center text-sm text-muted">마음에 드는 곳에 👍 하세요</p>
        )}
      </footer>
    </main>
  );
}

function AddCandidate({ onAdd }: { onAdd: (name: string) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 w-full rounded-card border border-dashed border-line py-3 text-sm font-medium text-muted"
      >
        + 후보 직접 추가
      </button>
    );
  }
  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const n = name.trim();
        if (!n || busy) return;
        setBusy(true);
        try {
          await onAdd(n);
          setName("");
          setOpen(false);
        } finally {
          setBusy(false);
        }
      }}
    >
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={20}
        placeholder="식당 이름"
        className="flex-1 rounded-full border border-line bg-cream-soft px-4 py-2 text-espresso outline-none focus:border-terracotta"
      />
      <Button type="submit" disabled={busy}>
        추가
      </Button>
    </form>
  );
}

function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="ghost"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* ignore */
        }
      }}
    >
      {copied ? "복사됨!" : "URL 복사"}
    </Button>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="app-shell flex items-center justify-center px-6 text-center text-muted">
      {children}
    </main>
  );
}
