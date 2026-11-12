// 미니게임 공통 테마
// - 사이트 설정(localStorage "theme": "light" | "dark")을 따르고, 없으면 브라우저 설정을 따른다.
// - <html data-theme="light|dark">를 항상 지정하므로 게임 CSS는
//   :root { 다크 기본 } + :root[data-theme="light"] { 라이트 } 만 쓰면 된다.
// - 테마가 바뀌면 window에 'themechange' 이벤트를 보낸다 (캔버스 다시 그리기용).
// - <head>에서 스타일보다 먼저 동기 로드해야 깜빡임이 없다.
(function () {
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;

  function saved() {
    try {
      var t = localStorage.getItem('theme');
      return t === 'light' || t === 'dark' ? t : null;
    } catch (e) {
      return null;
    }
  }
  function resolve() {
    return saved() || (mq && mq.matches ? 'light' : 'dark');
  }
  function apply() {
    var next = resolve();
    if (root.getAttribute('data-theme') === next) return;
    root.setAttribute('data-theme', next);
    if (document.readyState !== 'loading') window.dispatchEvent(new Event('themechange'));
  }

  apply();
  window.addEventListener('storage', function (e) {
    if (e.key === 'theme' || e.key === null) apply();
  });
  if (mq) {
    if (mq.addEventListener) mq.addEventListener('change', apply);
    else if (mq.addListener) mq.addListener(apply);
  }

  window.GameTheme = {
    isLight: function () { return root.getAttribute('data-theme') === 'light'; },
    // CSS 변수 값을 읽는다: GameTheme.css('--bg')
    css: function (name) { return getComputedStyle(root).getPropertyValue(name).trim(); },
  };
})();
