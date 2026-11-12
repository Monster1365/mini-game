import type { Metadata, Viewport } from "next";
import "./globals.css";

const description = "브라우저에서 바로 즐기는 미니게임 모음";

export const metadata: Metadata = {
  title: { default: "미니게임 아케이드", template: "%s · 미니게임 아케이드" },
  description,
  icons: {
    icon: "/images/favicon.ico",
    apple: "/images/apple-touch-icon.png",
  },
  openGraph: {
    title: "미니게임 아케이드",
    description,
    images: [{ url: "/images/og.png", width: 1200, height: 630 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#07071d",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
