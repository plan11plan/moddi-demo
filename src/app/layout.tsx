import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "모디 — 같이 정하자",
  description: "방 만들면 후보가 자동으로 뜨고, 링크로 들어와 실시간으로 같이 투표해 점심을 정한다.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2a2422",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <head>
        {/* Pretendard — 둥근 산세리프(디자인 토큰) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
