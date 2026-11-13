import Image from "next/image";
import Link from "next/link";
import { games } from "@/lib/games";
import SettingsMenu from "./SettingsMenu";

export default function Home() {
  return (
    <>
      <header className="banner">
        <Image src="/images/banner.png" alt="" fill priority sizes="100vw" className="banner-img" />
        <SettingsMenu />
        <div className="banner-content">
          <h1>
            미니게임{" "}
            <span className="glow" data-text="아케이드">
              아케이드
            </span>
          </h1>
          <p>설치 없이 브라우저에서 바로 플레이하세요. 총 {games.length}개의 게임</p>
        </div>
      </header>

      <main className="home">
        <ul className="grid">
          {games.map((g) => (
            <li key={g.slug}>
              {/* 프리패치 끔: 홈에서 카드 12개 × 2건의 RSC 요청이 생기는 것을 막는다 */}
              <Link href={`/games/${g.slug}`} className="card" prefetch={false}>
                <span className="card-media">
                  {g.thumbnail ? (
                    <Image
                      src={g.thumbnail}
                      alt=""
                      fill
                      sizes="(max-width: 600px) 100vw, 280px"
                      className="card-img"
                      unoptimized /* 이미 512px로 줄인 파일이라 이미지 최적화(변환)를 거치지 않는다 */
                    />
                  ) : (
                    <span className="card-emoji" aria-hidden>
                      {g.emoji}
                    </span>
                  )}
                </span>
                <span className="card-body">
                  <span className="card-head">
                    <span className="card-title">{g.title}</span>
                    <span className="play">플레이 ▶</span>
                  </span>
                  {g.description && <span className="card-desc">{g.description}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
