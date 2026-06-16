# v0.dev 프롬프트 팩 — 모디 디자인 업그레이드

> 목적: 기존 코드(Next.js + Tailwind + shadcn)를 **갈아엎지 않고** 화면만 더 예쁘게.
> v0가 같은 스택을 출력하므로, 나온 컴포넌트를 기존 훅/API에 연결만 하면 된다.

## 사용법
1. **먼저 §0 "디자인 시스템" 블록을 v0 첫 메시지에 붙인다** (팔레트·톤 고정).
2. 그다음 **화면 1개씩** §1~§5 프롬프트를 던진다. (한 번에 하나가 품질 좋음)
3. 가능하면 **현재 화면 스샷 + yogieat 레퍼런스 이미지**를 같이 첨부 → 비주얼 그라운딩.
4. 마음에 안 들면: "더 따뜻하게 / 더 장난스럽게 / 여백 더 / 마스코트 자리 추가" 식으로 반복.
5. **§통합 노트의 props 형태는 유지**해 달라고 명시 → 내가 코드에 바로 꽂는다.

> 현재 화면 캡처: `moddi-demo.vercel.app` 에서 `/`(랜딩), `/create`, 방 만들어서 대기/투표/결과 화면을 폰 캡처해 v0에 첨부.

---

## §0 디자인 시스템 (가장 먼저 붙여넣기)

```
You are designing screens for "모디(MODI)", a mobile-first Korean web app for
deciding lunch as a group via real-time voting. Stack: Next.js (App Router) +
TypeScript + Tailwind CSS v4 + shadcn/ui. Output React components using Tailwind
classes only (no external CSS files).

Brand tone: warm, cozy, friendly, a little playful — like a cute neighborhood
lunch crew. Reference vibe: yogieat.com landing (problem → how-it-works →
solution, big CTA at top). NOT corporate, NOT cold.

Color palette (use these exact values; map to Tailwind theme tokens):
- espresso (dark bg / text):   #2A2422
- espresso-soft:               #3A322E
- cream (page bg):             #F5EFE6
- cream-soft (cards):          #FBF7F0
- terracotta (primary/CTA):    #E0673C
- terracotta-dark (hover):     #C5552E
- muted (secondary text):      #8B8079
- line (borders):              #E6DDD1

Shape & feel:
- Mobile-first, single centered column max-width 30rem (480px).
- Cards: rounded-2xl, soft shadow (0 8px 24px rgba(42,36,34,0.12)).
- Buttons: pill (rounded-full), bold. Primary = terracotta bg, cream text.
- Font: Pretendard (rounded sans). Korean UI copy.
- Lots of breathing room, large tap targets, emoji used sparingly (🍜 👍 👎 🎉 👥).
- Optional mascot slot: a cute rounded character (I'll drop an image later) —
  leave a placeholder area where it fits naturally.

Keep components self-contained and prop-driven so they're easy to integrate.
```

---

## §1 랜딩 (`/`)

```
Design the landing page for 모디. Mobile-first marketing page, scrollable,
sections top to bottom:

1. HERO: small pill badge "다같이 정하는 점심", big headline
   "점심 정하다 시간 다 가던 그 고민, 3분 컷." (emphasize "3분 컷" in terracotta),
   sub "방 만들면 후보가 자동으로 뜨고, 링크로 들어와 다 같이 실시간 투표 🍜",
   big terracotta pill CTA "바로 시작하기", tiny note "가입 없이 · 30초면 시작".
   Add a friendly hero illustration / mascot placeholder.
2. PROBLEM "이런 적, 있죠? 😩": 3 cards — "아무거나/다 좋아의 무한 루프",
   "늘 한 사람만 총대 메고 식당 검색", "메뉴 정하다 점심시간이 다 감".
3. HOW IT WORKS "모디는 이렇게 돌아가요": 4 numbered steps —
   1 방 만들기(위치·인원·예산만), 2 후보 5개 자동(AI가 '안 가본 집'까지),
   3 링크로 다 같이 투표(가입 없이 실시간), 4 타이머 끝→자동 결정.
   Make each step visually rich (icon/illustration per step).
4. SOLUTION: a dark espresso card "후보 찾기도, 교착도 이제 안 해도 돼요".
5. CLOSING CTA: "자, 오늘 점심부터 🍜" + another "바로 시작하기" button.
6. Tiny footer "모디(MODI) · 스위프 웹 14기 4조 데모".

Make it feel warm and a bit playful. Use the brand palette.
```

---

