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

## 게임 썸네일 넣기

게임 폴더에 `thumbnail.png`(또는 `.webp` `.jpg` `.svg`)를 넣으면 홈 카드와 게임 화면 상단의 이모지가
그 이미지로 바뀝니다. 이미지가 없는 게임은 `game.json`의 `emoji`가 그대로 보여요.

```
games/Omok/
├── index.html
├── game.json
└── thumbnail.png   ← 여기
```

- 다른 파일명을 쓰려면 `game.json`에 `"thumbnail": "cover.webp"`처럼 지정하세요.
- 권장 규격: 정사각형 512×512, 투명 배경 PNG 또는 WebP, 300KB 이하 (500KB를 넘으면 빌드 때 경고).
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
