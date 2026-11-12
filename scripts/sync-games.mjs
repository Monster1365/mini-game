// games/ 안의 게임 폴더(index.html이 있는 폴더)를 찾아 public/play/<slug>/ 로 복사하고
// lib/games.generated.json 목록을 만든다. dev/build 전에 자동 실행된다.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const gamesDir = path.join(root, "games");
const outDir = path.join(root, "public", "play");

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

  games.push({
    slug,
    title: meta.title || htmlTitle || entry.name,
    emoji: meta.emoji || "🎮",
    description: meta.description || "",
  });
}

// 게임들이 함께 쓰는 파일 (예: _shared/theme.js) → /play/_shared/
const sharedDir = path.join(gamesDir, "_shared");
if (fs.existsSync(sharedDir)) fs.cpSync(sharedDir, path.join(outDir, "_shared"), { recursive: true });

games.sort((a, b) => a.title.localeCompare(b.title, "ko"));
fs.writeFileSync(path.join(root, "lib", "games.generated.json"), JSON.stringify(games, null, 2) + "\n");
console.log(`✓ ${games.length}개 게임 동기화: ${games.map((g) => g.slug).join(", ")}`);
