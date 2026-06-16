interface ParticipantCountProps {
  count: number;
}

export function ParticipantCount({ count }: ParticipantCountProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-cream-soft px-3 py-1 text-sm font-medium text-espresso">
      👥 {count}
    </span>
  );
}
