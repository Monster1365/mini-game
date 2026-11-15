import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, formatDate } from "@/lib/site";
import DocPage from "../DocPage";

// 방침 내용을 바꾸면 이 날짜도 함께 바꾼다
const EFFECTIVE_DATE = "2026-11-15";

export const metadata: Metadata = {
  title: "개인정보 처리방침",
  description: `${SITE_NAME}의 개인정보 처리방침 — 수집하는 정보, 이용 목적, 외부 서비스, 쿠키와 로컬 스토리지, 보유 기간을 안내해요.`,
  alternates: { canonical: "/privacy" },
};

// 게임별로 이용자 브라우저(localStorage)에 저장하는 항목
const STORAGE = [
  ["사이트 공통", "theme", "화면 테마(라이트/다크) 선택"],
  ["알까기", "alkkagi-settings", "구슬 수·벽 설정·소리"],
  ["당구", "billiards-settings", "게임 종류·플레이 방식·목표 점수·소리"],
  ["물풍선 배틀", "wb_best", "1인 모드 최고 기록"],
  ["Dodge", "dodge-best", "최고 생존 시간"],
  ["Memory Match", "memory-match:level, memory-match:best:…", "난이도, 난이도별 최고 기록"],
  ["지뢰찾기", "minesweeper-level, minesweeper-best", "난이도, 난이도별 최고 기록"],
  ["오목", "omok-settings", "소리 켜기/끄기"],
  ["솔리테어", "solitaire-settings, solitaire-best", "넘기는 장 수·소리, 최고 기록"],
  ["스도쿠", "sudoku-save, sudoku-best", "진행 중인 게임, 난이도별 최고 기록"],
  ["끝말잇기", "wordchain-settings-v1", "플레이어 이름·모드·규칙 설정"],
  ["윷놀이", "yut-settings", "인원·빽도 설정·소리"],
];

