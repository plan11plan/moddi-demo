import Link from "next/link";

export default function Landing() {
  return (
    <main className="app-shell pb-16">
      {/* Hero */}
      <section className="flex flex-col items-center gap-5 px-6 pt-16 text-center">
        <span className="rounded-full bg-cream-soft px-3 py-1 text-xs font-semibold text-terracotta">
          다같이 정하는 점심
        </span>
        <h1 className="text-3xl font-extrabold leading-snug text-espresso">
          점심 정하다
          <br />
          시간 다 가던 그 고민,
          <br />
          <span className="text-terracotta">3분 컷.</span>
        </h1>
        <p className="text-sm text-muted">
          방 만들면 후보가 자동으로 뜨고,
          <br />
          링크로 들어와 다 같이 실시간 투표 🍜
        </p>
        <Link
          href="/create"
          className="mt-2 w-full rounded-full bg-terracotta px-6 py-4 text-center text-lg font-bold text-cream shadow-pop active:scale-[0.98]"
        >
          바로 시작하기
        </Link>
        <p className="text-xs text-muted">가입 없이 · 30초면 시작</p>
      </section>

      {/* 유저 고민 */}
      <section className="mt-16 px-6">
        <h2 className="text-center text-xl font-bold text-espresso">
          이런 적, 있죠? 😩
        </h2>
        <div className="mt-5 flex flex-col gap-3">
          {[
            { e: "🌀", t: "“아무거나” “다 좋아”의 무한 루프" },
            { e: "🙋", t: "늘 한 사람만 총대 메고 식당 검색" },
            { e: "⏳", t: "메뉴 정하다 점심시간이 다 감" },
          ].map((x) => (
            <div
              key={x.t}
              className="flex items-center gap-3 rounded-card border border-line bg-cream-soft p-4"
            >
              <span className="text-2xl">{x.e}</span>
              <span className="text-sm font-medium text-espresso">{x.t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 앱 동작 */}
      <section className="mt-16 px-6">
        <h2 className="text-center text-xl font-bold text-espresso">
          모디는 이렇게 돌아가요
        </h2>
        <div className="mt-5 flex flex-col gap-4">
          {[
            { n: 1, t: "방 만들기", d: "위치·인원·예산만 입력" },
            { n: 2, t: "후보 5개 자동", d: "AI가 ‘안 가본 집’까지 골라줌" },
            { n: 3, t: "링크로 다 같이 투표", d: "가입 없이 실시간으로 표가 차오름" },
            { n: 4, t: "타이머 끝 → 자동 결정", d: "1등이 짠 하고 발표" },
          ].map((s) => (
            <div key={s.n} className="flex items-start gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terracotta text-base font-bold text-cream">
                {s.n}
              </div>
              <div>
                <p className="font-bold text-espresso">{s.t}</p>
                <p className="text-sm text-muted">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 해결 */}
      <section className="mt-16 px-6">
        <div className="rounded-card bg-espresso p-6 text-center text-cream shadow-pop">
          <h2 className="text-xl font-bold">
            후보 찾기도, 교착도
            <br />
            이제 안 해도 돼요
          </h2>
          <p className="mt-3 text-sm text-cream/75">
            귀찮던 후보 검색은 AI가,
            <br />
            의견 합치기는 실시간 투표가 끝냅니다.
          </p>
        </div>
      </section>

      {/* 마무리 CTA */}
      <section className="mt-12 flex flex-col items-center gap-3 px-6 text-center">
        <p className="text-lg font-bold text-espresso">자, 오늘 점심부터 🍜</p>
        <Link
          href="/create"
          className="w-full rounded-full bg-terracotta px-6 py-4 text-lg font-bold text-cream shadow-pop active:scale-[0.98]"
        >
          바로 시작하기
        </Link>
      </section>

      <footer className="mt-16 px-6 text-center text-xs text-muted">
        모디(MODI) · 스위프 웹 14기 4조 데모
      </footer>
    </main>
  );
}
