import Link from "next/link";

export default function NotFound() {
  return (
    <main className="home">
      <header className="hero">
        <h1>게임을 찾을 수 없어요</h1>
        <p>
          <Link href="/">← 목록으로 돌아가기</Link>
        </p>
      </header>
    </main>
  );
}
