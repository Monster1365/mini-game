import Image from "next/image";
import type { Game } from "@/lib/games";

// 게임 썸네일이 있으면 이미지, 없으면 이모지
export default function GameIcon({ game, size, className }: { game: Game; size: number; className?: string }) {
  if (game.thumbnail) {
    return (
      <Image
        src={game.thumbnail}
        alt=""
        width={size}
        height={size}
        className={`thumb ${className ?? ""}`}
        unoptimized={game.thumbnail.endsWith(".svg")}
      />
    );
  }
  return (
    <span className={`emoji ${className ?? ""}`} aria-hidden>
      {game.emoji}
    </span>
  );
}
