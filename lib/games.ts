import data from "./games.generated.json";

export type Game = {
  slug: string;
  title: string;
  emoji: string;
  description: string;
  /** games/<폴더>/thumbnail.png 등이 있으면 그 경로 (없으면 emoji 표시) */
  thumbnail?: string;
  /** SEO: 검색 결과 제목에 붙는 한 줄 설명 */
  tagline: string;
  genre: string;
  keywords: string[];
  /** 게임 화면 '게임 소개' 팝업의 소개 문단 */
  about: string;
  /** 게임 화면 '게임 소개' 팝업의 '하는 법' 목록 */
  howTo: string[];
};

export const games: Game[] = data;

export function getGame(slug: string): Game | undefined {
  return games.find((g) => g.slug === slug);
}
