"use client"

import type { ReactNode } from "react"
import { useState, useMemo } from "react"
import {
  MapPin,
  Users,
  Wallet,
  Sparkles,
  Link2,
  Timer,
  Repeat,
  UserRound,
  Search,
  Plus,
  Minus,
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ================================================================== */
/* THEME & UTILITIES                                                  */
/* ================================================================== */

const AVATAR_COLORS = ["#E0673C", "#3A322E", "#8B8079", "#C5552E", "#6B7A52", "#B5824A"]
const CONFETTI_COLORS = ["#E0673C", "#C5552E", "#F5EFE6", "#2A2422", "#FBF7F0"]
const BUDGETS = ["1만원 이하", "1만원대", "2만원대"]
const VOTE_TIMES = ["1분", "3분", "5분"]

/* ================================================================== */
/* PRIMITIVES                                                         */
/* ================================================================== */

export function ScreenFrame({
  children,
  className,
  header,
  footer,
}: {
  children: ReactNode
  className?: string
  header?: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="min-h-dvh w-full bg-background flex justify-center">
      <div className="relative flex w-full max-w-[480px] flex-col">
        {header ? (
          <div className="sticky top-0 z-10 border-b border-line bg-background/90 px-6 py-4 backdrop-blur">
            {header}
          </div>
        ) : null}
        <main className={cn("flex flex-1 flex-col px-6 pb-8", header ? "pt-6" : "pt-8", className)}>
          {children}
        </main>
        {footer ? (
          <div className="sticky bottom-0 bg-gradient-to-t from-background via-background to-transparent px-6 pb-7 pt-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function ModiWordmark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "text-xl", md: "text-2xl", lg: "text-3xl" } as const
  return (
    <span className={cn("font-extrabold tracking-tight text-espresso", sizes[size])}>
      모디<span className="text-terracotta">.</span>
    </span>
  )
}

export function RoomHeader({
  title,
  count,
  timer,
  urgent = false,
}: {
  title: string
  count: number
  timer: ReactNode
  urgent?: boolean
}) {
  return (
    <header className="flex items-center justify-between gap-2">
      <h1 className="truncate text-lg font-extrabold text-espresso">{title}</h1>
      <div className="flex shrink-0 items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-cream-soft px-3 py-1.5 text-sm font-bold text-espresso">
          👥 {count}
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-bold tabular-nums transition-colors",
            urgent
              ? "animate-pulse bg-destructive text-cream"
              : "bg-terracotta/12 text-terracotta-dark",
          )}
        >
          ⏱ {timer}
        </span>
      </div>
    </header>
  )
}

export function MascotSlot({
  size = "lg",
  label = "모디 마스코트",
  className,
}: {
  size?: "sm" | "md" | "lg"
  label?: string
  className?: string
}) {
  const sizes = { sm: "size-16", md: "size-24", lg: "size-36" } as const
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "grid place-items-center rounded-full bg-cream-soft shadow-soft",
        sizes[size],
        className,
      )}
    >
      <svg viewBox="0 0 120 120" className="size-3/4" fill="none" aria-hidden>
        <path d="M18 60h84c0 24-19 40-42 40S18 84 18 60Z" fill="var(--color-terracotta)" />
        <path d="M18 60h84c0 4-1 8-2 11H20c-1-3-2-7-2-11Z" fill="var(--color-terracotta-dark)" />
        <circle cx="60" cy="50" r="30" fill="var(--color-cream)" stroke="var(--color-line)" strokeWidth="2" />
        <circle cx="46" cy="54" r="5" fill="var(--color-terracotta)" opacity="0.35" />
        <circle cx="74" cy="54" r="5" fill="var(--color-terracotta)" opacity="0.35" />
        <circle cx="50" cy="46" r="3.5" fill="var(--color-espresso)" />
        <circle cx="70" cy="46" r="3.5" fill="var(--color-espresso)" />
        <path d="M53 56c2 3 12 3 14 0" stroke="var(--color-espresso)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M60 20c0-6 5-10 10-10-1 7-5 11-10 11Z" fill="var(--color-terracotta)" />
        <rect x="58.5" y="18" width="3" height="6" rx="1.5" fill="var(--color-terracotta-dark)" />
      </svg>
    </div>
  )
}

type Variant = "primary" | "secondary" | "ghost"

