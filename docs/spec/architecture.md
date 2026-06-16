# 프로젝트 아키텍처 — 모디

## 스택
| 레이어 | 선택 |
|---|---|
| 앱 | Next.js (App Router) + TypeScript, Vercel 배포 |
| 저장소 | Upstash Redis (`@upstash/redis`, HTTP REST — 서버리스 커넥션 0) |
| 실시간 | **1초 폴링** + 낙관적 업데이트(내 표 즉시) + 카운트업(남의 표 부드럽게) |
| 후보 | mock provider (조건 반영 풀, 강남역 집중 + 폴백) |
| UI | Tailwind + shadcn/ui. 반응형 웹(모바일 우선, 앱처럼 보이는 웹페이지) |
| 테스트 | Vitest(단위·통합) + Playwright(E2E, 선택) |

**디자인 토큰(웜 톤):** 배경 에스프레소 `#2A2422` / 크림 `#F5EFE6`, 포인트 테라코타 `#E0673C`, 카드 `rounded-2xl`·버튼 pill·soft shadow, 둥근 산세리프(Pretendard). 마스코트는 데모용 이모지.

## 헥사고날 (핵심 원칙: core는 Next.js·Redis를 모른다)
> **왜:** 데모로 시작하되 나중에 core를 별도 서버(Spring 등)로 들어내기 위함. core가 인프라에 의존하지 않으면, 분리 시 어댑터만 교체하면 된다. (사용자가 백엔드 트랙이라 이 여지를 보존)

```
src/
  app/
    page.tsx · create/page.tsx · room/[id]/page.tsx
    api/rooms/route.ts · rooms/[id]/route.ts
        rooms/[id]/{join,start,votes,candidates,close}/route.ts   ← 얇은 컨트롤러
  core/                       ⭐ 순수 TS. next/* · @upstash/* import 금지
    domain/       room.ts(엔티티·상태전이) · tally.ts(집계·1등, 순수함수) · ids.ts
    application/  create-room · get-room-state(lazy 마감) · join-room ·
                  start-voting · cast-vote · add-candidate · close-room
    ports/        room-repository · candidate-provider · clock   (인터페이스)
  adapters/
    persistence/  redis-room-repository · in-memory-room-repository(테스트)
    candidate/    mock-candidate-provider + mock-data/{gangnam,fallback}.ts
    clock/        system-clock
  lib/      redis.ts · env.ts · container.ts(조립 루트)
  components/  candidate-card · timer-badge · participant-count · result-celebration ...
  hooks/    use-room-poll(1초 폴링+낙관적) · use-identity(localStorage)
```
의존 방향: `app → application → ports ← adapters`. core는 바깥을 import하지 않는다.

## 포트 계약
```ts
interface RoomRepository {
  create(room: Room): Promise<void>;
  get(id: string): Promise<Room | null>;
  update(id: string, mutate: (r: Room) => Room): Promise<Room>;  // RMW
}
interface CandidateProvider { generate(c: Conditions): Promise<Candidate[]>; }
interface Clock { now(): number; }   // 시간 주입 → deadline·테스트 결정적
```
- **DI:** `lib/container.ts`가 env 보고 어댑터→유스케이스를 묶는다. 라우트는 유스케이스만 사용.
- 시간(`Clock`)을 주입하므로 deadline·"1.5초 연출" 등을 테스트에서 고정 가능.

## API (시스템 인터페이스 — 전부 얇은 컨트롤러 → 유스케이스 호출)
| 메서드·경로 | 권한 | 요청 | 효과 |
|---|---|---|---|
| `POST /api/rooms` | - | `{title,location,headcount,budget,timerMinutes}` | 후보5(mock) 생성·`waiting` → `{roomId,hostToken}` |
| `GET /api/rooms/:id` | - | (폴링) | 상태+집계+`remainingMs`, 지났으면 lazy 확정 |
| `POST .../join` | - | `{nickname}` | `{participantId}` |
| `POST .../start` | 방장 | `{hostToken}` | `voting`, `deadlineAt` 설정 |
| `POST .../votes` | 참여자 | `{participantId,candidateId,value}` | upsert |
| `POST .../candidates` | 참여자 | `{participantId,name,description?}` | 후보 추가 |
| `POST .../close` | 방장 | `{hostToken}` | `decided` + 1등 계산 |

## 요청 흐름 (예: 투표)
`POST /votes` → route(파싱·권한) → `castVote` 유스케이스 → `roomRepository.update(RMW로 vote append)` → 끝. 화면은 다음 폴링(≤1s)에 반영.

## 미래 서버 분리
core·도메인·유스케이스·테스트는 그대로 두고, `redis-room-repository`를 `http-room-repository`(별도 서버 REST 호출)로 교체, 폴링을 WebSocket 클라이언트로 승격. → 데이터·로직 재작성 없음.
