// 소식 페이지 내용 (content/news.json)
// 소식은 하나만 보여준다: 새 소식을 올릴 때 news.json 내용을 통째로 바꾸면 이전 소식은 사라진다.
// 페이지 틀은 app/news/page.tsx에 고정되어 있고, 여기서 형식을 검사해 어긋나면 빌드를 실패시킨다.
import raw from "@/content/news.json";
import { getGame } from "./games";

export type NewsGame = { slug: string; note: string };
export type News = {
  date: string; // YYYY-MM-DD
  title: string;
  summary: string;
  newGames: NewsGame[];
  improvements: string[];
  fixes: string[];
};

const KEYS = ["date", "title", "summary", "newGames", "improvements", "fixes"] as const;

function fail(msg: string): never {
  throw new Error(`content/news.json 형식 오류: ${msg}`);
}
const isText = (v: unknown, max: number) => typeof v === "string" && v.trim().length > 0 && v.length <= max;

function validate(n: unknown): News {
  if (!n || typeof n !== "object" || Array.isArray(n)) fail("최상위는 객체여야 해요");
  const o = n as Record<string, unknown>;
  const extra = Object.keys(o).filter((k) => !(KEYS as readonly string[]).includes(k));
  if (extra.length) fail(`알 수 없는 항목: ${extra.join(", ")} (쓸 수 있는 항목: ${KEYS.join(", ")})`);
  for (const k of KEYS) if (!(k in o)) fail(`'${k}' 항목이 없어요 (비어 있으면 [] 로 두세요)`);

  if (typeof o.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(o.date) || Number.isNaN(Date.parse(o.date))) {
    fail("date는 YYYY-MM-DD 형식이어야 해요");
  }
  if (!isText(o.title, 60)) fail("title은 1~60자 글이어야 해요");
  if (!isText(o.summary, 300)) fail("summary는 1~300자 글이어야 해요");

  if (!Array.isArray(o.newGames)) fail("newGames는 목록([])이어야 해요");
  o.newGames.forEach((g, i) => {
    const r = g as Record<string, unknown>;
    if (!r || typeof r !== "object" || typeof r.slug !== "string" || !isText(r.note, 200)) {
      fail(`newGames[${i}]는 { "slug": "...", "note": "..." } 형태여야 해요`);
    }
    if (!getGame(r.slug as string)) fail(`newGames[${i}]의 slug '${String(r.slug)}' 게임이 없어요`);
  });
  for (const k of ["improvements", "fixes"] as const) {
    const list = o[k];
    if (!Array.isArray(list)) fail(`${k}는 목록([])이어야 해요`);
    list.forEach((s, i) => {
      if (!isText(s, 200)) fail(`${k}[${i}]는 1~200자 글이어야 해요`);
    });
  }
  return o as unknown as News;
}

export const news: News = validate(raw);
