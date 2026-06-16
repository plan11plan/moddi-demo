# 2. 구현 디테일 (어떻게 만들 것인가)

> 4단계 프레임 ②. 어떤 기술을 써서, 어떤 구조로 구현할지.
>
> ⚠️ **이 문서는 초기 설계 스냅샷이다.** 이후 세부 설계에서 타이머·방장=투표자·대기 상태·API 7개·디자인 토큰 등이 추가/갱신됐다. **최신 확정본은 `../detailed design/detailed-design.md` (②⑤⑥⑦) 참조.**

---

## 2.1 기술 스택

| 레이어 | 선택 | 비고 |
|---|---|---|
| 프레임워크 | **Next.js (App Router)** + TypeScript | UI + API(Route Handlers)를 한 프로젝트에 |
| 배포 | **Vercel** | 회의용 데모 즉시 배포 |
| 저장소 | **Upstash Redis** (관리형 인메모리 DB) | 무료 티어, 카드 X. 서버리스 인스턴스 간 상태 공유용 |
| 실시간 | **1초 폴링** (`GET` 반복) | 서버리스 친화적. WebSocket/SSE 불필요 |
| 후보 생성 | **Mock provider** | LLM 호출 0, 캔드 데이터에서 선택 |
| 스타일 | (구현 시 결정 — Tailwind 등 가벼운 것 권장) | 모바일 우선 반응형 |
| 테스트 | Vitest(단위·통합) + Playwright(E2E) | [completion-criteria.md](completion-criteria.md) |

> 왜 폴링인가 / 왜 Redis인가는 [decisions.md](decisions.md)의 ADR-003·004 참고.

---

## 2.2 코어 원칙 — 헥사고날 (포트 & 어댑터)

> **목표: 비즈니스 로직(core)이 Next.js·Redis를 모르게 한다.** 그래야 나중에 core를 그대로 별도 서버(예: Spring Boot)로 들어내고, 프론트는 호출만 HTTP/WS로 바꾸면 된다.

```
src/
  app/                      # Next.js 라우트(얇은 컨트롤러) + UI 페이지/컴포넌트
    api/                    #   Route Handlers — HTTP 파싱 → 유스케이스 호출만
    room/[id]/              #   방 화면 (투표 UI, 폴링)
    page.tsx                #   방 생성 화면
  core/                     # ⭐ 프레임워크/인프라 의존 0. 순수 TypeScript
    domain/                 #   엔티티 + 규칙 (Room, Candidate, Vote, 집계)
    application/            #   유스케이스 (방생성/입장/투표/집계/확정/후보추가)
    ports/                  #   인터페이스만 (RoomRepository, CandidateProvider, Clock)
  adapters/                 # 포트의 구현체 (갈아끼우는 부분)
    persistence/
      redis-room-repository.ts      # 배포용 (Upstash)
      in-memory-room-repository.ts   # 로컬 개발·테스트용
    candidate/
      mock-candidate-provider.ts     # 현재
      # llm-candidate-provider.ts    # (미래) 같은 포트로 교체
  lib/                      # redis 클라이언트, env, 공용 유틸
```

**의존 방향:** `app → application → ports ← adapters`. core는 바깥(어댑터·프레임워크)을 향해 의존하지 않는다.

> **인메모리 저장소가 두 벌인 이유:** `InMemoryRoomRepository`는 단위/통합 테스트와 로컬 단일 프로세스 개발에 쓰고, 배포(서버리스)에선 `RedisRoomRepository`를 env로 갈아끼운다. 둘 다 같은 `RoomRepository` 포트를 구현하므로 core 코드는 그대로다.

---

## 2.3 도메인 모델

```ts
// core/domain
type RoomStatus = 'voting' | 'decided';
type VoteValue  = 'like' | 'dislike';

interface Room {
  id: string;                 // 짧은 공유 ID (링크용)
  title: string;              // 주제, 예: "오늘 점심"
  conditions: {
    location: string;         // 예: "강남역"
    headcount: number;        // 예: 4
    budget: string;           // 예: "1만원대"
  };
  hostToken: string;          // 방장 식별(확정 권한). 링크엔 노출 X
  status: RoomStatus;
  candidates: Candidate[];
  participants: Participant[];
  votes: Vote[];              // 데모 규모라 배열로 충분
  decidedCandidateId?: string;
  createdAt: number;
}

interface Candidate {
  id: string;
  name: string;               // 예: "강남 손칼국수"
  description: string;        // 예: "칼칼한 국물, 1인 9,000원대"
  tags: string[];             // 예: ["한식", "안 가본 집"]
  addedBy: 'ai' | 'user';     // mock 생성 vs 참여자 추가
}

interface Participant {
  id: string;
  nickname: string;
  joinedAt: number;
}

interface Vote {
  participantId: string;
  candidateId: string;
  value: VoteValue;           // 같은 (참여자,후보) 쌍은 upsert (중복 방지)
}
```

