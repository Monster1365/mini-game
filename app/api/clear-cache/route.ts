// 설정 메뉴 '캐시 삭제': 브라우저에 이 사이트의 HTTP 캐시를 지우라고 알린다.
// Clear-Site-Data 표준 헤더 — 기록·설정(localStorage)은 건드리지 않는다("cache"만 지정).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  if (!sameOrigin(req)) {
    return new Response(JSON.stringify({ error: "허용되지 않은 요청이에요." }), {
      status: 403,
      headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Clear-Site-Data": '"cache"',
    },
  });
}

export function GET() {
  return new Response(null, { status: 405, headers: { Allow: "POST" } });
}
