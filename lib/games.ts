import data from "./games.generated.json";

export type Game = {
  slug: string;
  title: string;
  emoji: string;
  description: string;
};

export const games: Game[] = data;

export function getGame(slug: string): Game | undefined {
  return games.find((g) => g.slug === slug);
}
