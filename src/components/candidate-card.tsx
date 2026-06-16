"use client";

import type { Candidate, CandidateTally, VoteValue } from "@/core/domain/types";
import { TagChip } from "./ui/tag-chip";

export function CandidateCard({
  candidate,
  tally,
  myValue,
  disabled,
  onVote,
}: {
  candidate: Candidate;
  tally: CandidateTally;
  myValue: VoteValue | null;
  disabled: boolean;
  onVote: (value: VoteValue) => void;
}) {
  return (
    <div className="rounded-card bg-cream-soft border border-line p-4 shadow-soft">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-bold text-espresso">{candidate.name}</h3>
        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          {candidate.tags.map((t) => (
            <TagChip key={t} label={t} />
          ))}
          {candidate.addedBy === "user" && <TagChip label="직접추가" />}
        </div>
      </div>

      {candidate.description && (
        <p className="mt-1 text-sm text-muted">{candidate.description}</p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <VoteButton
          label="좋아요"
          emoji="👍"
          count={tally.likes}
          active={myValue === "like"}
          activeClass="bg-terracotta text-cream border-terracotta"
          disabled={disabled}
          onClick={() => onVote("like")}
        />
        <VoteButton
          label="별로예요"
          emoji="👎"
          count={tally.dislikes}
          active={myValue === "dislike"}
          activeClass="bg-espresso text-cream border-espresso"
          disabled={disabled}
          onClick={() => onVote("dislike")}
        />
      </div>
    </div>
  );
}

function VoteButton({
  label,
  emoji,
  count,
  active,
  activeClass,
  disabled,
  onClick,
}: {
  label: string;
  emoji: string;
  count: number;
  active: boolean;
  activeClass: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-sm font-semibold transition",
        active ? activeClass : "border-line bg-cream text-espresso",
        disabled ? "opacity-40" : "active:scale-[0.97]",
      ].join(" ")}
    >
      <span>{emoji}</span>
      <span>{label}</span>
      <span
        className={[
          "ml-0.5 min-w-5 rounded-full px-1.5 text-xs tabular-nums",
          active ? "bg-cream/25" : "bg-cream-soft text-muted",
        ].join(" ")}
      >
        {count}
      </span>
    </button>
  );
}
