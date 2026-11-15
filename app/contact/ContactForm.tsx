"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CONTACT_CATEGORIES, LIMITS, isEmail } from "@/lib/contact";

type Status = { kind: "idle" | "sending" | "done" } | { kind: "error"; message: string };

export default function ContactForm({ enabled }: { enabled: boolean }) {
  const openedAt = useRef(0);
  const [category, setCategory] = useState<string>(CONTACT_CATEGORIES[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [agree, setAgree] = useState(false);
  const [website, setWebsite] = useState(""); // 봇 함정 (사람에게는 안 보임)
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    openedAt.current = performance.now();
  }, []);

  const emailBad = email.trim() !== "" && !isEmail(email.trim());
  const tooShort = message.trim().length < LIMITS.messageMin;
  const needAgree = email.trim() !== "" && !agree;
  const canSend = enabled && status.kind !== "sending" && !tooShort && !emailBad && !needAgree;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          name,
          email: email.trim(),
          message,
          agree,
          website,
          elapsed: Math.round(performance.now() - openedAt.current),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "문의를 보내지 못했어요. 잠시 후 다시 시도해 주세요.");
      setStatus({ kind: "done" });
      setMessage("");
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "문의를 보내지 못했어요." });
    }
  }

  if (status.kind === "done") {
    return (
      <div className="contact-done" role="status">
        <p className="contact-done-title">문의가 전달됐어요. 고마워요! 🙌</p>
        <p>{email.trim() ? `답장은 ${email.trim()} 으로 보내 드릴게요.` : "답장 받을 이메일을 적지 않아서 따로 답장은 드리지 못해요."}</p>
        <button type="button" className="btn-secondary" onClick={() => setStatus({ kind: "idle" })}>
          다른 문의 쓰기
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={submit} noValidate>
      {!enabled && <p className="form-note warn">문의 기능을 준비하고 있어요. 잠시 후 다시 확인해 주세요.</p>}

      <label className="field">
        <span>문의 유형</span>
        <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={!enabled}>
          {CONTACT_CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>

      <div className="field-row">
        <label className="field">
          <span>이름 <small>(선택)</small></span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={LIMITS.name} autoComplete="nickname" disabled={!enabled} />
        </label>
        <label className="field">
          <span>답장 받을 이메일 <small>(선택)</small></span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={LIMITS.email}
            autoComplete="email"
            aria-invalid={emailBad}
            disabled={!enabled}
          />
          {emailBad && <small className="field-error">이메일 주소 형식을 확인해 주세요.</small>}
        </label>
      </div>

      <label className="field">
        <span>내용</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={LIMITS.messageMax}
          rows={8}
          placeholder="버그라면 어떤 게임에서, 어떤 순서로 했을 때 생겼는지, 사용한 기기와 브라우저를 함께 알려 주세요."
          disabled={!enabled}
        />
        <small className="field-count">
          {message.length} / {LIMITS.messageMax}
          {message.length > 0 && tooShort && ` · ${LIMITS.messageMin}자 이상 써 주세요`}
        </small>
      </label>

      {/* 봇 함정: 화면과 스크린리더에서 숨김. 사람은 채우지 않는다 */}
      <div className="hp" aria-hidden="true">
        <label>
          웹사이트
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>

      {email.trim() !== "" && (
        <label className="agree">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} disabled={!enabled} />
          <span>
            <b>(필수) 개인정보 수집·이용 동의</b> — 답장을 위해 이메일 주소와 이름을 수집하며, 답변을 마친 뒤 1년 동안 보관 후
            삭제해요. 동의하지 않으면 이메일 칸을 비우고 보내 주세요. 자세한 내용은{" "}
            <Link href="/privacy" prefetch={false}>개인정보 처리방침</Link>을 확인해 주세요.
          </span>
        </label>
      )}

      {status.kind === "error" && (
        <p className="form-note error" role="alert">
          {status.message}
        </p>
      )}

      <button type="submit" className="btn-primary" disabled={!canSend}>
        {status.kind === "sending" ? "보내는 중…" : "문의 보내기"}
      </button>
    </form>
  );
}
