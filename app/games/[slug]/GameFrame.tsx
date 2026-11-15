"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Game } from "@/lib/games";

export default function GameFrame({ game, info }: { game: Game; info: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const infoRef = useRef<HTMLDialogElement>(null);

  const openInfo = () => infoRef.current?.showModal();
  const closeInfo = () => infoRef.current?.close();

  // 팝업이 닫히면(✕·Esc·바깥 클릭 모두) 게임으로 포커스를 돌려준다.
  // 브라우저가 닫힌 직후 '게임 소개' 버튼으로 포커스를 되돌리므로 그다음 틱에 옮긴다.
  useEffect(() => {
    const dlg = infoRef.current;
    if (!dlg) return;
    const onClose = () =>
      setTimeout(() => {
        frameRef.current?.focus();
        frameRef.current?.contentWindow?.focus();
      }, 0);
    dlg.addEventListener("close", onClose);
    return () => dlg.removeEventListener("close", onClose);
  }, []);

  // 키보드로 조작하는 게임이 바로 입력을 받도록 iframe에 포커스
  const focusGame = () => frameRef.current?.contentWindow?.focus();

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else wrapRef.current?.requestFullscreen().then(focusGame).catch(() => {});
  };

  return (
    <main className="player">
      <nav className="bar">
        <Link href="/" className="back" prefetch={false}>
          <Image src="/images/logo-64.png" alt="" width={22} height={22} className="back-logo" unoptimized />
          목록
        </Link>
        <h1>
          {game.title}
        </h1>
        <div className="bar-actions">
          <button type="button" onClick={openInfo} className="info-btn" aria-haspopup="dialog">
            ⓘ 게임 소개
          </button>
          <button type="button" onClick={toggleFullscreen} className="fs">
            ⛶ 전체화면
          </button>
        </div>
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
      {/* 게임 소개 팝업: ✕ 버튼, Esc, 바깥 클릭으로 닫힘. 닫으면 게임으로 포커스를 돌려준다 */}
      <dialog
        ref={infoRef}
        className="info-dialog"
        aria-labelledby="info-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeInfo();
        }}
      >
        <div className="info-inner">
          <header className="info-head">
            <h2 id="info-title">{game.title} 게임 소개</h2>
            <button type="button" className="info-close" onClick={closeInfo} aria-label="닫기">
              ✕
            </button>
          </header>
          <div className="info-body">{info}</div>
        </div>
      </dialog>
    </main>
  );
}
