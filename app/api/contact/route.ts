// 문의 양식 → 운영자 이메일로 전달 (Resend HTTP API)
// 환경 변수 (서버에서만 읽음, 브라우저로 절대 보내지 않음)
//   RESEND_API_KEY  Resend API 키
//   CONTACT_EMAIL   받는 사람(운영자) 이메일
//   CONTACT_FROM    보내는 사람 (선택, 기본: Resend 테스트 발신 주소)
import { MAX_BODY_BYTES, MIN_FILL_MS, escapeHtml, singleLine, validateContact } from "@/lib/contact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RESEND_URL = process.env.RESEND_API_URL || "https://api.resend.com/emails";
const DEFAULT_FROM = "미니게임 아케이드 <onboarding@resend.dev>";

// IP별 횟수 제한 (서버리스 인스턴스마다 따로라 완벽하진 않지만 단순 반복 전송을 막는다)
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < WINDOW_MS)) hits.delete(k);
  return false;
}

const json = (status: number, body: object) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

// 같은 사이트에서 보낸 요청인지 (다른 사이트가 몰래 폼을 보내는 것 차단)
function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL?.trim();
  if (!apiKey || !to) return json(503, { error: "문의 기능을 준비하고 있어요. 잠시 후 다시 시도해 주세요." });

  if (!sameOrigin(req)) return json(403, { error: "허용되지 않은 요청이에요." });
  if (!(req.headers.get("content-type") || "").includes("application/json")) {
    return json(415, { error: "잘못된 요청이에요." });
  }

  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) return json(429, { error: "문의를 너무 자주 보냈어요. 10분 뒤에 다시 시도해 주세요." });

  // 크기 제한을 먼저 확인한 뒤 파싱
  const text = await req.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) return json(413, { error: "내용이 너무 길어요." });
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(text);
  } catch {
    return json(400, { error: "잘못된 요청이에요." });
  }

  // 봇 함정: 사람에게는 보이지 않는 칸이 채워졌거나, 페이지를 연 직후 바로 보낸 경우
  // 봇이 눈치채지 못하게 성공한 것처럼 응답하고 실제로는 보내지 않는다
  if (typeof raw.website === "string" && raw.website.trim() !== "") return json(200, { ok: true });
  if (typeof raw.elapsed !== "number" || raw.elapsed < MIN_FILL_MS) return json(200, { ok: true });

  const v = validateContact(raw);
  if (!v.ok) return json(400, { error: v.error });
  const { category, name, email, message } = v.value;

  const subject = singleLine(`[미니게임 아케이드] ${category}${name ? ` - ${name}` : ""}`, 120);
  const sentAt = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  const rows = [
    ["유형", category],
    ["이름", name || "(없음)"],
    ["답장 받을 이메일", email || "(없음 — 답장 불가)"],
    ["보낸 시각", sentAt],
  ];
  const html =
    `<h2 style="margin:0 0 12px">새 문의가 도착했어요</h2>` +
    `<table style="border-collapse:collapse;margin-bottom:16px">` +
    rows
      .map(([k, val]) => `<tr><td style="padding:4px 12px 4px 0;color:#666">${escapeHtml(k)}</td><td style="padding:4px 0"><b>${escapeHtml(val)}</b></td></tr>`)
      .join("") +
    `</table>` +
    `<div style="white-space:pre-wrap;padding:12px 14px;border:1px solid #ddd;border-radius:8px;line-height:1.6">${escapeHtml(message)}</div>`;
  const textBody = `${rows.map(([k, val]) => `${k}: ${val}`).join("\n")}\n\n${message}`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM || DEFAULT_FROM,
        to: [to],
        subject,
        html,
        text: textBody,
        ...(email && { reply_to: email }),
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      // 응답 본문(오류 상세)은 서버 로그에만 남기고 사용자에게는 일반 메시지
      console.error("contact: resend failed", res.status, (await res.text()).slice(0, 300));
      return json(502, { error: "지금은 문의를 보낼 수 없어요. 잠시 후 다시 시도해 주세요." });
    }
    return json(200, { ok: true });
  } catch (err) {
    console.error("contact: send error", err instanceof Error ? err.name : "unknown");
    return json(502, { error: "지금은 문의를 보낼 수 없어요. 잠시 후 다시 시도해 주세요." });
  } finally {
    clearTimeout(timer);
  }
}

// POST 외 요청은 거부
export function GET() {
  return json(405, { error: "허용되지 않은 요청이에요." });
}
