export type MockPlace = {
  name: string;
  description: string;
  tags: string[];
  priceBand: "under10" | "around10" | "around20";
};

export const GANGNAM_POOL: MockPlace[] = [
  // ── 한식 / under10 ──────────────────────────────────────────────
  {
    name: "강남교자",
    description: "칼국수와 만두가 메인. 점심 단품 7,500원~, 든든한 국물 한 그릇.",
    tags: ["한식", "1만원이하", "안가본집"],
    priceBand: "under10",
  },
  {
    name: "역삼 백반",
    description: "매일 바뀌는 집밥 백반. 9,000원 단일가, 국·반찬 5종 포함.",
    tags: ["한식", "1만원이하"],
    priceBand: "under10",
  },
  {
    name: "선릉 순두부",
    description: "얼큰 순두부찌개 + 공기밥. 8,500원~, 테이블 회전 빠름.",
    tags: ["한식", "1만원이하"],
    priceBand: "under10",
  },
  {
    name: "테헤란 김밥천국",
    description: "김밥·라면·볶음밥 전문. 6,000원~9,000원, 빠른 점심 해결.",
    tags: ["분식", "1만원이하", "안가본집"],
    priceBand: "under10",
  },
  {
    name: "강남역 곱창전골",
    description: "혼밥 가능한 1인 곱창전골. 9,500원 내외, 점심 한정.",
    tags: ["한식", "1만원이하"],
    priceBand: "under10",
  },

  // ── 일식 / under10 ──────────────────────────────────────────────
  {
    name: "테헤란 라멘",
    description: "진한 돈코츠 베이스 라멘. 9,000원~, 점심 세트 +추가 교자 2개.",
    tags: ["일식", "1만원이하", "안가본집"],
    priceBand: "under10",
  },

  // ── 한식 / around10 ─────────────────────────────────────────────
  {
    name: "강남 참치회",
    description: "참치 덮밥·비빔밥 전문. 12,000원~14,000원, 신선도 우선.",
    tags: ["한식", "1만원대"],
    priceBand: "around10",
  },
  {
    name: "역삼 삼겹 한판",
    description: "점심 삼겹살 1인 세트 13,000원. 쌈 채소·된장국 포함.",
    tags: ["한식", "1만원대"],
    priceBand: "around10",
  },
  {
    name: "선릉 돌솥비빔밥",
    description: "돌솥 3종(나물·불고기·해물) 운영. 12,000원~, 누룽지 무료.",
    tags: ["한식", "1만원대"],
    priceBand: "around10",
  },
  {
    name: "강남 감자탕 집",
    description: "점심 소뼈 감자탕 1인분 11,000원. 깊은 국물, 사이드 깍두기.",
    tags: ["한식", "1만원대", "안가본집"],
    priceBand: "around10",
  },

  // ── 일식 / around10 ─────────────────────────────────────────────
  {
    name: "역삼 돈카츠",
    description: "수제 등심 돈카츠 + 된장국. 13,000원 내외, 줄 서도 먹을 맛.",
    tags: ["일식", "1만원대"],
    priceBand: "around10",
  },
  {
    name: "테헤란 우동집",
    description: "사누키 스타일 쫄깃 우동. 11,000원~, 튀김 단품 추가 가능.",
    tags: ["일식", "1만원대"],
    priceBand: "around10",
  },
  {
    name: "강남 스시 런치",
    description: "런치 스시 9피스 세트 14,000원. 미소국·샐러드 포함.",
    tags: ["일식", "1만원대", "안가본집"],
    priceBand: "around10",
  },

  // ── 중식 / around10 ─────────────────────────────────────────────
  {
    name: "선릉 마라탕",
    description: "직접 고른 재료에 마라 소스. 100g당 650원, 보통 12,000원 내외.",
    tags: ["중식", "1만원대"],
    priceBand: "around10",
  },
  {
    name: "강남역 짬뽕 집",
    description: "해물 짬뽕 + 공기밥. 11,000원, 국물 진하고 얼큰함.",
    tags: ["중식", "1만원대"],
    priceBand: "around10",
  },

  // ── 아시안 / around10 ───────────────────────────────────────────
  {
    name: "테헤란 쌀국수",
    description: "하노이 스타일 퍼보 + 숙주. 11,000원~, 고수 선택 가능.",
    tags: ["아시안", "1만원대"],
    priceBand: "around10",
  },
  {
    name: "역삼 팟타이",
    description: "새우·두부 팟타이 단품. 13,000원, 그린카레 런치 세트도 운영.",
    tags: ["아시안", "1만원대", "안가본집"],
    priceBand: "around10",
  },

  // ── 양식 / around10 ─────────────────────────────────────────────
  {
    name: "강남 파스타 공방",
    description: "수제 생면 파스타 런치. 13,000원~15,000원, 빵 무제한.",
    tags: ["양식", "1만원대"],
    priceBand: "around10",
  },

  // ── 한식 / around20 ─────────────────────────────────────────────
  {
    name: "선릉 한우 런치",
    description: "한우 차돌 된장찌개 + 구이 세트. 22,000원 내외, 품질 최우선.",
    tags: ["한식", "2만원대"],
    priceBand: "around20",
  },
  {
    name: "강남 솥밥 정식",
    description: "계절 솥밥 + 한정식 반찬 8종. 20,000원~, 예약 권장.",
    tags: ["한식", "2만원대", "안가본집"],
    priceBand: "around20",
  },

  // ── 양식 / around20 ─────────────────────────────────────────────
  {
    name: "테헤란 비스트로",
    description: "스테이크 런치 세트 21,000원. 수프·사이드·음료 포함.",
    tags: ["양식", "2만원대"],
    priceBand: "around20",
  },
  {
    name: "역삼 버거바",
    description: "수제 패티 프리미엄 버거 세트. 19,000원~, 감자튀김·음료 포함.",
    tags: ["양식", "2만원대"],
    priceBand: "around20",
  },

  // ── 일식 / around20 ─────────────────────────────────────────────
  {
    name: "강남 오마카세 런치",
    description: "9코스 미니 오마카세 런치. 25,000원~, 예약 필수, 특별한 날.",
    tags: ["일식", "2만원대", "안가본집"],
    priceBand: "around20",
  },
];