export function ModiButton({
  children,
  onClick,
  variant = "primary",
  full = false,
  disabled = false,
  type = "button",
  className,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: Variant
  full?: boolean
  disabled?: boolean
  type?: "button" | "submit"
  className?: string
}) {
  const variants: Record<Variant, string> = {
    primary:
      "bg-terracotta text-cream shadow-soft hover:bg-terracotta-dark active:translate-y-px",
    secondary:
      "bg-cream-soft text-espresso border border-line hover:border-terracotta/40 active:translate-y-px",
    ghost: "bg-transparent text-muted-warm hover:text-espresso",
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex h-14 items-center justify-center gap-2 rounded-full px-6 text-base font-bold transition-all",
        "disabled:cursor-not-allowed disabled:opacity-50",
        full && "w-full",
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  )
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-line bg-card p-5 shadow-soft", className)}>
      {children}
    </div>
  )
}

export type Person = { name: string; color?: string }

export function Avatar({ name, color, size = 36 }: { name: string; color?: string; size?: number }) {
  const bg = color ?? AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-bold text-cream ring-2 ring-card"
      style={{ width: size, height: size, backgroundColor: bg, fontSize: size * 0.4 }}
      title={name}
    >
      {name.slice(0, 1)}
    </span>
  )
}

export function AvatarStack({
  people,
  max = 5,
  size = 36,
}: {
  people: Person[]
  max?: number
  size?: number
}) {
  const shown = people.slice(0, max)
  const extra = people.length - shown.length
  return (
    <div className="flex items-center" aria-label={`참여자 ${people.length}명`}>
      <div className="flex -space-x-2">
        {shown.map((p, i) => (
          <Avatar key={`${p.name}-${i}`} name={p.name} color={p.color} size={size} />
        ))}
        {extra > 0 ? (
          <span
            className="grid shrink-0 place-items-center rounded-full bg-muted font-bold text-muted-warm ring-2 ring-card"
            style={{ width: size, height: size, fontSize: size * 0.34 }}
          >
            +{extra}
          </span>
        ) : null}
      </div>
    </div>
  )
}

/* ================================================================== */
/* CANDIDATE CARD COMPONENTS                                          */
/* ================================================================== */

export type Candidate = {
  name: string
  description: string
  tags: string[]
  addedBy: string
}

export type Tally = { likes: number; dislikes: number }

export function CandidateCard({
  candidate,
  tally,
  myValue,
  disabled,
  onVote,
}: {
  candidate: Candidate
  tally: Tally
  myValue: "like" | "dislike" | null
  disabled: boolean
  onVote: (v: "like" | "dislike") => void
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl border border-line bg-card p-5 shadow-soft transition-opacity",
        disabled && "opacity-90",
      )}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[17px] font-extrabold leading-snug text-espresso">{candidate.name}</h3>
          {candidate.addedBy ? (
            <span className="shrink-0 whitespace-nowrap pt-0.5 text-[11px] font-semibold text-muted-warm">
              {candidate.addedBy === "모디" ? "모디 추천" : `${candidate.addedBy}님 추가`}
            </span>
          ) : null}
        </div>
        <p className="text-sm leading-relaxed text-muted-warm">{candidate.description}</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {candidate.tags.map((t) => (
            <TagChip key={t} tag={t} />
          ))}
        </div>
      </div>

      <div className="flex gap-2.5">
        <VoteButton
          kind="like"
          count={tally.likes}
          active={myValue === "like"}
          disabled={disabled}
          onClick={() => onVote("like")}
        />
        <VoteButton
          kind="dislike"
          count={tally.dislikes}
          active={myValue === "dislike"}
          disabled={disabled}
          onClick={() => onVote("dislike")}
        />
      </div>
    </div>
  )
}

export function TagChip({ tag }: { tag: string }) {
  const highlight = tag.includes("안가본집")
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold",
        highlight
          ? "bg-terracotta/12 text-terracotta-dark"
          : "bg-cream text-muted-warm",
      )}
    >
      {tag}
    </span>
  )
}

function VoteButton({
  kind,
  count,
  active,
  disabled,
  onClick,
}: {
  kind: "like" | "dislike"
  count: number
  active: boolean
  disabled: boolean
  onClick: () => void
}) {
  const isLike = kind === "like"
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={isLike ? "좋아요" : "별로예요"}
      className={cn(
        "group flex h-12 flex-1 items-center justify-center gap-2 rounded-full px-3 text-sm font-bold transition-all",
        "active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50",
        active
          ? isLike
            ? "bg-terracotta text-cream shadow-soft"
            : "bg-espresso text-cream shadow-soft"
          : "border border-line bg-card text-espresso hover:border-terracotta/40",
      )}
    >
      <span className="text-base leading-none">{isLike ? "👍" : "👎"}</span>
      <span>{isLike ? "좋아요" : "별로예요"}</span>
      <span
        key={count}
        className={cn(
          "inline-grid min-w-6 animate-in zoom-in-50 place-items-center rounded-full px-1.5 py-0.5 text-xs font-extrabold tabular-nums duration-200",
          active
            ? "bg-cream/25 text-cream"
            : isLike
              ? "bg-terracotta/12 text-terracotta-dark"
              : "bg-cream text-muted-warm",
        )}
      >
        {count}
      </span>
    </button>
  )
}

