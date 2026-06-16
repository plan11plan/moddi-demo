# data-schema — 모디

## 저장 모델
- **Upstash Redis**, 키 하나에 방 전체를 JSON으로. `room:{id}`, **TTL 24h**(데모 후 자동 정리).
- 영속 DB 없음(데모라 불필요). 개발·테스트는 동일 인터페이스의 InMemory 어댑터.
- **동시성:** 단순 read-modify-write. 드문 동시 투표 유실은 데모 규모에서 허용(근거·대안은 `decisions.md`).

## 스키마 (`room:{id}`)
```jsonc
{
  id, title,
  conditions: { location: "강남역", headcount: 4, budget: "1만원대" },
  hostToken,                          // 방장 식별(start/close 권한). 공유 링크엔 노출 X
  status: "waiting" | "voting" | "decided",
  timerMinutes: 1,
  deadlineAt: 1718500000000 | null,   // voting 시작 시 now+timer로 설정. 폴링이 이걸로 lazy 마감
  candidates: [
    { id, name, description, tags: ["한식","안가본집"], addedBy: "ai" | "user" }
  ],
  participants: [ { id, nickname, joinedAt } ],
  votes: [
    { seq, participantId, candidateId, value: "like" | "dislike", at }
  ],
  decidedCandidateId: null,
  createdAt
}
```

## 규칙 (스키마에 박힌 의도)
- **집계는 저장하지 않는다.** 좋아요/싫어요 수·점수·1등은 매번 `votes`에서 계산 → 중복·정합성 꼬임 원천 차단.
  - 후보 점수 = `like 수 − dislike 수`. 1등 = 최대 점수, 동점이면 **그 점수에 먼저 도달**(votes의 `seq` 오름차순으로 재생).
- **한 명 한 후보 한 표:** `(participantId, candidateId)`로 upsert. 같은 값 재투표=취소, 반대=전환.
- **`seq`** = 방 단위 단조 증가 투표 순번(동점 타이브레이크 전용).
- **신원은 서버에 비밀이 없다:** `participantId`·`hostToken`은 클라이언트 **localStorage(방ID별)**에 보관 → 새로고침해도 같은 사람·표 유지. 무로그인 모델의 대가로 기기 바뀌면 새 사람.
