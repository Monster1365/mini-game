import type { Metadata } from "next";
import Link from "next/link";
import { games } from "@/lib/games";
import { SITE_NAME, UPDATED_AT, formatDate } from "@/lib/site";
import DocPage from "../DocPage";

export const metadata: Metadata = {
  title: "소개",
  description: `${SITE_NAME} 소개 — 어떤 게임이 있는지, 게임의 출처와 권리, 사이트 운영·배포 방식을 안내해요.`,
  alternates: { canonical: "/about" },
};

const byGenre = games.reduce<Record<string, typeof games>>((acc, g) => {
  (acc[g.genre] ||= []).push(g);
  return acc;
}, {});

export default function AboutPage() {
  return (
    <DocPage title="소개" lead={`${SITE_NAME}는 설치 없이 브라우저에서 바로 즐기는 무료 미니게임 모음이에요.`}>
      <section>
        <h2>사이트 소개</h2>
        <p>
          회원가입, 설치, 광고 없이 링크 하나로 바로 시작할 수 있는 가벼운 게임을 모았어요. 친구나 가족과 한 화면에서 함께 하는
          2인용·다인용 게임부터 혼자 머리를 식히는 퍼즐까지, PC와 휴대폰 어디서든 즐길 수 있어요.
        </p>
        <dl className="doc-facts">
          <div><dt>최근 업데이트</dt><dd><time dateTime={UPDATED_AT}>{formatDate(UPDATED_AT)}</time></dd></div>
          <div><dt>게임 수</dt><dd>{games.length}개</dd></div>
          <div><dt>이용 요금</dt><dd>무료</dd></div>
        </dl>
      </section>

      <section>
        <h2>어떤 게임이 있나요?</h2>
        {Object.entries(byGenre).map(([genre, list]) => (
          <div key={genre} className="doc-genre">
            <h3>{genre}</h3>
            <ul>
              {list.map((g) => (
                <li key={g.slug}>
                  <Link href={`/games/${g.slug}`} prefetch={false}>{g.title}</Link>
                  {g.tagline && <> — {g.tagline}</>}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section>
        <h2>게임 출처와 권리</h2>
        <ul>
          <li>
            이 사이트의 모든 게임은 {SITE_NAME}를 위해 <strong>새로 만든 HTML5 웹 게임</strong>이에요. 운영자가 직접, 또는 AI 코딩
            도구의 도움을 받아 제작했어요.
          </li>
          <li>
            오목, 윷놀이, 알까기, 당구, 스도쿠, 지뢰찾기, 솔리테어, 끝말잇기처럼 <strong>널리 알려진 놀이와 게임의 규칙</strong>을
            바탕으로 했지만, 특정 상용 게임의 코드·그림·음악·상표를 가져와 쓰지 않았어요. 게임 이름과 화면은 이 사이트만의 것이에요.
          </li>
          <li>효과음은 녹음 파일 없이 브라우저의 Web Audio로 직접 합성해요.</li>
          <li>사이트와 게임의 이미지(배너, 썸네일 등)는 운영자가 직접 또는 이미지 생성 도구로 만들었어요.</li>
          <li>
            사이트의 디자인, 게임 코드, 글과 이미지의 권리는 {SITE_NAME} 운영자에게 있어요. 무단으로 복제하거나 다른 곳에 배포하지
            말아 주세요. 권리 침해가 의심되는 내용이 있다면 <Link href="/contact" prefetch={false}>문의</Link>로 알려 주시면 빠르게
            확인할게요.
          </li>
        </ul>
      </section>

      <section>
        <h2>운영과 배포 방식</h2>
        <ul>
          <li>사이트는 <strong>Next.js</strong>로 만들고, 소스 코드는 GitHub 저장소에서 관리해요.</li>
          <li>
            <strong>Vercel</strong>이 저장소의 배포 브랜치(main)가 바뀔 때마다 자동으로 빌드해 전 세계 CDN으로 배포해요. 새 기능은
            별도 개발 브랜치에서 먼저 미리보기로 확인한 뒤 반영해요.
          </li>
          <li>
            모든 페이지는 미리 만들어 둔 정적 페이지예요. 별도의 게임 서버나 데이터베이스가 없고, 게임은 각자의 브라우저 안에서만
            실행돼요.
          </li>
          <li>
            최고 기록과 설정은 이용자 브라우저에만 저장되고 서버로 전송되지 않아요. 자세한 내용은{" "}
            <Link href="/privacy" prefetch={false}>개인정보 처리방침</Link>을 확인해 주세요.
          </li>
        </ul>
      </section>
    </DocPage>
  );
}
