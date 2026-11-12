import Image from "next/image";
import Link from "next/link";
import { games } from "@/lib/games";

export default function Home() {
  return (
    <main className="home">
      <header className="hero">
        <h1>
          <Image src="/images/logo.png" alt="" width={72} height={72} className="logo" priority />
          <span>
            미니게임 <span className="glow">아케이드</span>
          </span>
        </h1>
        <p>설치 없이 브라우저에서 바로 플레이하세요. 총 {games.length}개의 게임</p>
      </header>

      <ul className="grid">
        {games.map((g) => (
          <li key={g.slug}>
            <Link href={`/games/${g.slug}`} className="card">
              <span className="emoji" aria-hidden>
                {g.emoji}
              </span>
              <span className="card-title">{g.title}</span>
              {g.description && <span className="card-desc">{g.description}</span>}
              <span className="play">플레이 ▶</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