## §2 방 생성 폼 (`/create`)

```
Design a "모임 만들기" form screen, mobile-first, warm palette.
Header: "모임 만들기" + sub "조건만 넣으면 후보는 자동으로 떠요."
Fields:
- 모임명 (text input, default "점심 모임")
- 위치 (text input, default "강남역", helper "데모는 강남역 후보가 가장 풍성해요")
- 인원 (stepper: − 4 +)
- 예산 (segmented pills: 1만원 이하 / 1만원대(selected) / 2만원대)
- 투표 시간 (segmented pills: 1분 / 3분(selected) / 5분)
Primary pill button "방 만들기" (terracotta). Loading state shows "후보 뽑는 중…".
Make inputs rounded, friendly, with comfortable spacing.
```

---

## §3 대기 라운지 (방 화면 — waiting)

```
Design the "waiting lounge" of a voting room, mobile-first, warm palette.
- Sticky header: room title "점심 모임 🍜" (left), right side a "👥 1" participant
  count pill and a "⏱ 대기" timer badge.
- A friendly banner: "방장이 곧 시작해요 🙌 / 지금 N명 모이는 중" with the
  participant count growing — convey a "people are gathering" feeling
  (avatars filling in is nice).
- A list of 5 restaurant candidate cards in PREVIEW (vote buttons present but
  DISABLED/greyed). Each card: name, short description with price, small tag
  chips (category + price band; highlight "✨안가본집" in terracotta).
- A dashed "+ 후보 직접 추가" button under the list.
- Sticky footer with two pill buttons for the host: "URL 복사" (ghost) and
  "투표 시작" (terracotta primary).
```

---

## §4 투표 화면 + 후보 카드 (방 화면 — voting)

```
Design the active VOTING screen + the candidate card, mobile-first, warm palette.

Sticky header: title "점심 모임 🍜" left; right: "👥 4" pill and a countdown
timer "⏱ 0:47" (turns red + pulses under 10s).

CandidateCard (the key component): restaurant name (bold), short description with
price, tag chips (category + price band; "✨안가본집" emphasized in terracotta),
and TWO vote buttons side by side:
- "👍 좋아요" with a live count
- "👎 별로예요" with a live count
Three states per card (independent per candidate, toggle):
- none: both buttons outline
- liked: 좋아요 filled terracotta (cream text), count highlighted
- disliked: 별로예요 filled espresso (cream text)
Make voting feel satisfying — counts should look like they "fill up". No avatars,
just numbers.

Under the card list: dashed "+ 후보 직접 추가" button.
Sticky footer for host: a danger-style pill "지금 마감하기".

IMPORTANT: keep the CandidateCard interface as:
props { candidate:{name,description,tags:string[],addedBy}, tally:{likes,dislikes},
myValue:"like"|"dislike"|null, disabled:boolean, onVote:(v:"like"|"dislike")=>void }
```

---

## §5 결과 화면 (방 화면 — decided)

```
Design the RESULT / winner reveal screen, mobile-first, warm palette, celebratory.
Centered card that scales in, with confetti in brand colors (terracotta/cream/
espresso). Content: "🎉 결정됐어요!", the winning restaurant name large in
terracotta, its short description, a line "👍 N · 최다 득표", and a ghost pill
button "처음으로". Make it feel like a happy piano-finish moment. Optionally a
celebrating mascot.

Keep props: { winnerName:string, winnerDescription:string, likes:number,
onRestart:()=>void }
```

---

## 통합 노트 (나에게 / for integration)

v0 결과를 받으면 내가 할 일:
- 색/모양은 v0 출력 그대로 쓰되, **데이터는 기존 훅 연결**: `useRoomPoll`(폴링),
  `useIdentity`(localStorage), `api`(api-client.ts).
- 컴포넌트 props는 §4/§5에 적은 형태 유지 → `src/components/*` 교체.
- 페이지(`app/room/[id]/page.tsx`, `app/create/page.tsx`, `app/page.tsx`)의
  로직(상태기계·낙관적 투표·타이머)은 유지, 마크업/클래스만 교체.
- Tailwind v4 토큰(`bg-terracotta` 등)은 이미 `globals.css @theme`에 있음 →
  v0가 hex로 쓰면 토큰 클래스로 치환.
- 마스코트/일러스트 PNG·SVG는 `public/` 에 넣고 참조.

> 즉 v0는 "보기"를 만들고, 나는 "동작"에 연결. 화면은 새 디자인, 코드는 그대로 산다.
