import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import DocPage from "../DocPage";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "문의",
  description: `${SITE_NAME}에 버그 제보, 게임 제안, 권리 관련 문의를 보내는 방법을 안내해요.`,
  alternates: { canonical: "/contact" },
};

// 문의는 서버(/api/contact)가 운영자 이메일로 전달한다. 운영자 주소는 화면·코드 어디에도 나오지 않는다.
// 빌드 시점에 환경 변수가 있는지만 확인해 양식을 켜고 끈다.
const enabled = Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_EMAIL);

export default function ContactPage() {
  return (
    <DocPage title="문의" lead="궁금한 점이나 불편한 점이 있으면 언제든 알려 주세요.">
      <section>
        <h2>문의 보내기</h2>
        <ContactForm enabled={enabled} />
        <p className="muted">
          보통 3일 안에 확인해요. 답장을 받으려면 이메일 주소를 적어 주세요. 이메일 없이 보내도 내용은 운영자에게 전달돼요.
        </p>
      </section>

      <section>
        <h2>이런 내용을 보내 주세요</h2>
        <ul>
          <li><strong>버그 제보</strong> — 어떤 게임에서, 어떤 순서로 했을 때 문제가 생겼는지, 사용한 기기와 브라우저를 함께 알려 주세요.</li>
          <li><strong>게임 제안</strong> — 추가되면 좋겠는 게임이나 기능</li>
          <li><strong>권리 관련 문의</strong> — 저작권·상표권 침해가 의심되는 내용</li>
          <li><strong>개인정보 관련 요청</strong> — 보내 주신 문의 내용의 삭제 요청 등</li>
        </ul>
        <p className="muted">
          보내 주신 내용은 답변과 서비스 개선에만 사용해요. 자세한 내용은{" "}
          <Link href="/privacy" prefetch={false}>개인정보 처리방침</Link>을 확인해 주세요.
        </p>
      </section>
    </DocPage>
  );
}
