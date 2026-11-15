// 사이트 공통 정보 (SEO)
// 주소: NEXT_PUBLIC_SITE_URL > Vercel 프로덕션 도메인(빌드 때 자동 제공) > 로컬
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || (vercelHost ? `https://${vercelHost}` : "http://localhost:3000")
).replace(/\/$/, "");

export const SITE_NAME = "미니게임 아케이드";
export const SITE_TITLE = "미니게임 아케이드 - 무료 온라인 미니게임 (당구·윷놀이·알까기·오목)";
export const SITE_DESCRIPTION =
  "설치 없이 브라우저에서 바로 즐기는 무료 온라인 미니게임 모음. 당구게임, 윷놀이, 알까기, 오목, 스도쿠, 지뢰찾기, 솔리테어 등 " +
  "추억의 플래시 게임처럼 가볍고 빠르게 한 판 즐겨 보세요.";
export const SITE_KEYWORDS = [
  "미니게임", "온라인 게임", "무료 게임", "무료 온라인 게임", "웹게임", "브라우저 게임", "게임",
  "플래시 게임", "옛날 게임", "추억의 게임", "빠른 게임", "2인용 게임",
  "당구게임", "윷놀이", "알까기", "오목", "스도쿠", "지뢰찾기", "솔리테어", "끝말잇기",
];
