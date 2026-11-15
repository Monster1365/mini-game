import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { games, getGame } from "@/lib/games";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import JsonLd from "../../JsonLd";
import GameFrame from "./GameFrame";

export const dynamicParams = false;

export function generateStaticParams() {
  return games.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: PageProps<"/games/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) return {};
  const title = game.tagline ? `${game.title} - ${game.tagline}` : game.title;
  // 검색 결과 설명: 한 줄 설명 + 소개글 첫 문장 + 안내 (구글은 보통 150자 안팎에서 자른다)
  const firstSentence = (game.about.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? game.description).trim();
  let description = `${game.tagline || game.title}. ${firstSentence} 설치 없이 무료로 바로 플레이하세요.`;
  if (description.length > 155) description = `${game.tagline || game.title}. ${firstSentence}`.slice(0, 154) + "…";
  const image = game.thumbnail ?? "/images/og.png";
  const path = `/games/${game.slug}`;
  return {
    title,
    description,
    keywords: game.keywords,
    alternates: { canonical: path },
    openGraph: { type: "website", locale: "ko_KR", siteName: SITE_NAME, title, description, url: path, images: [{ url: image, alt: game.title }] },
    twitter: { card: game.thumbnail ? "summary" : "summary_large_image", title, description, images: [image] },
  };
}

export default async function GamePage({ params }: PageProps<"/games/[slug]">) {
  const { slug } = await params;
  const game = getGame(slug);
  if (!game) notFound();

  const url = `${SITE_URL}/games/${game.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "VideoGame",
        name: game.title,
        url,
        description: game.about || game.description,
        genre: game.genre,
        keywords: game.keywords.join(", "),
        inLanguage: "ko-KR",
        gamePlatform: "웹 브라우저",
        applicationCategory: "Game",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: 0, priceCurrency: "KRW" },
        ...(game.thumbnail && { image: `${SITE_URL}${game.thumbnail}` }),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: game.title, item: url },
        ],
      },
    ],
  };

  const others = games.filter((g) => g.slug !== game.slug);

  return (
    <>
      <JsonLd data={jsonLd} />
      {/* 소개·하는 법은 '게임 소개' 팝업 안에 들어가지만 HTML에는 그대로 있어 검색엔진이 읽는다 */}
      <GameFrame
        game={game}
        info={
          <div className="game-info">
            {game.tagline && <p className="game-tagline">{game.tagline}</p>}
            <p>{game.about || game.description}</p>
            {game.howTo.length > 0 && (
              <>
                <h2>{game.title} 하는 법</h2>
                <ol>
                  {game.howTo.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </>
            )}
            <h2>다른 무료 미니게임</h2>
            <ul className="other-games">
              {others.map((g) => (
                <li key={g.slug}>
                  <Link href={`/games/${g.slug}`} prefetch={false}>
                    {g.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        }
      />
    </>
  );
}
