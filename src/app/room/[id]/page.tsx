"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { VoteValue } from "@/core/domain/types";
import { api } from "@/lib/api-client";
import { useIdentity } from "@/hooks/use-identity";
import { useRoomPoll } from "@/hooks/use-room-poll";
import {
  LobbyScreen,
  VoteScreen,
  ResultScreen,
  ScreenFrame,
  ModiButton,
  MascotSlot,
  type Candidate as ModiCandidate,
} from "@/components/modi";

export default function RoomPage() {
  const roomId = useParams<{ id: string }>().id;
  const router = useRouter();
  const { identity, loaded, update, isHost } = useIdentity(roomId);
  const { view, error, refresh } = useRoomPoll(roomId);

  const [joining, setJoining] = useState(false);
  const [nickname, setNickname] = useState("");
  const [pending, setPending] = useState<Record<string, VoteValue | null>>({});

  if (error && !view) return <Centered>방을 찾을 수 없어요 😢</Centered>;
  if (!loaded || !view) return <Centered>불러오는 중…</Centered>;

  // ── 입장 전: 닉네임 게이트 (방장도 투표자라 동일) ───────────────
  if (!identity.participantId) {
    const join = async () => {
      const n = nickname.trim();
      if (!n || joining) return;
      setJoining(true);
      try {
        const { participantId } = await api.join(roomId, n);
        update({ participantId, nickname: n });
        await refresh();
      } finally {
        setJoining(false);
      }
    };
    return (
      <ScreenFrame className="items-center justify-center gap-6 text-center">
        <MascotSlot size="md" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-muted-warm">초대받은 모임</p>
          <h1 className="text-2xl font-extrabold text-espresso">{view.title} 🍜</h1>
          <p className="mt-1 text-sm text-muted-warm">
            후보 {view.candidates.length}개가 준비됐어요. 닉네임만 정하면 바로 입장!
          </p>
        </div>
        <div className="flex w-full flex-col gap-3">
          <input
            autoFocus
            value={nickname}
            maxLength={12}
            onChange={(e) => setNickname(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && join()}
            placeholder="닉네임 (예: 진수)"
            className="h-14 w-full rounded-2xl border border-line bg-card px-5 text-[15px] font-semibold text-espresso placeholder:font-medium placeholder:text-muted-warm focus:border-terracotta focus:outline-none focus:ring-4 focus:ring-terracotta/12"
          />
          <ModiButton variant="primary" full disabled={!nickname.trim() || joining} onClick={join}>
            {joining ? "입장 중…" : "입장하기"}
          </ModiButton>
          <span className="text-xs font-medium text-muted-warm">가입·로그인 없이 들어가요</span>
        </div>
      </ScreenFrame>
    );
  }

  const pid = identity.participantId;
  const serverMyValue = (cid: string): VoteValue | null =>
    view.votes.find((v) => v.participantId === pid && v.candidateId === cid)?.value ?? null;
  const myValue = (cid: string): VoteValue | null =>
    cid in pending ? pending[cid] : serverMyValue(cid);
  const tallyOf = (cid: string) => {
    const t = view.tallies.find((x) => x.candidateId === cid);
    return { likes: t?.likes ?? 0, dislikes: t?.dislikes ?? 0 };
  };
  const toModi = (c: (typeof view.candidates)[number]): ModiCandidate => ({
    name: c.name,
    description: c.description,
    tags: c.tags,
    addedBy: c.addedBy === "ai" ? "모디" : "",
  });

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

  async function addCandidate() {
    const name = window.prompt("추가할 식당 이름을 적어주세요");
    if (!name?.trim()) return;
    await api.addCandidate(roomId, { name: name.trim() });
    await refresh();
  }

  async function shareLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      window.alert("초대 링크를 복사했어요! 친구에게 붙여넣어 주세요.");
    } catch {
      /* ignore */
    }
  }

  // ── 결과 ────────────────────────────────────────────────
  if (view.status === "decided") {
    const winner = view.candidates.find((c) => c.id === view.decidedCandidateId);
    return (
      <ResultScreen
        winnerName={winner?.name ?? "결정!"}
        winnerDescription={winner?.description ?? ""}
        likes={winner ? tallyOf(winner.id).likes : 0}
        onRestart={() => router.push("/")}
      />
    );
  }

  // ── 대기 ────────────────────────────────────────────────
  if (view.status === "waiting") {
    return (
      <LobbyScreen
        roomTitle={`${view.title} 🍜`}
        people={view.participants.map((p) => ({ name: p.nickname }))}
        candidates={view.candidates.map(toModi)}
        isHost={isHost}
        onStart={async () => {
          await api.start(roomId, identity.hostToken!);
          await refresh();
        }}
        onShare={shareLink}
        onAddCandidate={addCandidate}
      />
    );
  }

  // ── 투표 ────────────────────────────────────────────────
  return (
    <VoteScreen
      roomTitle={`${view.title} 🍜`}
      participants={view.participants.length}
      secondsLeft={Math.max(0, Math.ceil((view.remainingMs ?? 0) / 1000))}
      canClose={isHost}
      items={view.candidates.map((c) => ({
        id: c.id,
        candidate: toModi(c),
        tally: tallyOf(c.id),
        myValue: myValue(c.id),
      }))}
      onVote={(id, v) => vote(id, v)}
      onAddCandidate={addCandidate}
      onClose={
        isHost
          ? async () => {
              await api.close(roomId, identity.hostToken!);
              await refresh();
            }
          : undefined
      }
    />
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <ScreenFrame className="items-center justify-center text-center">
      <p className="text-muted-warm">{children}</p>
    </ScreenFrame>
  );
}
