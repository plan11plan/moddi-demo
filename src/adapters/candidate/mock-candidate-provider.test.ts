import { describe, it, expect } from "vitest";
import { MockCandidateProvider } from "./mock-candidate-provider";

const provider = new MockCandidateProvider();

describe("MockCandidateProvider", () => {
  it("강남역 + 1만원대: returns exactly 5 candidates", async () => {
    const candidates = await provider.generate({
      location: "강남역",
      headcount: 4,
      budget: "1만원대",
    });
    expect(candidates).toHaveLength(5);
  });

  it("강남역 + 1만원대: all candidates have addedBy === 'ai'", async () => {
    const candidates = await provider.generate({
      location: "강남역",
      headcount: 4,
      budget: "1만원대",
    });
    for (const c of candidates) {
      expect(c.addedBy).toBe("ai");
    }
  });

  it("강남역 + 1만원대: all ids are unique and non-empty", async () => {
    const candidates = await provider.generate({
      location: "강남역",
      headcount: 4,
      budget: "1만원대",
    });
    const ids = candidates.map((c) => c.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(candidates.length);
    for (const id of ids) {
      expect(id.length).toBeGreaterThan(0);
    }
  });

  it("강남역 + 1만원대: at least one candidate has tag '안가본집'", async () => {
    const candidates = await provider.generate({
      location: "강남역",
      headcount: 4,
      budget: "1만원대",
    });
    const hasUnvisited = candidates.some((c) => c.tags.includes("안가본집"));
    expect(hasUnvisited).toBe(true);
  });

  it("비강남 위치(제주): fallback path returns exactly 5 candidates", async () => {
    const candidates = await provider.generate({
      location: "제주",
      headcount: 3,
      budget: "1만원대",
    });
    expect(candidates).toHaveLength(5);
  });

  it("비강남 위치(제주): all candidates have addedBy === 'ai'", async () => {
    const candidates = await provider.generate({
      location: "제주",
      headcount: 3,
      budget: "1만원대",
    });
    for (const c of candidates) {
      expect(c.addedBy).toBe("ai");
    }
  });

  it("비강남 위치(제주): at least one candidate has tag '안가본집'", async () => {
    const candidates = await provider.generate({
      location: "제주",
      headcount: 3,
      budget: "1만원대",
    });
    const hasUnvisited = candidates.some((c) => c.tags.includes("안가본집"));
    expect(hasUnvisited).toBe(true);
  });
});
