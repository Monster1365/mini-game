import Link from "next/link";
import { SITE_NAME, UPDATED_AT, formatDate } from "@/lib/site";

export default function Footer() {
  const year = UPDATED_AT.slice(0, 4);
  return (
    <footer className="site-footer">
      <nav aria-label="사이트 안내">
        <Link href="/about" prefetch={false}>소개</Link>
        <Link href="/contact" prefetch={false}>문의</Link>
        <Link href="/privacy" prefetch={false}>개인정보 처리방침</Link>
      </nav>
      <p>
        © {year} {SITE_NAME} · 최근 업데이트 <time dateTime={UPDATED_AT}>{formatDate(UPDATED_AT)}</time>
      </p>
    </footer>
  );
}
