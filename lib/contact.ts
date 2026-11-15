// 문의 양식 입력 검증·정리 (서버와 클라이언트가 함께 쓰는 순수 함수)
// DB가 없으므로 SQL 인젝션은 해당하지 않지만, 메일 폼에서 생길 수 있는 비슷한 공격을 막는다.
//  - 메일 헤더 인젝션: 한 줄짜리 값(이름·이메일·제목)에서 줄바꿈과 제어 문자를 모두 제거
//  - HTML 인젝션: 메일 HTML 본문에 넣을 때 escapeHtml로 이스케이프
//  - 과도한 입력: 길이 제한

export const CONTACT_CATEGORIES = ["버그 제보", "게임 제안", "권리 관련 문의", "개인정보 관련 요청", "기타"] as const;
export type ContactCategory = (typeof CONTACT_CATEGORIES)[number];

export const LIMITS = { name: 40, email: 254, messageMin: 10, messageMax: 3000 } as const;
export const MAX_BODY_BYTES = 16 * 1024;
/** 페이지를 연 뒤 이보다 빨리 제출하면 봇으로 본다 (ms) */
export const MIN_FILL_MS = 3000;

export type ContactInput = {
  category: ContactCategory;
  name: string;
  email: string; // 답장 받을 주소 (선택, 빈 문자열 가능)
  message: string;
};

export type ValidationResult = { ok: true; value: ContactInput } | { ok: false; error: string };

// 정규식 리터럴에 U+2028/2029를 쓰면 번들 과정에서 실제 줄바꿈 문자로 바뀌어 문법 오류가 나므로 문자열로 만든다
const CTRL_ALL = new RegExp("[\\u0000-\\u001f\\u007f\\u2028\\u2029]", "g");
const CTRL_KEEP_NL_TAB = new RegExp("[\\u0000-\\u0008\\u000b-\\u001f\\u007f\\u2028\\u2029]", "g");

// 한 줄 값: 모든 제어 문자(줄바꿈 포함) 제거 → 헤더 인젝션 차단
export function singleLine(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.replace(CTRL_ALL, " ").replace(/\s+/g, " ").trim().slice(0, max);
}

// 여러 줄 값: 줄바꿈(\n)과 탭만 남기고 나머지 제어 문자 제거, 줄바꿈 통일
export function multiLine(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v
    .replace(/\r\n?/g, "\n")
    .replace(CTRL_KEEP_NL_TAB, "")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim()
    .slice(0, max);
}

// 실용적인 이메일 형식 검사 (따옴표·공백·줄바꿈이 들어간 주소는 거부)
const EMAIL_RE = /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
export const isEmail = (v: string) => v.length <= LIMITS.email && EMAIL_RE.test(v);

export function validateContact(raw: unknown): ValidationResult {
  if (!raw || typeof raw !== "object") return { ok: false, error: "잘못된 요청이에요." };
  const r = raw as Record<string, unknown>;
  const category = CONTACT_CATEGORIES.includes(r.category as ContactCategory) ? (r.category as ContactCategory) : null;
  if (!category) return { ok: false, error: "문의 유형을 골라 주세요." };
  const name = singleLine(r.name, LIMITS.name);
  const email = singleLine(r.email, LIMITS.email);
  if (email && !isEmail(email)) return { ok: false, error: "답장 받을 이메일 주소 형식을 확인해 주세요." };
  if (typeof r.message === "string" && r.message.length > LIMITS.messageMax * 2) {
    return { ok: false, error: `내용은 ${LIMITS.messageMax}자까지 쓸 수 있어요.` };
  }
  const message = multiLine(r.message, LIMITS.messageMax);
  if (message.length < LIMITS.messageMin) return { ok: false, error: `내용을 ${LIMITS.messageMin}자 이상 써 주세요.` };
  if (email && r.agree !== true) return { ok: false, error: "답장을 받으려면 개인정보 수집·이용에 동의해 주세요." };
  return { ok: true, value: { category, name, email, message } };
}

export function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
