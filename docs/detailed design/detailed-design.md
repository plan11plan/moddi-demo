# 모디 — 아이디어 세부 설계

> 9단계 프레임(①구현가능성 → ⑨최종문서)으로 진행한 세부 설계 결과.
> 초기 설계(`../initial design/`: product.md·architecture.md)의 상위 결정을 **"읽으면 화면을 바로 그릴 수 있는"** 수준으로 구체화한 문서다.
> 모든 항목은 공동창업자 Q&A로 확정됨. 재검토 트리거는 ⑧ 표 참고.

---

## ① 구현 가능성 검증 (Feasibility)

| 리스크 | 결정 | 근거 / 트레이드오프 |
|---|---|---|
| 동시 투표 시 표 유실(race) | **C — RMW 단순 유지** | 데모 규모(소수 동시)는 거의 안 터짐. 터지면 투표만 원자키(옵션A)로 교체 — **UI 영향 0** |
| 무료·무카드 제약 위반 우려 | **Upstash 무료 티어 사용** | 2026 확인: 카드 불필요, 월 50만 명령·256MB·DB10개. 데모 1회 ≈ 1,500 명령 → 여유 |
| 폴링이 "실시간"으로 안 보임 | **1초 고정 폴링 + 낙관적 업데이트 + 카운트업** | 내 표=즉시 반영, 남의 표=부드럽게 차오름. 개발 중에도 Redis 사용 |
| mock 후보가 착시 깨짐 | **B — 조건 반영 풀** | 지역·가격·카테고리 태그 풀에서 필터+셔플+5개, "안 가본 집" 1~2개 시드, 미스 시 폴백셋. **데모 지역=강남역** 집중 |
| 무로그인이라 신원 유실 | **localStorage(방ID별)** | participantId·hostToken을 방ID 키로 저장 → 새로고침해도 같은 사람·표 유지 |

→ 큰 바위 5개 모두 해소. 세부는 아래 단계에 반영.

---

## ② 기술 스택

- **Next.js (App Router) + TypeScript** / 배포 **Vercel**
- 저장소 **Upstash Redis** (`@upstash/redis`, HTTP REST — 서버리스 커넥션 걱정 0)
- 실시간 **1초 폴링** + 낙관적 업데이트 + 카운트업 애니메이션
- 후보 **mock provider** (조건 반영 풀)
- 구조 **헥사고날** (core ↔ 포트 ↔ 어댑터)
- 테스트 **Vitest**(단위·통합) + **Playwright**(E2E, 선택)
- **UI: Tailwind + shadcn/ui**

### 디자인 토큰 (웜 톤 — 레퍼런스 기반)

형태는 **반응형 웹(모바일 우선)** — 폰 브라우저에서 앱처럼 보이지만 설치 없는 웹페이지. 네이티브 앱 아님.

```
배경(다크)   에스프레소 브라운   ~#2A2422
배경(라이트) 웜 크림/베이지      ~#F5EFE6
포인트        테라코타 오렌지     ~#E0673C   (버튼·FAB·강조·확정)
모서리        카드 rounded-2xl, 버튼 pill
그림자        soft
폰트          둥근 산세리프(Pretendard 등)
마스코트      데모=이모지/심플 플레이스홀더 (진짜 캐릭터는 디자이너)
```

- **공유 = URL 복사만** (카카오 공유 SDK는 키·인증 필요 → 제약 위반이라 제외. 카톡엔 링크 붙여넣기)
- **타이머/카운트다운 포함** (레퍼런스의 마감 타이머 채택)

---

## ③ 사용 흐름 (화면 단위로 그릴 수 있는 수준)

### 상태 기계
```
waiting (생성·대기) ──[방장: 투표 시작]──▶ voting (타이머 가동)
                                          │
                          [타이머 0] 또는 [방장: 지금 마감]
                                          ▼
                                     decided (우승 자동 공개)
```

### 역할
- **방장 = 투표자.** 방장 화면 = 참여자 투표 화면 + 운영 버튼([투표 시작]/[지금 마감]). 참여자 목록에도 포함.
- **참여자 = 링크 + 닉네임만(가입 X).**

### 타이머
- **시작:** 방장이 `[투표 시작]`을 누르는 순간 (생성 즉시 아님 — 링크 먼저 뿌리고 사람 모인 뒤 시작).
- **길이:** 방 생성 시 프리셋 **1 / 3 / 5분**(기본 3분, 데모는 1분).
- **0초 동작:** 자동 마감 + **그 시점 1등 후보 자동 공개**(축하 연출). 방장은 `[지금 마감]`으로 조기 종료 가능.
- **동점:** 점수 같으면 **그 점수에 먼저 도달한 후보** 승(투표 로그 seq로 판정).
- **구현:** `deadlineAt` 저장 → 폴링 시 지났으면 **lazy 자동 확정**(크론 불필요).

