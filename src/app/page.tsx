// P0 임시 랜딩 — 실제 랜딩은 P5에서. 디자인 토큰 동작 확인용.
export default function Home() {
  return (
    <main className="app-shell flex flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-3xl font-bold text-espresso">모디 🍜</h1>
      <p className="text-muted">같이 정하자 — 빌드 진행 중</p>
      <span className="rounded-full bg-terracotta px-5 py-2 font-semibold text-cream shadow-soft">
        디자인 토큰 OK
      </span>
    </main>
  );
}
