import Image from "next/image";
import Link from "next/link";
import Footer from "./Footer";

// 소개·문의·개인정보 처리방침 같은 안내 문서용 레이아웃
export default function DocPage({ title, lead, children }: { title: string; lead?: string; children: React.ReactNode }) {
  return (
    <>
      <header className="doc-header">
        <Link href="/" className="back" prefetch={false}>
          <Image src="/images/logo-64.png" alt="" width={22} height={22} className="back-logo" unoptimized />
          홈으로
        </Link>
      </header>
      <main className="doc">
        <h1>{title}</h1>
        {lead && <p className="doc-lead">{lead}</p>}
        {children}
      </main>
      <Footer />
    </>
  );
}