export function AddCandidateButton({
  onClick,
  disabled,
}: {
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-transparent text-sm font-bold text-muted-warm transition-colors",
        "hover:border-terracotta/40 hover:text-terracotta-dark disabled:opacity-50",
      )}
    >
      <Plus className="size-4" />
      후보 직접 추가
    </button>
  )
}

/* ================================================================== */
/* SCREENS                                                            */
/* ================================================================== */

/* LANDING PAGE */
export function LandingPage({ onStart }: { onStart?: () => void }) {
  return (
    <div className="min-h-dvh w-full bg-background flex justify-center">
      <div className="w-full max-w-[480px] flex flex-col">
        <header className="flex items-center justify-between px-6 pt-6">
          <ModiWordmark size="md" />
          <ModiButton variant="ghost" onClick={onStart} className="h-10 px-4 text-sm">
            시작하기
          </ModiButton>
        </header>

        <section className="flex flex-col items-center gap-6 px-6 pb-14 pt-10 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-terracotta/12 px-4 py-1.5 text-sm font-bold text-terracotta-dark">
            다같이 정하는 점심
          </span>

          <h1 className="text-pretty text-[34px] font-extrabold leading-[1.2] tracking-tight text-espresso">
            점심 정하다 시간 다 가던
            <br />그 고민, <span className="text-terracotta">3분 컷.</span>
          </h1>

          <p className="text-pretty px-2 text-[15px] leading-relaxed text-muted-warm">
            방 만들면 후보가 자동으로 뜨고,
            <br />
            링크로 들어와 다 같이 실시간 투표 🍜
          </p>

          <MascotSlot size="lg" label="인사하는 모디" className="my-2" />

          <div className="flex w-full flex-col items-center gap-3">
            <ModiButton variant="primary" full onClick={onStart} className="text-lg">
              바로 시작하기
            </ModiButton>
          </div>
        </section>

        <section className="bg-cream-soft px-6 py-12">
          <div className="flex flex-col gap-2 text-center">
            <span className="text-sm font-bold text-terracotta-dark">이런 적, 있죠? 😩</span>
            <h2 className="text-pretty text-2xl font-extrabold leading-snug text-espresso">
              점심 정하기, 왜 이렇게 힘들까요
            </h2>
          </div>
          <div className="mt-7 flex flex-col gap-3">
            {[
              {
                icon: <Repeat className="size-5" />,
                title: '"아무거나 / 다 좋아"의 무한 루프',
                desc: "서로 양보만 하다 결국 아무도 못 정해요.",
              },
              {
                icon: <Search className="size-5" />,
                title: "늘 한 사람만 총대 메고 식당 검색",
                desc: "매번 같은 사람이 메뉴 찾고 지쳐버려요.",
              },
              {
                icon: <Timer className="size-5" />,
                title: "메뉴 정하다 점심시간이 다 감",
                desc: "정하고 나면 이미 줄 서야 할 시간이죠.",
              },
            ].map((it) => (
              <div
                key={it.title}
                className="flex items-start gap-4 rounded-2xl border border-line bg-card p-5 shadow-soft"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-terracotta/12 text-terracotta-dark">
                  {it.icon}
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[15px] font-bold leading-snug text-espresso">{it.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-warm">{it.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 py-14">
          <div className="flex flex-col gap-2 text-center">
            <span className="text-sm font-bold text-terracotta-dark">HOW IT WORKS</span>
            <h2 className="text-pretty text-2xl font-extrabold leading-snug text-espresso">
              모디는 이렇게 돌아가요
            </h2>
          </div>
          <ol className="mt-8 flex flex-col gap-4">
            {[
              {
                icons: [
                  <MapPin key="a" className="size-5" />,
                  <Users key="b" className="size-5" />,
                  <Wallet key="c" className="size-5" />,
                ],
                title: "방 만들기",
                desc: "위치·인원·예산만 입력하면 끝. 복잡한 설정은 없어요.",
              },
              {
                icons: [<Sparkles key="a" className="size-5" />],
                title: "후보 5개 자동 추천",
                desc: "AI가 '안 가본 집'까지 골라 메뉴 후보를 채워줘요.",
              },
              {
                icons: [<Link2 key="a" className="size-5" />],
                title: "링크로 다 같이 투표",
                desc: "가입 없이 링크만 열면 모두 같은 화면에서 실시간 투표.",
              },
              {
                icons: [<Timer key="a" className="size-5" />],
                title: "타이머 끝 → 자동 결정",
                desc: "시간이 끝나면 최다 득표 메뉴로 자동 결정돼요.",
              },
            ].map((s, i) => (
              <li
                key={s.title}
                className="relative flex flex-col gap-3 rounded-2xl border border-line bg-card p-5 shadow-soft"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-terracotta text-base font-extrabold text-cream">
                    {i + 1}
                  </span>
                  <h3 className="text-base font-bold text-espresso">{s.title}</h3>
                </div>
                <div className="flex items-center gap-2 pl-12">
                  {s.icons.map((ic, k) => (
                    <span
                      key={k}
                      className="grid size-10 place-items-center rounded-xl bg-cream text-terracotta-dark"
                    >
                      {ic}
                    </span>
                  ))}
                </div>
                <p className="pl-12 text-sm leading-relaxed text-muted-warm">{s.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="px-6 pb-14">
          <div className="flex flex-col items-center gap-5 rounded-2xl bg-espresso p-8 text-center shadow-pop">
            <span className="grid size-14 place-items-center rounded-2xl bg-terracotta/20 text-terracotta">
              <Sparkles className="size-7" />
            </span>
            <h2 className="text-pretty text-[26px] font-extrabold leading-snug text-cream">
              후보 찾기도, 교착도
              <br />
              이제 안 해도 돼요
            </h2>
            <p className="text-pretty text-sm leading-relaxed text-cream/70">
              모디가 후보를 자동으로 채우고, 다 같이 한 표씩 던지면 끝.
              <br />
              누구도 총대 멜 필요 없는 점심 결정.
            </p>
          </div>
        </section>

        <section className="flex flex-col items-center gap-5 bg-cream-soft px-6 py-14 text-center">
          <MascotSlot size="md" label="신난 모디" />
          <h2 className="text-pretty text-2xl font-extrabold leading-snug text-espresso">
            자, 오늘 점심부터 🍜
          </h2>
          <ModiButton variant="primary" full onClick={onStart} className="text-lg">
            바로 시작하기
          </ModiButton>
        </section>

        <footer className="flex items-center justify-center gap-2 px-6 py-8">
          <UserRound className="size-3.5 text-muted-warm" />
          <span className="text-xs font-medium text-muted-warm">
            모디(MODI) · 스위프 웹 14기 4조 데모
          </span>
        </footer>
      </div>
    </div>
  )
}

/* CREATE SCREEN */
export type CreateConfig = {
  name: string
  location: string
  size: number
  budget: string
  voteTime: string
}

export function CreateScreen({
  onSubmit,
  onBack,
}: {
  onSubmit?: (config: CreateConfig) => void
  onBack?: () => void
}) {
  const [name, setName] = useState("점심 모임")
  const [location, setLocation] = useState("강남역")
  const [size, setSize] = useState(4)
  const [budget, setBudget] = useState("1만원대")
  const [voteTime, setVoteTime] = useState("3분")
  const [loading, setLoading] = useState(false)

  function handleSubmit() {
    if (loading) return
    setLoading(true)
    const config = { name, location, size, budget, voteTime }
    setTimeout(() => onSubmit?.(config), 1600)
  }

  return (
    <ScreenFrame
      footer={
        <ModiButton variant="primary" full onClick={handleSubmit} disabled={loading}>
          {loading ? "후보 뽑는 중…" : "방 만들기"}
        </ModiButton>
      }
    >
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="뒤로 가기"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-cream-soft text-lg text-espresso"
        >
          ‹
        </button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-extrabold text-espresso">모임 만들기</h1>
        </div>
      </header>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-warm">
        조건만 넣으면 후보는 자동으로 떠요.
      </p>

      <div className="mt-8 flex flex-1 flex-col gap-7">
        <FieldWrapper label="모임명">
          <TextInput value={name} onChange={setName} placeholder="점심 모임" disabled={loading} />
        </FieldWrapper>

        <FieldWrapper label="위치" helper="데모는 강남역 후보가 가장 풍성해요">
          <TextInput value={location} onChange={setLocation} placeholder="강남역" disabled={loading} />
        </FieldWrapper>

        <FieldWrapper label="인원">
          <Stepper value={size} min={2} max={20} onChange={setSize} disabled={loading} />
        </FieldWrapper>

        <FieldWrapper label="예산">
          <Segmented options={BUDGETS} value={budget} onChange={setBudget} disabled={loading} />
        </FieldWrapper>

        <FieldWrapper label="투표 시간">
          <Segmented options={VOTE_TIMES} value={voteTime} onChange={setVoteTime} disabled={loading} />
        </FieldWrapper>
      </div>
    </ScreenFrame>
  )
}

function FieldWrapper({
  label,
  helper,
  children,
}: {
  label: string
  helper?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-sm font-bold text-espresso">{label}</label>
      {children}
      {helper ? <p className="text-xs leading-relaxed text-muted-warm">{helper}</p> : null}
    </div>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-14 w-full rounded-2xl border border-line bg-card px-5 text-[15px] font-semibold text-espresso",
        "placeholder:font-medium placeholder:text-muted-warm",
        "transition-colors focus:border-terracotta focus:outline-none focus:ring-4 focus:ring-terracotta/12",
        "disabled:opacity-60",
      )}
    />
  )
}

function Stepper({
  value,
  min = 1,
  max = 99,
  onChange,
  disabled,
}: {
  value: number
  min?: number
  max?: number
  onChange: (v: number) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-line bg-card px-4 py-3">
      <StepBtn
        label="인원 줄이기"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus className="size-5" />
      </StepBtn>
      <span className="flex items-baseline gap-1 text-2xl font-extrabold text-espresso">
        {value}
        <span className="text-sm font-bold text-muted-warm">명</span>
      </span>
      <StepBtn
        label="인원 늘리기"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus className="size-5" />
      </StepBtn>
    </div>
  )
}

function StepBtn({
  children,
  onClick,
  disabled,
  label,
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid size-11 place-items-center rounded-full bg-cream text-espresso transition-all active:scale-95",
        "disabled:cursor-not-allowed disabled:opacity-40",
      )}
    >
      {children}
    </button>
  )
}

function Segmented({
  options,
  value,
  onChange,
  disabled,
}: {
  options: string[]
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => {
        const active = opt === value
        return (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt)}
            className={cn(
              "h-12 flex-1 rounded-full px-2 text-sm font-bold transition-all active:scale-[0.98]",
              active
                ? "bg-terracotta text-cream shadow-soft"
                : "border border-line bg-card text-muted-warm hover:border-terracotta/40",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

/* LOBBY SCREEN */
export function LobbyScreen({
  roomTitle = "점심 모임 🍜",
  people = [],
  candidates = [],
  isHost = true,
  onStart,
  onShare,
  onAddCandidate,
}: {
  roomTitle?: string
  people?: Person[]
  candidates?: Candidate[]
  isHost?: boolean
  onStart?: () => void
  onShare?: () => void
  onAddCandidate?: () => void
}) {
  const count = people.length

  return (
    <ScreenFrame
      header={<RoomHeader title={roomTitle} count={count} timer="대기" />}
      footer={
        isHost ? (
          <div className="flex gap-3">
            <ModiButton variant="secondary" full onClick={onShare}>
              URL 복사
            </ModiButton>
            <ModiButton variant="primary" full onClick={onStart}>
              투표 시작
            </ModiButton>
          </div>
        ) : (
          <ModiButton variant="secondary" full disabled>
            방장이 시작하길 기다리는 중…
          </ModiButton>
        )
      }
    >
      <section className="flex flex-col gap-4 rounded-2xl bg-cream-soft p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-base font-extrabold text-espresso">방장이 곧 시작해요 🙌</p>
            <p className="text-sm font-semibold text-muted-warm">
              지금 <span className="text-terracotta-dark">{count}명</span> 모이는 중
            </p>
          </div>
          <AvatarStack people={people} size={36} max={4} />
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-warm">
          <span className="inline-block size-2 animate-pulse rounded-full bg-terracotta" />
          친구들이 링크로 들어오고 있어요
        </div>
      </section>

      <div className="mb-3 mt-7 flex items-center justify-between">
        <h2 className="text-sm font-bold text-espresso">후보 미리보기</h2>
        <span className="text-xs font-semibold text-muted-warm">투표 시작 전이에요</span>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {candidates.map((c, i) => (
          <CandidateCard
            key={`${c.name}-${i}`}
            candidate={c}
            tally={{ likes: 0, dislikes: 0 }}
            myValue={null}
            disabled
            onVote={() => {}}
          />
        ))}
        <AddCandidateButton onClick={onAddCandidate} />
      </div>
    </ScreenFrame>
  )
}

/* VOTE SCREEN */
export type VoteItem = {
  id: string
  candidate: Candidate
  tally: Tally
  myValue: "like" | "dislike" | null
}

export function VoteScreen({
  roomTitle = "점심 모임 🍜",
  participants = 4,
  secondsLeft = 47,
  items = [],
  canClose = true,
  onVote,
  onAddCandidate,
  onClose,
}: {
  roomTitle?: string
  participants?: number
  secondsLeft?: number
  items?: VoteItem[]
  canClose?: boolean
  onVote?: (id: string, v: "like" | "dislike") => void
  onAddCandidate?: () => void
  onClose?: () => void
}) {
  const urgent = secondsLeft <= 10
  const mins = Math.floor(secondsLeft / 60)
  const secs = String(secondsLeft % 60).padStart(2, "0")

  return (
    <ScreenFrame
      header={<RoomHeader title={roomTitle} count={participants} timer={`${mins}:${secs}`} urgent={urgent} />}
      footer={
        !canClose ? (
          <p className="py-2 text-center text-sm font-semibold text-muted-warm">
            타이머가 끝나면 자동으로 결정돼요
          </p>
        ) : (
        <ModiButton
          variant="primary"
          full
          onClick={onClose}
          className="bg-destructive hover:bg-destructive/90"
        >
          지금 마감하기
        </ModiButton>
        )
      }
    >
      <div className="mb-1 flex flex-col gap-1">
        <h2 className="text-xl font-extrabold leading-snug text-espresso">
          끌리는 메뉴에 투표해요
        </h2>
        <p className="text-sm font-semibold text-muted-warm">
          {urgent ? "곧 마감돼요, 서둘러요! ⏱" : "👍 좋아요 / 👎 별로예요 한 표씩!"}
        </p>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-3">
        {items.map((it) => (
          <CandidateCard
            key={it.id}
            candidate={it.candidate}
            tally={it.tally}
            myValue={it.myValue}
            disabled={false}
            onVote={(v) => onVote?.(it.id, v)}
          />
        ))}
        <AddCandidateButton onClick={onAddCandidate} />
      </div>
    </ScreenFrame>
  )
}

/* RESULT SCREEN */
export function ResultScreen({
  winnerName,
  winnerDescription,
  likes,
  onRestart,
}: {
  winnerName: string
  winnerDescription: string
  likes: number
  onRestart?: () => void
}) {
  return (
    <ScreenFrame className="items-center justify-center text-center">
      <Confetti />

      <div className="relative z-10 flex w-full animate-in zoom-in-95 fade-in flex-col items-center gap-5 duration-500">
        <MascotSlot size="md" label="축하하는 모디" />

        <div className="w-full rounded-2xl border-2 border-terracotta/30 bg-card p-8 shadow-pop">
          <p className="text-base font-extrabold text-espresso">🎉 결정됐어요!</p>

          <h1 className="mt-4 text-pretty text-4xl font-extrabold leading-tight text-terracotta">
            {winnerName}
          </h1>

          <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-warm">
            {winnerDescription}
          </p>

          <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-terracotta/12 px-4 py-2 text-sm font-bold text-terracotta-dark">
            👍 {likes} · 최다 득표
          </div>
        </div>

        <ModiButton variant="ghost" onClick={onRestart} className="mt-1">
          처음으로
        </ModiButton>
      </div>
    </ScreenFrame>
  )
}

function Confetti({ count = 70 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const left = Math.random() * 100
        const drift = `${(Math.random() - 0.5) * 160}px`
        const delay = Math.random() * 0.6
        const duration = 2.4 + Math.random() * 1.8
        const size = 6 + Math.random() * 8
        const round = Math.random() > 0.5
        return {
          id: i,
          color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          style: {
            left: `${left}%`,
            width: size,
            height: size * (round ? 1 : 1.6),
            borderRadius: round ? "9999px" : "2px",
            animationDelay: `${delay}s`,
            animationDuration: `${duration}s`,
            ["--drift" as string]: drift,
          } as React.CSSProperties,
        }
      }),
    [count],
  )

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="animate-confetti absolute top-0"
          style={{ ...p.style, backgroundColor: p.color }}
        />
      ))}
    </div>
  )
}
