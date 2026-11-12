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
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#07071d" },
    { media: "(prefers-color-scheme: light)", color: "#f6f5ff" },
  ],
};

// 첫 화면을 그리기 전에 저장된 테마를 적용해 깜빡임을 막는다
const themeScript = `try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
