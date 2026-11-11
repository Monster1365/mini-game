import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "미니게임 아케이드", template: "%s · 미니게임 아케이드" },
  description: "브라우저에서 바로 즐기는 미니게임 모음",
};

export const viewport: Viewport = {
  themeColor: "#0f1020",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