export default function PrivacyPage() {
  return (
    <DocPage title="개인정보 처리방침" lead={`시행일: ${formatDate(EFFECTIVE_DATE)}`}>
      <section>
        <h2>제1조 총칙</h2>
        <p>
          {SITE_NAME}(이하 &lsquo;사이트&rsquo;)는 이용자의 개인정보를 소중히 여기며, 「개인정보 보호법」 등 관련 법령을 지켜요.
          이 방침은 사이트와 사이트 안의 모든 게임에 적용되며, 사이트가 어떤 정보를 어떻게 다루는지 알려 드려요.
        </p>
        <p>
          사이트는 <strong>회원가입과 로그인 기능이 없고</strong>, 게임을 하기 위해 이름·연락처 같은 개인정보를 입력받지 않아요.
        </p>
      </section>

      <section>
        <h2>제2조 수집하는 정보</h2>
        <ol>
          <li>
            <strong>문의 양식으로 보내는 정보</strong> — 문의 유형, 내용(필수), 이름과 답장 받을 이메일 주소(선택). 이메일 주소는
            이용자가 수집·이용에 동의한 경우에만 받아요.
          </li>
          <li>
            <strong>자동으로 기록되는 정보</strong> — 사이트를 제공하는 호스팅 서비스(Vercel)가 서비스 운영과 보안을 위해 접속
            IP 주소, 접속 시각, 요청한 페이지, 브라우저·기기 정보(User-Agent) 등 접속 기록을 자동으로 남길 수 있어요.
          </li>
          <li>
            <strong>이용자 기기에만 저장되는 정보</strong> — 게임 설정과 최고 기록은 이용자 브라우저에만 저장되고 사이트로 전송되지
            않아요(제5조).
          </li>
        </ol>
        <p>
          문의를 보낼 때 같은 사람이 짧은 시간에 너무 많이 보내는 것을 막기 위해 접속 IP 주소를 서버 메모리에서 잠시(최대 10분)
          사용하며, 따로 저장하지 않아요.
        </p>
      </section>

      <section>
        <h2>제3조 이용 목적</h2>
        <ul>
          <li>문의 내용: 문의 확인과 답변, 버그 수정과 서비스 개선, 스팸·도배 방지</li>
          <li>접속 기록: 사이트 제공, 장애 대응, 비정상적인 접근 차단 등 보안 유지</li>
          <li>브라우저 저장 정보: 테마 선택, 게임 설정, 최고 기록, 이어하기 기능 제공</li>
        </ul>
        <p>수집한 정보는 위 목적 외에 사용하거나 다른 사람에게 판매·제공하지 않아요. 광고나 마케팅에도 사용하지 않아요.</p>
      </section>

      <section>
        <h2>제4조 정보를 처리하는 외부 서비스</h2>
        <p>사이트는 운영을 위해 아래 외부 서비스를 이용하며, 각 서비스는 자체 개인정보 처리방침에 따라 정보를 처리해요.</p>
        <div className="doc-table-wrap">
          <table className="doc-table">
            <thead>
              <tr><th>서비스</th><th>제공자</th><th>용도</th><th>처리하는 정보</th></tr>
            </thead>
            <tbody>
              <tr><td>Vercel</td><td>Vercel Inc. (미국)</td><td>사이트 호스팅, CDN 전송</td><td>접속 IP, 접속 시각, 요청 페이지, 브라우저 정보</td></tr>
              <tr><td>Resend</td><td>Resend, Inc. (미국)</td><td>문의 양식 내용을 운영자 메일함으로 전달</td><td>문의 유형·내용, 이름, 답장 받을 이메일 주소</td></tr>
              <tr><td>이메일 서비스</td><td>운영자가 사용하는 메일 서비스</td><td>문의 수신·답변</td><td>문의 유형·내용, 이름, 답장 받을 이메일 주소</td></tr>
            </tbody>
          </table>
        </div>
        <p>
          Vercel과 Resend의 서버는 해외에 있어 접속 기록과 문의 내용이 국외에서 처리될 수 있어요(국외 이전).
          문의 내용은 전송 즉시 운영자 메일함으로 전달되며, 사이트에는 따로 저장하지 않아요. 사이트는 방문자 분석 도구, 광고 네트워크, 소셜 로그인을
          사용하지 않아요.
        </p>
      </section>

      <section>
        <h2>제5조 쿠키와 로컬 스토리지</h2>
        <p>
          사이트는 <strong>쿠키를 사용하지 않아요.</strong> 대신 편의 기능을 위해 브라우저의 로컬 스토리지(localStorage)에 아래 정보를
          저장해요. 이 정보는 이용자 기기에만 남고 사이트나 제3자에게 전송되지 않으며, 개인을 식별하지 않아요.
        </p>
        <div className="doc-table-wrap">
          <table className="doc-table">
            <thead>
              <tr><th>위치</th><th>저장 이름</th><th>내용</th></tr>
            </thead>
            <tbody>
              {STORAGE.map(([where, key, what]) => (
                <tr key={key}><td>{where}</td><td><code>{key}</code></td><td>{what}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          브라우저 설정에서 이 사이트의 &lsquo;사이트 데이터&rsquo;를 삭제하면 언제든 지울 수 있어요. 지우면 테마와 게임 설정, 최고 기록이
          초기화돼요. 시크릿(사생활 보호) 모드에서는 창을 닫을 때 자동으로 지워져요.
        </p>
      </section>

      <section>
        <h2>제6조 보유 기간과 파기</h2>
        <ul>
          <li><strong>문의 내용</strong>: 운영자 메일함에서 답변을 마친 뒤 1년 동안 보관하고 삭제해요. 이용자가 요청하면 즉시 삭제해요.
            전송 서비스(Resend)의 발송 기록은 해당 서비스의 보관 정책에 따라 삭제돼요.</li>
          <li><strong>횟수 제한용 IP 주소</strong>: 서버 메모리에서 최대 10분 동안만 쓰고 저장하지 않아요.</li>
          <li><strong>접속 기록</strong>: 호스팅 서비스(Vercel)의 보관 정책에 따라 일정 기간 뒤 자동으로 삭제돼요.</li>
          <li><strong>브라우저 저장 정보</strong>: 이용자가 직접 지울 때까지 이용자 기기에만 남아 있어요.</li>
        </ul>
      </section>

      <section>
        <h2>제7조 이용자의 권리</h2>
        <p>
          이용자는 사이트에 보낸 자신의 정보에 대해 열람, 정정, 삭제, 처리 정지를 요청할 수 있어요.{" "}
          <Link href="/contact" prefetch={false}>문의</Link>를 통해 요청하시면 지체 없이 처리할게요.
        </p>
      </section>

      <section>
        <h2>제8조 만 14세 미만 아동</h2>
        <p>사이트는 개인정보를 입력받지 않으므로 아동의 개인정보를 따로 수집하지 않아요. 만 14세 미만 이용자가 문의할 때는 보호자와 함께 보내 주세요.</p>
      </section>

      <section>
        <h2>제9조 개인정보 보호책임자와 문의</h2>
        <p>
          개인정보 처리와 관련한 문의, 불만, 피해 구제는 사이트 운영자에게 <Link href="/contact" prefetch={false}>문의 페이지</Link>의
          이메일로 연락해 주세요. 그 밖에 개인정보 침해 신고·상담은 개인정보침해신고센터(privacy.kisa.or.kr, 국번 없이 118)에 문의할 수
          있어요.
        </p>
      </section>

      <section>
        <h2>제10조 방침의 변경</h2>
        <p>이 방침이 바뀌면 시행일과 함께 이 페이지에 알려 드려요.</p>
        <p className="muted">시행일: {formatDate(EFFECTIVE_DATE)}</p>
      </section>
    </DocPage>
  );
}
