import data from "./games.generated.json";

export type Game = {
  slug: string;
  title: string;
  emoji: string;
  description: string;
  /** games/<폴더>/thumbnail.png 등이 있으면 그 경로 (없으면 emoji 표시) */
  thumbnail?: string;
};

export const games: Game[] = data;

export function getGame(slug: string): Game | undefined {
  return games.find((g) => g.slug === slug);
}
