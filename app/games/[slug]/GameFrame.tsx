"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import type { Game } from "@/lib/games";
import GameIcon from "../../GameIcon";

export default function GameFrame({ game }: { game: Game }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  // 키보드로 조작하는 게임이 바로 입력을 받도록 iframe에 포커스
  const focusGame = () => frameRef.current?.contentWindow?.focus();

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else wrapRef.current?.requestFullscreen().then(focusGame).catch(() => {});
  };

  return (
    <main className="player">
      <nav className="bar">
        <Link href="/" className="back">
          <Image src="/images/logo.png" alt="" width={22} height={22} className="back-logo" />
          목록
        </Link>
        <h1>
          <GameIcon game={game} size={24} className="bar-icon" /> {game.title}
        </h1>
        <button type="button" onClick={toggleFullscreen} className="fs">
          ⛶ 전체화면
        </button>
      </nav>
      <div ref={wrapRef} className="stage">
        <iframe
          ref={frameRef}
          src={`/play/${game.slug}/index.html`}
          title={game.title}
          onLoad={focusGame}
          allow="fullscreen; autoplay; gamepad"
        />
      </div>
    </main>
  );
}
