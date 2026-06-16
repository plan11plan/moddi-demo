// API 전체 플로우 e2e (dev 서버 + 실 Redis). 실행: node scripts/api-e2e.mjs
const base = process.env.BASE ?? "http://localhost:3000";
const j = async (r) => {
  const t = await r.text();
  try {
    return JSON.parse(t);
  } catch {
    return { _raw: t, _status: r.status };
  }
};
const post = (p, body) =>
  fetch(base + p, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body ?? {}),
  }).then(j);
const get = (p) => fetch(base + p).then(j);

const ok = [];
const bad = [];
const check = (label, cond, extra = "") =>
  (cond ? ok : bad).push(`${cond ? "OK " : "FAIL"} ${label} ${extra}`);

const create = await post("/api/rooms", {
  title: "점심 모임",
  location: "강남역",
  headcount: 4,
  budget: "1만원대",
  timerMinutes: 1,
});
const { roomId, hostToken } = create;
check("create returns roomId+hostToken", !!roomId && !!hostToken);

let view = await get(`/api/rooms/${roomId}`);
check("waiting w/ 5 candidates", view.status === "waiting" && view.candidates.length === 5, `(${view.candidates.length})`);
check("hostToken NOT leaked in view", !("hostToken" in view));

const p1 = (await post(`/api/rooms/${roomId}/join`, { nickname: "진수" })).participantId;
const p2 = (await post(`/api/rooms/${roomId}/join`, { nickname: "병필" })).participantId;
check("two participants joined", !!p1 && !!p2 && p1 !== p2);

await post(`/api/rooms/${roomId}/start`, { hostToken });
view = await get(`/api/rooms/${roomId}`);
check("voting after start, timer running", view.status === "voting" && view.remainingMs > 0 && view.remainingMs <= 60000, `(rem=${view.remainingMs})`);

const target = view.candidates[0].id;
await post(`/api/rooms/${roomId}/votes`, { participantId: p1, candidateId: target, value: "like" });
await post(`/api/rooms/${roomId}/votes`, { participantId: p2, candidateId: target, value: "like" });
view = await get(`/api/rooms/${roomId}`);
const tl = view.tallies.find((x) => x.candidateId === target);
check("votes aggregated (2 likes)", tl.likes === 2 && tl.score === 2, `(likes=${tl.likes})`);

const add = await post(`/api/rooms/${roomId}/candidates`, { name: "동네 분식", description: "떡볶이" });
view = await get(`/api/rooms/${roomId}`);
check("added candidate appears", !!add.candidateId && view.candidates.some((c) => c.name === "동네 분식"));

const blocked = await post(`/api/rooms/${roomId}/start`, { hostToken: "nope" });
check("non-host start → 403/forbidden", blocked.code === "forbidden", `(${blocked.code})`);

await post(`/api/rooms/${roomId}/close`, { hostToken });
view = await get(`/api/rooms/${roomId}`);
check("decided with winner=target", view.status === "decided" && view.decidedCandidateId === target);

const missing = await get(`/api/rooms/zzzzzz`);
check("missing room → not_found", missing.code === "not_found", `(${missing.code})`);

console.log(ok.join("\n"));
if (bad.length) {
  console.log("\n" + bad.join("\n"));
  process.exit(1);
}
console.log(`\nALL ${ok.length} CHECKS PASSED`);