### 집계 규칙 (core/domain — 순수 함수, 테스트 1순위)

- 후보별 점수 = `좋아요 수 − 싫어요 수` (싫어요 = 소프트 거부 "이건 빼줘").
- 랭킹 = 점수 내림차순. **동점 처리는 P0에선 방장이 직접 확정**(AI 타이브레이크는 범위 밖).
- 한 참여자는 한 후보에 한 표만(좋아요↔싫어요 토글/변경 가능, 중복 누적 금지).

---

## 2.4 API (Next.js Route Handlers = 얇은 컨트롤러)

각 핸들러는 **HTTP 파싱 → 유스케이스 호출 → 직렬화**만 한다. 로직은 `core/application`에.

| 메서드·경로 | 유스케이스 | 설명 |
|---|---|---|
| `POST /api/rooms` | CreateRoom | 조건 입력 → mock 후보 5개 생성 → `{ roomId, hostToken }` 반환 |
| `GET  /api/rooms/:id` | GetRoomState | 방 전체 상태(후보+집계+참여자) — **폴링 대상** |
| `POST /api/rooms/:id/join` | JoinRoom | `{ nickname }` → `{ participantId }` (가입 없음) |
| `POST /api/rooms/:id/votes` | CastVote | `{ participantId, candidateId, value }` (upsert) |
| `POST /api/rooms/:id/candidates` | AddCandidate | 참여자가 후보 직접 추가 (스토리 #5) |
| `POST /api/rooms/:id/decide` | DecideRoom | 방장(hostToken)만 결과 확정 |

> `GET /api/rooms/:id`는 매 1초 클라이언트가 폴링한다. 응답엔 후보별 좋아요/싫어요 합산이 포함돼 클라이언트가 바로 그린다.

---

## 2.5 데이터 흐름

### 방 생성 → 후보 (아하 ①)
```
방장: 조건 입력 → POST /api/rooms
  → CreateRoom 유스케이스
      → MockCandidateProvider.generate(conditions)  // ~1.5s 인위적 지연으로 "생성 중" 연출
      → RoomRepository.save(room)
  → { roomId, hostToken } 반환 → /room/:id 로 이동, 후보 5개 카드 렌더
```

### 링크 입장 → 실시간 투표 (아하 ②)
```
참여자: 링크 /room/:id 열기 → 닉네임 입력 → POST /join → participantId 보관(localStorage)
화면: 매 1초 GET /api/rooms/:id 폴링 → 후보·집계 갱신(부드러운 카운트업)
투표: 좋아요/싫어요 → POST /votes (upsert)
  → 다음 폴링 주기에 모든 기기 화면에 반영(1~2초 내)
```

### 확정
```
방장: "이걸로 정하자" → POST /decide (hostToken 검증)
  → room.status = 'decided', decidedCandidateId 설정
  → 폴링 통해 전원 화면에 결과 카드 표시
```

---

## 2.6 동시성 / 데이터 저장 (Redis)

- 방 하나를 **키 `room:{id}`에 JSON 한 덩어리**로 저장(데모 규모라 단순). 투표는 read-modify-write + 소규모 재시도.
- 중복 투표 방지는 도메인에서 (참여자,후보) 키로 upsert 처리.
- TTL을 걸어(예: 24h) 데모 후 자동 정리.

> 데모 트래픽(한 방, 수~십수 명)에선 단일 키 JSON으로 충분. 대규모·정합성은 본 프로젝트(서버 분리 단계)에서 Redis 자료구조/락 또는 RDB로 격상.

---

## 2.7 미래 서버 분리 경로 (왜 이 구조인가)

지금: `app/api/*` → `core` → `InMemory/Redis 어댑터` (한 프로세스, Vercel)

나중: `core`를 **Spring Boot(또는 별도 Node 서버)** 로 이식 →
- 프론트의 어댑터를 `HttpRoomRepository`(REST 호출) 또는 WebSocket 클라이언트로 교체.
- core 도메인·유스케이스·테스트는 **그대로 재사용**.

→ 이게 "메모리 DB로 시작하되 서버 분리가 자연스럽게"의 실현 방식.
