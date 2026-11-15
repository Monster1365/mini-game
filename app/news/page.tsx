import type { Metadata } from "next";
import Link from "next/link";
import { getGame } from "@/lib/games";
import { news } from "@/lib/news";
import { SITE_NAME, formatDate } from "@/lib/site";
import DocPage from "../DocPage";

export const metadata: Metadata = {
  title: "소식",
  description: `${SITE_NAME}의 최신 업데이트 — ${news.title}`,
  alternates: { canonical: "/news" },
};

// ⚠ 이 페이지의 틀(구성·순서·제목)은 고정이다. 소식을 바꿀 때는 content/news.json만 고친다.
// 각 칸은 비어 있어도 사라지지 않고 "이번 업데이트에는 없어요"로 표시한다.
function Empty() {
  return <p className="news-empty">이번 업데이트에는 없어요.</p>;
}

export default function NewsPage() {
  return (
    <DocPage title="소식" lead="가장 최근 업데이트 소식을 알려 드려요.">
      <article className="news" aria-labelledby="news-title">
        <header className="news-head">
          <p className="news-date">
            <span className="news-badge">최신 업데이트</span>
            <time dateTime={news.date}>{formatDate(news.date)}</time>
          </p>
          <h2 id="news-title">{news.title}</h2>
          <p className="news-summary">{news.summary}</p>
        </header>

        <section className="news-block" aria-labelledby="news-new">
          <h3 id="news-new">새로 추가된 게임</h3>
          {news.newGames.length ? (
            <ul className="news-games">
              {news.newGames.map(({ slug, note }) => {
                const g = getGame(slug)!;
                return (
                  <li key={slug}>
                    <Link href={`/games/${slug}`} prefetch={false}>{g.title}</Link>
                    <span>{note}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty />
          )}
        </section>

        <section className="news-block" aria-labelledby="news-improve">
          <h3 id="news-improve">바뀐 점</h3>
          {news.improvements.length ? <ul>{news.improvements.map((s) => <li key={s}>{s}</li>)}</ul> : <Empty />}
        </section>

        <section className="news-block" aria-labelledby="news-fix">
          <h3 id="news-fix">버그 수정</h3>
          {news.fixes.length ? <ul>{news.fixes.map((s) => <li key={s}>{s}</li>)}</ul> : <Empty />}
        </section>
      </article>

      <p className="muted">
        지난 소식은 따로 보관하지 않아요. 고쳤으면 하는 점이나 바라는 게임이 있다면{" "}
        <Link href="/contact" prefetch={false}>문의</Link>로 알려 주세요.
      </p>
    </DocPage>
  );
}
