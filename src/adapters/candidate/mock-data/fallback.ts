import type { MockPlace } from "./gangnam";

export const FALLBACK_POOL: MockPlace[] = [
  {
    name: "동네 김밥집",
    description: "충무김밥·참치김밥. 6,000원~8,000원, 어느 동네서나 익숙한 맛.",
    tags: ["분식", "1만원이하"],
    priceBand: "under10",
  },
  {
    name: "로컬 순두부",
    description: "얼큰 순두부찌개 + 공기밥. 9,000원, 집밥 느낌.",
    tags: ["한식", "1만원이하", "안가본집"],
    priceBand: "under10",
  },
  {
    name: "골목 돈카츠",
    description: "바삭한 수제 돈카츠 세트. 12,000원, 된장국·미니 샐러드 포함.",
    tags: ["일식", "1만원대"],
    priceBand: "around10",
  },
  {
    name: "차이나 볶음밥",
    description: "해산물·김치 볶음밥 2종. 11,000원~13,000원, 군만두 추가 가능.",
    tags: ["중식", "1만원대"],
    priceBand: "around10",
  },
  {
    name: "쌀국수 한 그릇",
    description: "퍼보 스타일 쌀국수. 10,000원~, 고수 선택, 브로스 진함.",
    tags: ["아시안", "1만원대", "안가본집"],
    priceBand: "around10",
  },
  {
    name: "파스타 런치",
    description: "알리오올리오·까르보나라 중 선택. 13,000원, 빵·수프 포함.",
    tags: ["양식", "1만원대"],
    priceBand: "around10",
  },
  {
    name: "한우 곰탕",
    description: "진한 사골 곰탕 + 수육 세트. 20,000원~, 특별한 점심.",
    tags: ["한식", "2만원대"],
    priceBand: "around20",
  },
  {
    name: "스테이크 런치",
    description: "안심 스테이크 런치 플레이트. 22,000원 내외, 샐러드·빵 포함.",
    tags: ["양식", "2만원대", "안가본집"],
    priceBand: "around20",
  },
];
