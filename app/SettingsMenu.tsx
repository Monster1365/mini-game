"use client";

import { useEffect, useRef, useState } from "react";

type Theme = "system" | "light" | "dark";

const STORAGE_KEY = "theme";

const OPTIONS: { value: Theme; label: string; icon: React.ReactNode }[] = [
  {
    value: "system",
    label: "시스템",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="3" y="4" width="18" height="12" rx="2" />
        <path d="M8 20h8M12 16v4" />
      </svg>
    ),
  },
  {
    value: "light",
    label: "라이트",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    ),
  },
  {
    value: "dark",
    label: "다크",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    ),
  },
];

function readTheme(): Theme {
  try {
    const t = localStorage.getItem(STORAGE_KEY);
    if (t === "light" || t === "dark") return t;
  } catch {}
  return "system";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  try {
    if (theme === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, theme);
  } catch {}
  if (theme === "system") delete root.dataset.theme;
  else root.dataset.theme = theme;
}

type DataStatus = "idle" | "clearing" | "confirmReset" | "resetDone";

export default function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("system");
  const [data, setData] = useState<DataStatus>("idle");
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 저장된 테마는 브라우저에서만 읽을 수 있으므로 마운트 후 동기화
  useEffect(() => setTheme(readTheme()), []);

  // 바깥 클릭·Esc로 닫기
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (t: Theme) => {
    setTheme(t);
    applyTheme(t);
  };

  // 캐시 삭제: 서버가 Clear-Site-Data 헤더로 브라우저 HTTP 캐시를 지우게 한 뒤 새로 불러온다 (기록은 유지)
  const clearCache = async () => {
    setData("clearing");
    try {
      await fetch("/api/clear-cache", { method: "POST", cache: "no-store" });
    } catch {}
    window.location.reload();
  };

  // 기록·설정 초기화: 이 사이트의 localStorage를 모두 지운다 (게임들도 같은 저장소를 쓴다). 두 번 눌러 확인
  const resetData = () => {
    if (data !== "confirmReset") {
      setData("confirmReset");
      return;
    }
    try {
      localStorage.clear();
    } catch {}
    applyTheme("system");
    setTheme("system");
    setData("resetDone");
  };

  // 패널을 닫으면 확인 상태를 되돌린다
  useEffect(() => {
    if (!open && data !== "clearing") setData("idle");
  }, [open, data]);

  return (
    <div className="settings" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="settings-btn"
        aria-label="설정"
        aria-expanded={open}
        aria-controls="settings-panel"
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {open && (
        <div id="settings-panel" className="settings-panel" role="dialog" aria-label="사이트 설정">
          <h2>설정</h2>
          <span className="setting-label" id="theme-label">
            테마
          </span>
          <div className="seg" role="radiogroup" aria-labelledby="theme-label">
            {OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={theme === o.value}
                onClick={() => choose(o.value)}
              >
                {o.icon}
                {o.label}
              </button>
            ))}
          </div>

          <div className="setting-group">
            <span className="setting-label">데이터</span>
            <button type="button" className="data-btn" onClick={clearCache} disabled={data === "clearing"}>
              {data === "clearing" ? "캐시를 지우는 중…" : "캐시 삭제"}
              <small>게임·이미지를 새로 불러와요. 기록은 그대로예요.</small>
            </button>
            <button
              type="button"
              className={`data-btn danger${data === "confirmReset" ? " confirm" : ""}`}
              onClick={resetData}
              disabled={data === "clearing"}
            >
              {data === "confirmReset" ? "정말 지울까요? 한 번 더 누르면 삭제" : data === "resetDone" ? "초기화했어요 ✓" : "기록·설정 초기화"}
              <small>최고 기록, 진행 중인 게임, 테마와 게임 설정을 모두 지워요.</small>
            </button>
            {data === "confirmReset" && (
              <button type="button" className="data-cancel" onClick={() => setData("idle")}>
                취소
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
