// games/ 안의 게임 폴더(index.html이 있는 폴더)를 찾아 public/play/<slug>/ 로 복사하고
// lib/games.generated.json 목록을 만든다. dev/build 전에 자동 실행된다.
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const gamesDir = path.join(root, "games");
const outDir = path.join(root, "public", "play");

const THUMB_EXTS = ["png", "webp", "jpg", "jpeg", "svg"];
const THUMB_WARN_BYTES = 500 * 1024;

// 썸네일: game.json의 "thumbnail" 또는 폴더 안 thumbnail.(png|webp|jpg|jpeg|svg)
function findThumbnail(dir, meta, folderName) {
  const candidates = meta.thumbnail ? [meta.thumbnail] : THUMB_EXTS.map((ext) => `thumbnail.${ext}`);
  for (const file of candidates) {
    const full = path.join(dir, file);
    if (!fs.existsSync(full)) continue;
    const size = fs.statSync(full).size;
    if (size > THUMB_WARN_BYTES) {
      console.warn(`⚠ ${folderName}/${file}: ${(size / 1024).toFixed(0)}KB — 300KB 이하로 줄이는 걸 권장해요`);
    }
    return file;
  }
  if (meta.thumbnail) console.warn(`⚠ ${folderName}: game.json의 thumbnail "${meta.thumbnail}" 파일이 없어요 (이모지로 표시)`);
  return null;
}

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9가-힣]+/g, "-").replace(/^-+|-+$/g, "");

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

const games = [];
for (const entry of fs.readdirSync(gamesDir, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name.startsWith(".") || entry.name.startsWith("_")) continue;
  const dir = path.join(gamesDir, entry.name);
  const indexPath = path.join(dir, "index.html");
  if (!fs.existsSync(indexPath)) continue;

  let meta = {};
  const metaPath = path.join(dir, "game.json");
  if (fs.existsSync(metaPath)) meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));

  const html = fs.readFileSync(indexPath, "utf8");
  const htmlTitle = html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim();

  const slug = meta.slug || slugify(entry.name);
  if (games.some((g) => g.slug === slug)) throw new Error(`중복된 slug: ${slug}`);

  fs.cpSync(dir, path.join(outDir, slug), {
    recursive: true,
    filter: (src) => !src.endsWith(".DS_Store") && !src.endsWith("game.json"),
  });

  const thumb = findThumbnail(dir, meta, entry.name);

  games.push({
    slug,
    title: meta.title || htmlTitle || entry.name,
    emoji: meta.emoji || "🎮",
    description: meta.description || "",
    // SEO: 검색 제목 한 줄 설명, 장르, 키워드, 게임 페이지 아래 소개글·하는 법
    tagline: meta.tagline || "",
    genre: meta.genre || "기타",
    keywords: Array.isArray(meta.keywords) ? meta.keywords : [],
    about: meta.about || "",
    howTo: Array.isArray(meta.howTo) ? meta.howTo : [],
    ...(thumb && { thumbnail: `/play/${slug}/${thumb.split("/").map(encodeURIComponent).join("/")}` }),
  });
}

// 게임들이 함께 쓰는 파일 (예: _shared/theme.js) → /play/_shared/
const sharedDir = path.join(gamesDir, "_shared");
if (fs.existsSync(sharedDir)) fs.cpSync(sharedDir, path.join(outDir, "_shared"), { recursive: true });

games.sort((a, b) => a.title.localeCompare(b.title, "ko"));
fs.writeFileSync(path.join(root, "lib", "games.generated.json"), JSON.stringify(games, null, 2) + "\n");

// 최근 업데이트 날짜: 마지막 커밋 날짜 (git을 못 쓰면 오늘 날짜, 한국 시간)
let updatedAt;
try {
  updatedAt = execSync("git log -1 --format=%cs", { cwd: root, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
} catch {}
if (!/^\d{4}-\d{2}-\d{2}$/.test(updatedAt || "")) {
  updatedAt = new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}
fs.writeFileSync(path.join(root, "lib", "build-info.generated.json"), JSON.stringify({ updatedAt }, null, 2) + "\n");
console.log(`✓ ${games.length}개 게임 동기화: ${games.map((g) => g.slug).join(", ")}`);
