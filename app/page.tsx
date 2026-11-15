import Image from "next/image";
import Link from "next/link";
import { games } from "@/lib/games";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import JsonLd from "./JsonLd";
import SettingsMenu from "./SettingsMenu";

// 장르별로 묶기 (홈 아래 소개 영역의 내부 링크용)
const byGenre = games.reduce<Record<string, typeof games>>((acc, g) => {
  (acc[g.genre] ||= []).push(g);
  return acc;
}, {});

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", name: SITE_NAME, url: `${SITE_URL}/`, inLanguage: "ko-KR", description: SITE_DESCRIPTION },
    {
      "@type": "ItemList",
      name: "무료 온라인 미니게임 목록",
      itemListElement: games.map((g, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/games/${g.slug}`,
        name: g.title,
      })),
    },
  ],
};

export default function Home() {
  return (
    <>
      <JsonLd data={jsonLd} />
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

        {/* 검색엔진과 사람 모두를 위한 소개 (키워드를 자연스러운 문장으로) */}
        <section className="intro" aria-labelledby="intro-title">
          <h2 id="intro-title">설치 없이 바로 즐기는 무료 온라인 미니게임</h2>
          <p>
            {SITE_NAME}는 회원가입이나 설치 없이 브라우저에서 바로 시작하는 <strong>무료 온라인 게임</strong> 모음이에요.
            친구와 한 화면에서 즐기는 <strong>2인용 게임</strong>부터 혼자 머리를 식히는 퍼즐까지, 예전{" "}
            <strong>플래시 게임</strong>처럼 가볍고 <strong>빠르게 한 판</strong> 즐길 수 있어요. 어릴 적 하던{" "}
            <strong>옛날 게임</strong>과 명절에 가족과 하던 전통 놀이도 준비했어요. PC와 모바일 모두 지원해요.
          </p>
          <div className="genres">
            {Object.entries(byGenre).map(([genre, list]) => (
              <div key={genre} className="genre">
                <h3>{genre}</h3>
                <ul>
                  {list.map((g) => (
                    <li key={g.slug}>
                      <Link href={`/games/${g.slug}`} prefetch={false}>
                        {g.title}
                      </Link>
                      {g.tagline && <span> — {g.tagline}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