### 해피패스 시퀀스
```
[방장]
1. 랜딩 → "모임 만들기"
2. 폼: 모임명 · 위치(강남역) · 인원 · 예산 · 타이머(1/3/5분)
3. 생성 → 1.5초 "후보 뽑는 중…" 연출
4. 방(대기) 화면: 후보 5개 + [URL 복사] + [투표 시작]
[참여자]
5. 링크 → 닉네임 입력(가입X) → 입장 → 대기 라운지
6. (방장이 시작) → 투표: 후보 👍/👎, 내 표 즉시·남의 표 1초마다 차오름
7. 후보 직접 추가 가능 (대기·투표 중 모두)
[결과]
8. 타이머 0 또는 방장 "지금 마감" → 투표 잠김
9. 1등 후보 🎉 컨페티 + 결과 카드 전원 표시
```

### 대기 라운지 (waiting)
- 후보 카드 **미리보기**(👍/👎 버튼 **비활성/회색**) + "방장이 곧 시작해요" + `👥 N명 모이는 중`(실시간 증가).
- 방장 화면엔 하단 `[투표 시작]`.

### 엣지
- 빈 방(1명/0표)도 화면 안 깨지고 안내.
- 닉네임 중복 허용. 폰 하나 돌려쓰면 같은 사람 취급(데모선 무시).

---

## ④ 화면 설계

### 라우팅
```
/                랜딩 + "모임 만들기" 진입
/create          방 생성 폼
/room/[id]       ★ 핵심 — 역할(방장/참여자) × 상태(waiting/voting/decided)로 변신
```
방 하나를 `/room/[id]` 한 라우트로 두고 내부 상태로 화면 전환 → 라우트·폴링 단순.

### 투표 카드 (옵션 1 — 담백 버튼형, 3-상태 토글)
```
┌───────────────────────────┐
│ 🍜 강남 손칼국수  [안가본집]│
│ 칼칼한 국물 · 9,000원~      │
│   👍 3            👎 1      │
│ [ 좋아요 ]   [ 별로예요 ]   │
└───────────────────────────┘
```
- 상태: **없음 / 좋아요(👍 채움) / 별로(👎 채움)**. 같은 버튼 재클릭=취소, 반대 클릭=전환.
- **후보마다 독립** — 여러 후보 동시 👍/👎 가능.
- 숫자(👍N 👎N)는 **항상 실시간**. 누가 눌렀는지 아바타는 **없음(숫자만)**.

### 헤더 / 푸터 (voting 화면)
```
┌─────────────────────────────────┐
│ 점심 모임 🍜      👥 4   ⏱ 00:47 │  ← 고정 헤더
├─────────────────────────────────┤
│  [후보 카드들]                    │
│  [+ 후보 직접 추가]               │
├─────────────────────────────────┤
│   방장만: [ 지금 마감하기 ]        │  ← 고정 푸터(대기땐 [투표 시작])
└─────────────────────────────────┘
```
- 타이머: 우상단 `MM:SS`, **마지막 10초 빨강+깜빡**.
- 참여자수: 상단 `👥 N`(실시간). 모임명: 좌상단.
- 방장 운영버튼: 하단 고정(참여자에겐 안 보임). `[+후보 추가]`: 리스트 맨 아래.

### 결과 화면 (decided)
```
        🎉🎉🎉
    ┌─────────────────┐
    │   결정됐어요!     │
    │ 🍜 강남 손칼국수   │
    │ 칼칼한 국물 9,000원~│
    │ 👍 4 · 최다 득표   │
    └─────────────────┘
       [ 처음으로 ]
```
- `canvas-confetti`(무료) + 우승 카드 zoom-in.
- 지도 API 미사용 → **"길찾기" 버튼 생략**(식당명·설명·득표수만).

---

## ⑤ API 설계 (Next.js Route Handlers = 얇은 컨트롤러)

| 메서드·경로 | 권한 | 요청 | 효과/응답 |
|---|---|---|---|
| `POST /api/rooms` | - | `{title, location, headcount, budget, timerMinutes}` | mock 후보5 생성, `status:'waiting'` → `{roomId, hostToken}` |
| `GET /api/rooms/:id` | - | (폴링) | 방 상태+집계+`remainingMs`. 지났으면 **lazy 자동 확정** |
| `POST /api/rooms/:id/join` | - | `{nickname}` | `{participantId}` |
| `POST /api/rooms/:id/start` | 방장 | `{hostToken}` | `status:'voting'`, `deadlineAt=now+timer` |
| `POST /api/rooms/:id/votes` | 참여자 | `{participantId, candidateId, value:'like'|'dislike'}` | upsert(한 명 한 후보 한 표) |
| `POST /api/rooms/:id/candidates` | 참여자 | `{participantId, name, description?}` | 후보 추가 |
| `POST /api/rooms/:id/close` | 방장 | `{hostToken}` | `status:'decided'` + 우승 계산 |

