import type { CandidateProvider } from "@/core/ports/index";
import type { Candidate, Conditions } from "@/core/domain/types";
import { newCandidateId } from "@/core/domain/ids";
import { GANGNAM_POOL } from "./mock-data/gangnam";
import type { MockPlace } from "./mock-data/gangnam";
import { FALLBACK_POOL } from "./mock-data/fallback";

const TARGET_COUNT = 5;
const UNVISITED_TAG = "안가본집";

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function budgetToPriceBand(
  budget: string,
): "under10" | "around10" | "around20" | null {
  if (budget.includes("이하")) return "under10";
  if (budget.includes("2만")) return "around20";
  if (budget.includes("1만")) return "around10";
  return null;
}

function toCandidate(place: MockPlace): Candidate {
  return {
    id: newCandidateId(),
    name: place.name,
    description: place.description,
    tags: place.tags,
    addedBy: "ai",
  };
}

export class MockCandidateProvider implements CandidateProvider {
  generate(conditions: Conditions): Promise<Candidate[]> {
    const basePool = conditions.location.includes("강남")
      ? GANGNAM_POOL
      : FALLBACK_POOL;

    const band = budgetToPriceBand(conditions.budget);

    let chosen: MockPlace[];

    if (band !== null) {
      const preferred = basePool.filter((p) => p.priceBand === band);
      const others = basePool.filter((p) => p.priceBand !== band);

      if (preferred.length >= TARGET_COUNT) {
        chosen = shuffle(preferred).slice(0, TARGET_COUNT);
      } else {
        // Top up: preferred first, then others, then fallback if needed
        const shuffledPreferred = shuffle(preferred);
        const shuffledOthers = shuffle(others);
        const combined = [...shuffledPreferred, ...shuffledOthers];

        if (combined.length >= TARGET_COUNT) {
          chosen = combined.slice(0, TARGET_COUNT);
        } else {
          // Also pull from fallback pool (for non-gangnam cases this may overlap)
          const fallbackOthers = FALLBACK_POOL.filter(
            (p) => !combined.some((c) => c.name === p.name),
          );
          chosen = [...combined, ...shuffle(fallbackOthers)].slice(
            0,
            TARGET_COUNT,
          );
        }
      }
    } else {
      chosen = shuffle(basePool).slice(0, TARGET_COUNT);
    }

    // Ensure at least one "안가본집" tag — clone, never mutate source
    const hasUnvisited = chosen.some((p) => p.tags.includes(UNVISITED_TAG));
    if (!hasUnvisited && chosen.length > 0) {
      const cloneIdx = 0;
      chosen = chosen.map((p, i) =>
        i === cloneIdx
          ? { ...p, tags: [...p.tags, UNVISITED_TAG] }
          : p,
      );
    }

    const candidates = chosen.map(toCandidate);
    return Promise.resolve(candidates);
  }
}
