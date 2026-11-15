(() => {
  'use strict';

  const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const SUITS_BY_COLOR = {
    red: ['♥', '♦'],
    black: ['♠', '♣'],
  };
  // 난이도별 열 수 (pairs → columns)
  const COLS = { 6: 4, 10: 5, 15: 6 };
  const MISMATCH_DELAY = 850;

  // 숫자 카드 핍 배치 (x%, y%, 뒤집힘 여부)
  const PIP_LAYOUT = {
    2: [[50, 0], [50, 100, 1]],
    3: [[50, 0], [50, 50], [50, 100, 1]],
    4: [[0, 0], [100, 0], [0, 100, 1], [100, 100, 1]],
    5: [[0, 0], [100, 0], [50, 50], [0, 100, 1], [100, 100, 1]],
    6: [[0, 0], [100, 0], [0, 50], [100, 50], [0, 100, 1], [100, 100, 1]],
    7: [[0, 0], [100, 0], [50, 25], [0, 50], [100, 50], [0, 100, 1], [100, 100, 1]],
    8: [[0, 0], [100, 0], [50, 25], [0, 50], [100, 50], [50, 75, 1], [0, 100, 1], [100, 100, 1]],
    9: [[0, 0], [100, 0], [0, 33], [100, 33], [50, 50], [0, 67, 1], [100, 67, 1], [0, 100, 1], [100, 100, 1]],
    10: [[0, 0], [100, 0], [50, 17], [0, 33], [100, 33], [0, 67, 1], [100, 67, 1], [50, 83, 1], [0, 100, 1], [100, 100, 1]],
  };

  const $ = (sel) => document.querySelector(sel);
  const board = $('#board');
  const els = {
    time: $('#time'), moves: $('#moves'), pairs: $('#pairs'), best: $('#best'),
    win: $('#win'), winText: $('#win-text'), winBest: $('#win-best'),
  };

  const state = {
    pairs: 6,
    first: null,
    second: null,
    lock: false,
    moves: 0,
    matched: 0,
    startTime: 0,
    elapsed: 0,
    timerId: null,
  };

  // ---------- 저장소 (실패해도 게임은 동작) ----------
  const storage = {
    get(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
    set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ } },
  };
  const bestKey = () => `memory-match:best:${state.pairs}`;

  // ---------- 사운드 (Web Audio 합성, 외부 파일 없음) ----------
  const Sound = (() => {
    let ctx = null, noise = null, muted = !!storage.get('memory-match:muted');
    function unlock() {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        ctx = new AC();
        noise = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
        const d = noise.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      if (ctx.state === 'suspended') ctx.resume();
    }
    const ready = () => ctx && !muted && ctx.state === 'running';
    function tone(freq, vol, decay, type = 'sine', at = 0, slideTo = 0) {
      const t = ctx.currentTime + at, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + decay);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + decay + 0.03);
    }
    function swish(freq, vol, decay, at = 0, sweepTo = 0) {
      const t = ctx.currentTime + at, n = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      n.buffer = noise; f.type = 'bandpass'; f.Q.value = 1.4;
      f.frequency.setValueAtTime(freq, t);
      if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + decay);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
      n.connect(f).connect(g).connect(ctx.destination); n.start(t, Math.random() * 0.2); n.stop(t + decay + 0.02);
    }
    return {
      unlock,
      get muted() { return muted; },
      set muted(v) { muted = v; storage.set('memory-match:muted', v); },
      flip() { if (ready()) { swish(4800, 0.28, 0.07, 0, 2400); tone(700, 0.04, 0.04, 'triangle'); } },
      // 짝 맞춤: 연속으로 맞힐수록 음이 반음씩 올라간다
      match(streak) {
        if (!ready()) return;
        const base = 659.25 * Math.pow(2, Math.min(streak, 8) / 12);
        tone(base, 0.16, 0.22, 'triangle', 0.02);
        tone(base * 1.5, 0.14, 0.32, 'triangle', 0.12);
      },
      miss() { if (ready()) { tone(220, 0.12, 0.18, 'triangle', 0, 165); tone(165, 0.08, 0.22, 'sine', 0.1, 130); } },
      deal(n) { if (ready()) for (let i = 0; i < Math.min(n, 16); i++) swish(3600 + Math.random() * 1400, 0.1, 0.035, i * 0.03); },
      win() {
        if (!ready()) return;
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.15, 0.32, 'triangle', i * 0.1));
        [523.25, 659.25, 783.99].forEach(f => tone(f, 0.08, 1.0, 'sine', 0.45));
        for (let i = 0; i < 5; i++) tone(1568 + Math.random() * 1000, 0.03, 0.14, 'sine', 0.5 + i * 0.08);
      },
    };
  })();
  let streak = 0; // 연속으로 맞힌 짝 수 (효과음 음높이용)

  // ---------- 유틸 ----------
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  const fmtTime = (ms) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  // ---------- 덱 생성: (숫자, 색) 조합을 골라 같은 색의 두 무늬로 한 쌍 ----------
  function buildDeck(pairCount) {
    const combos = [];
    for (const rank of RANKS) {
      for (const color of Object.keys(SUITS_BY_COLOR)) combos.push({ rank, color });
    }
    const chosen = shuffle(combos).slice(0, pairCount);
    const deck = [];
    chosen.forEach(({ rank, color }) => {
      const key = `${rank}-${color}`;
      SUITS_BY_COLOR[color].forEach((suit) => deck.push({ rank, suit, color, key }));
    });
    return shuffle(deck);
  }

  // ---------- 카드 앞면 렌더 ----------
  function faceHTML({ rank, suit }) {
    const corner = (pos) =>
      `<div class="corner ${pos}"><span class="r">${rank}</span><span class="s">${suit}</span></div>`;

    let center;
    if (rank === 'A') {
      center = `<div class="pips"><span class="pip ace" style="left:50%;top:50%">${suit}</span></div>`;
    } else if (['J', 'Q', 'K'].includes(rank)) {
      center = `<div class="court"><span class="big">${rank}</span><span class="suit">${suit}</span></div>`;
    } else {
      const pips = PIP_LAYOUT[rank]
        .map(([x, y, f]) => `<span class="pip${f ? ' flip' : ''}" style="left:${x}%;top:${y}%">${suit}</span>`)
        .join('');
      center = `<div class="pips">${pips}</div>`;
    }
    return corner('tl') + center + corner('br');
  }

  function createCard(card, index) {
    const btn = document.createElement('button');
    btn.className = 'card';
    btn.type = 'button';
    btn.style.setProperty('--i', index);
    btn.dataset.key = card.key;
    btn.setAttribute('aria-label', '뒤집힌 카드');
    btn.innerHTML = `
      <div class="card-inner">
        <div class="back"></div>
        <div class="face ${card.color}">${faceHTML(card)}</div>
      </div>`;
    btn._card = card;
    btn.addEventListener('click', () => onFlip(btn));
    return btn;
  }

  // ---------- 타이머 ----------
  function startTimer() {
    if (state.timerId) return;
    state.startTime = performance.now();
    state.timerId = setInterval(() => {
      state.elapsed = performance.now() - state.startTime;
      els.time.textContent = fmtTime(state.elapsed);
    }, 250);
  }
  function stopTimer() {
    clearInterval(state.timerId);
    state.timerId = null;
    if (state.startTime) state.elapsed = performance.now() - state.startTime;
  }

  // ---------- 게임 로직 ----------
  function onFlip(btn) {
    if (state.lock || btn === state.first || btn.classList.contains('matched')) return;

    startTimer();
    Sound.flip();
    btn.classList.add('flipped');
    btn.setAttribute('aria-label', `${btn._card.rank}${btn._card.suit}`);

    if (!state.first) {
      state.first = btn;
      return;
    }

    state.second = btn;
    state.moves++;
    updateStats();

    if (state.first.dataset.key === btn.dataset.key) {
      handleMatch();
    } else {
      handleMismatch();
    }
  }

  function handleMatch() {
    [state.first, state.second].forEach((c) => {
      c.classList.add('matched');
      c.setAttribute('aria-disabled', 'true');
    });
    state.matched++;
    Sound.match(streak++);
    resetTurn();
    updateStats();
    if (state.matched === state.pairs) setTimeout(win, 600);
  }

  function handleMismatch() {
    state.lock = true;
    streak = 0;
    const pair = [state.first, state.second];
    setTimeout(() => { Sound.miss(); pair.forEach((c) => c.classList.add('wrong')); }, 350);
    setTimeout(() => {
      pair.forEach((c) => {
        c.classList.remove('flipped', 'wrong');
        c.setAttribute('aria-label', '뒤집힌 카드');
      });
      resetTurn();
    }, MISMATCH_DELAY);
  }

  function resetTurn() {
    state.first = null;
    state.second = null;
    state.lock = false;
  }

  function updateStats() {
    els.moves.textContent = state.moves;
    els.pairs.textContent = `${state.matched}/${state.pairs}`;
    const best = storage.get(bestKey());
    els.best.textContent = best ? `${best.moves}회 · ${fmtTime(best.time)}` : '—';
  }

  function win() {
    stopTimer();
    Sound.win();
    const result = { moves: state.moves, time: state.elapsed };
    const best = storage.get(bestKey());
    const isBest = !best || result.moves < best.moves ||
      (result.moves === best.moves && result.time < best.time);
    if (isBest) storage.set(bestKey(), result);

    const perfect = state.moves === state.pairs;
    els.winText.textContent =
      `${state.moves}번 시도, ${fmtTime(state.elapsed)} 만에 ${state.pairs}쌍을 모두 찾았어요!` +
      (perfect ? ' 완벽한 기억력! ✨' : '');
    els.winBest.hidden = !isBest;
    els.win.hidden = false;
    $('#again').focus();
    updateStats();
  }

  function newGame(pairs = state.pairs) {
    stopTimer();
    Object.assign(state, {
      pairs, first: null, second: null, lock: false,
      moves: 0, matched: 0, startTime: 0, elapsed: 0,
    });
    els.time.textContent = '0:00';
    els.win.hidden = true;

    document.querySelectorAll('.level').forEach((b) =>
      b.setAttribute('aria-checked', String(Number(b.dataset.pairs) === pairs)));

    board.style.setProperty('--cols', COLS[pairs] || 4);
    board.replaceChildren(...buildDeck(pairs).map(createCard));
    streak = 0;
    Sound.deal(pairs * 2);
    updateStats();
    storage.set('memory-match:level', pairs);
  }

  // ---------- 이벤트 ----------
  document.querySelectorAll('.level').forEach((b) =>
    b.addEventListener('click', () => newGame(Number(b.dataset.pairs))));
  $('#restart').addEventListener('click', () => newGame());
  const muteBtn = $('#mute');
  const renderMute = () => { muteBtn.textContent = Sound.muted ? '🔇' : '🔊'; };
  muteBtn.addEventListener('click', () => { Sound.unlock(); Sound.muted = !Sound.muted; renderMute(); });
  renderMute();
  // 첫 사용자 입력에서 오디오 시작 (브라우저 자동재생 정책)
  document.addEventListener('pointerdown', () => Sound.unlock(), { capture: true });
  document.addEventListener('keydown', () => Sound.unlock(), { capture: true });
  $('#again').addEventListener('click', () => newGame());
  els.win.addEventListener('click', (e) => { if (e.target === els.win) els.win.hidden = true; });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') els.win.hidden = true; });

  const savedLevel = Number(storage.get('memory-match:level'));
  newGame(COLS[savedLevel] ? savedLevel : 6);
})();