- 권한: 방장 액션은 `hostToken`, 투표는 `participantId`(둘 다 localStorage).
- 우승: `score = 좋아요 − 싫어요` 최대, 동점=먼저 도달(seq).

---

## ⑥ 데이터 설계 (C 선택 → 방 = JSON 한 덩어리)

```jsonc
// Redis key: room:{id}   (TTL 24h)
{
  id, title,
  conditions: { location: "강남역", headcount: 4, budget: "1만원대" },
  hostToken,                          // 공유 링크엔 노출 X
  status: "waiting | voting | decided",
  timerMinutes: 1,
  deadlineAt: 1718500000000 | null,   // voting 시작 시 설정
  candidates: [ { id, name, description, tags: [], addedBy: "ai|user" } ],
  participants: [ { id, nickname, joinedAt } ],
  votes: [ { seq, participantId, candidateId, value, at } ],  // seq=동점 판정
  decidedCandidateId: null,
  createdAt
}
```
- 집계(좋아요/싫어요 수)는 **저장 안 하고 `votes`에서 읽을 때 계산** → 정합성 꼬임 없음.

---

## ⑦ 코드 아키텍처 (헥사고날)

```
src/
  app/
    page.tsx · create/page.tsx · room/[id]/page.tsx
    api/rooms/route.ts · rooms/[id]/route.ts
        rooms/[id]/{join,start,votes,candidates,close}/route.ts
  core/                          ⭐ 순수 TS, next/upstash import 금지
    domain/        room.ts(엔티티·상태전이) · tally.ts(집계·우승, 순수) · ids.ts
    application/   create-room · get-room-state(lazy 마감) · join-room ·
                   start-voting · cast-vote · add-candidate · close-room
    ports/         room-repository.ts · candidate-provider.ts · clock.ts
  adapters/
    persistence/   redis-room-repository · in-memory-room-repository(테스트용)
    candidate/     mock-candidate-provider + mock-data/{gangnam,fallback}.ts
    clock/         system-clock
  lib/             redis.ts · env.ts · container.ts(조립 루트)
  components/      candidate-card · timer-badge · participant-count · result-celebration ...
  hooks/           use-room-poll(1초 폴링+낙관적) · use-identity(localStorage)
```

```ts
interface RoomRepository {
  create(room: Room): Promise<void>;
  get(id: string): Promise<Room | null>;
  update(id: string, mutate: (r: Room) => Room): Promise<Room>;  // RMW
}
interface CandidateProvider { generate(c: Conditions): Promise<Candidate[]>; }
interface Clock { now(): number; }   // 시간 주입 → deadline·테스트 결정적
```

- **DI:** `lib/container.ts`가 env 보고 어댑터→유스케이스 묶음. 라우트는 유스케이스만 사용.
- **요청 흐름:** `POST /votes` → route(파싱) → `castVote` → `roomRepository.update(RMW)` → 끝.
- **미래 분리:** core·테스트 그대로, `redis-room-repository`만 `http-room-repository`(Spring 호출)로 교체.

---

## ⑧ 기술적 결정사항 점검 (한 장 요약)

| # | 결정 | 트레이드오프 | 재검토 트리거 |
|---|---|---|---|
| 동시성 | RMW 단순 유지(C) | 드물게 표 유실 가능 | 라이브에서 표 샘 → 투표 원자키(A)로 |
| 저장소 | Upstash Redis(인메모리) | 외부 서비스 1개(무료·무카드) | 카드 요구로 약관 바뀜 → 로컬+터널 |
| 실시간 | 1초 폴링 | 최대 1초 지연 | 지연 거슬림 → SSE 업그레이드 |
| 후보 | mock 조건 풀(B) | 강남역 외엔 폴백 | 실제 식당 필요 → LLM/지도 P1 |
| 신원 | localStorage | 기기 바뀌면 새 사람 | — (데모 허용) |
| UI | Tailwind+shadcn, 웜 톤 | 셋업 5분 | — |
| 공유 | URL 복사만 | 카톡 원클릭 X | 카톡 필요 → Kakao SDK(P1) |
| 타이머 | 방장 시작·0초 자동공개(A) | 진행자 손 필요 | — |
| 방장 | 투표자(A) | — | — |
| 카드 | 담백 옵션1, 숫자만 | 누가 눌렀는지 안 보임 | — |

---

> 다음: 이 설계로 구현 계획(plan) 작성 → 스캐폴딩 → ④의 화면을 실제 브라우저로 검증(`../initial design/completion-criteria.md`).
