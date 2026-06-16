/** "모디." 워드마크 — 점은 테라코타. */
export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-extrabold tracking-tight text-espresso ${className}`}>
      모디<span className="text-terracotta">.</span>
    </span>
  );
}

/**
 * 모디 마스코트 — 따뜻한 톤의 간단 캐릭터(밥 한 그릇 느낌).
 * 데모용 자체 SVG. 나중에 생성 이미지로 교체 가능(같은 자리).
 */
export function Mascot({ size = 96 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      role="img"
      aria-label="모디 마스코트"
    >
      {/* 그릇 */}
      <path
        d="M18 60h84c0 24-19 40-42 40S18 84 18 60Z"
        fill="var(--color-terracotta)"
      />
      <path
        d="M18 60h84c0 4-1 8-2 11H20c-1-3-2-7-2-11Z"
        fill="var(--color-terracotta-dark)"
      />
      {/* 밥/얼굴 */}
      <circle cx="60" cy="50" r="30" fill="var(--color-cream-soft)" stroke="var(--color-line)" strokeWidth="2" />
      {/* 볼터치 */}
      <circle cx="46" cy="54" r="5" fill="var(--color-terracotta)" opacity="0.35" />
      <circle cx="74" cy="54" r="5" fill="var(--color-terracotta)" opacity="0.35" />
      {/* 눈 */}
      <circle cx="50" cy="46" r="3.5" fill="var(--color-espresso)" />
      <circle cx="70" cy="46" r="3.5" fill="var(--color-espresso)" />
      {/* 입 */}
      <path d="M53 56c2 3 12 3 14 0" stroke="var(--color-espresso)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* 새싹 */}
      <path d="M60 20c0-6 5-10 10-10-1 7-5 11-10 11Z" fill="var(--color-terracotta)" />
      <rect x="58.5" y="18" width="3" height="6" rx="1.5" fill="var(--color-terracotta-dark)" />
    </svg>
  );
}
