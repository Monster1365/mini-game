# mini-game

브라우저에서 바로 즐기는 미니게임 모음 사이트 (Next.js, Vercel 배포).

## 실행

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드
```

## 게임 추가하기

1. 루트에 새 폴더를 만들고 `index.html`(과 필요한 css/js/이미지)을 넣습니다.
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
게임 폴더를 `public/play/<slug>/`로 복사하고 목록(`lib/games.generated.json`)을 만듭니다.
이 두 결과물은 자동 생성되므로 git에 올리지 않습니다.

## 구조

- `/` — 게임 목록
- `/games/<slug>` — 게임 플레이 화면 (iframe, 전체화면 지원)
- `/play/<slug>/index.html` — 게임 원본 정적 파일
