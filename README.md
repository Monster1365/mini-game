# mini-game

브라우저에서 바로 즐기는 미니게임 모음 사이트 (Next.js, Vercel 배포).

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드
```

## 게임 추가하기

1. `games/` 안에 새 폴더를 만들고 `index.html`(과 필요한 css/js/이미지)을 넣습니다.
2. (선택) 같은 폴더에 `game.json`을 추가해 목록에 보일 정보를 지정합니다.

```json
{
  "slug": "my-game",
  "title": "내 게임",
  "emoji": "🎮",
  "description": "한 줄 설명"
}
```

`game.json`이 없으면 폴더 이름으로 slug를, `<title>` 태그로 제목을 정합니다.

`npm run dev` / `npm run build` 전에 `scripts/sync-games.mjs`가 자동으로 실행되어
`games/`의 게임 폴더를 `public/play/<slug>/`로 복사하고 목록(`lib/games.generated.json`)을 만듭니다.
이 두 결과물은 자동 생성되므로 git에 올리지 않습니다.

## 검색 최적화 (SEO)

각 게임의 `game.json`에 아래 항목을 채우면 검색 결과 제목·설명과 게임 페이지 아래 소개글에 쓰입니다.

```json
{
  "tagline": "2~4인이 함께하는 무료 온라인 윷놀이",   // 검색 제목에 붙는 한 줄 설명
  "genre": "보드게임",                              // 홈 아래 장르별 목록
  "keywords": ["윷놀이", "온라인 윷놀이", "전통 놀이"],
  "about": "게임 소개 문단 (첫 문장은 검색 결과 설명에도 쓰여요)",
  "howTo": ["하는 법 1", "하는 법 2"]
}
```

- `sitemap.xml`, `robots.txt`, 페이지별 메타 태그와 구조화 데이터(JSON-LD)는 자동으로 만들어집니다.
- 사이트 주소는 Vercel 프로덕션 도메인을 자동으로 씁니다. 다른 도메인을 쓰려면 환경 변수 `NEXT_PUBLIC_SITE_URL`을 지정하세요.
- 문의 양식(`/contact`): 서버가 [Resend](https://resend.com)로 운영자 메일함에 전달해요(운영자 주소는 화면에 나오지 않아요).
  Vercel 환경 변수 `RESEND_API_KEY`, `CONTACT_EMAIL`(받을 주소)을 넣고 다시 배포하세요. 도메인을 인증하지 않았다면
  `CONTACT_EMAIL`은 Resend에 가입한 이메일과 같아야 해요. 보내는 주소를 바꾸려면 `CONTACT_FROM`(선택). 둘 중 하나라도 없으면 "준비 중" 안내가 보여요.
- 검색엔진 소유 확인: Vercel 환경 변수 `GOOGLE_SITE_VERIFICATION`(구글 서치 콘솔), `NAVER_SITE_VERIFICATION`(네이버 서치어드바이저)에
  확인 코드를 넣고 다시 배포하면 메타 태그가 자동으로 들어갑니다.

## 게임 썸네일 넣기

게임 폴더에 `thumbnail.png`(또는 `.webp` `.jpg` `.svg`)를 넣으면 홈 카드의 이모지가
그 이미지로 바뀝니다. 이미지가 없는 게임은 `game.json`의 `emoji`가 그대로 보여요.

```
games/Omok/
├── index.html
├── game.json
└── thumbnail.png   ← 여기
```

- 다른 파일명을 쓰려면 `game.json`에 `"thumbnail": "cover.webp"`처럼 지정하세요.
- 권장 규격: **정사각형 512×512**, 300KB 이하 (500KB를 넘으면 빌드 때 경고).
  투명 배경이 없으면 **JPEG**(품질 85~90)가 PNG보다 4~5배 작아요. 투명 배경이 필요할 때만 PNG/WebP를 쓰세요.
  macOS에서 줄이기: `sips -z 512 512 원본.png --out tmp.png && sips -s format jpeg -s formatOptions 88 tmp.png --out thumbnail.jpg`
  홈 카드(2:3)의 위쪽 2/3를 꽉 채워 보여주므로 정사각형이 아니면 가장자리가 잘려요.
- 사이트 공용 이미지(로고, 배너, 파비콘)는 `public/images/`에 둡니다.

## 테마 (라이트/다크)

홈 오른쪽 위 ⚙ 설정에서 시스템/라이트/다크를 고를 수 있고, 게임에도 똑같이 적용됩니다.
새 게임을 추가할 때는 `<head>`에서 스타일보다 먼저 공통 스크립트를 불러오세요.

```html
<script src="../_shared/theme.js"></script>
```

이 스크립트가 `<html data-theme="light|dark">`를 지정하므로, CSS는 다크 기본값을 `:root`에,
라이트 색을 `:root[data-theme="light"]`에 쓰면 됩니다. 캔버스 색은 `GameTheme.css('--변수')`로
읽고, 테마가 바뀌면 `window`에 `themechange` 이벤트가 발생합니다.

## 구조

- `games/<폴더>/` — 게임 원본 (각 폴더의 `index.html`, 선택적으로 `game.json`)
- `games/_shared/` — 게임 공통 파일 (`theme.js`)
- `public/images/` — 사이트 이미지 (파비콘, 로고 등)
- `/` — 게임 목록
- `/games/<slug>` — 게임 플레이 화면 (iframe, 전체화면 지원)
- `/play/<slug>/index.html` — 게임 원본 정적 파일
