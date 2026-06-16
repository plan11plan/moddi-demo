interface TagChipProps {
  label: string;
}

export function TagChip({ label }: TagChipProps) {
  const isSpecial = label === "안가본집";

  if (isSpecial) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full border border-terracotta bg-terracotta/15 px-2.5 py-0.5 text-xs font-medium text-terracotta">
        <span aria-hidden="true">✨</span>
        {label}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-line bg-cream-soft px-2.5 py-0.5 text-xs font-medium text-muted">
      {label}
    </span>
  );
}
