(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const body = document.body;
  const root = document.documentElement;
  const EMAIL = 'yuvalvermauv@gmail.com';

  /* ---------- split name into letters ---------- */
  $$('[data-split]').forEach(el => {
    const txt = el.textContent.trim();
    el.textContent = '';
    el.setAttribute('aria-hidden', 'true');
    [...txt].forEach((c, i) => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.style.setProperty('--i', i);
      s.textContent = c;
      el.appendChild(s);
    });
  });

  /* ---------- split about text into words (scroll scrub) ---------- */
  const scrub = $('#scrub');
  let scrubWords = [];
  if (scrub) {
    const text = scrub.textContent.trim().replace(/\s+/g, ' ');
    scrub.setAttribute('aria-label', text);
    scrub.textContent = '';
    text.split(' ').forEach((w, i, arr) => {
      const s = document.createElement('span');
      s.className = 'w';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = w + (i < arr.length - 1 ? ' ' : '');
      scrub.appendChild(s);
      scrubWords.push(s);
    });
  }

  /* ---------- voice bars ---------- */
  const bars = $('#bars');
  if (bars) {
    for (let i = 0; i < 30; i++) {
      const b = document.createElement('i');
      const mid = 1 - Math.abs(i - 14.5) / 15;
      b.style.setProperty('--h', Math.round(30 + mid * 55 + Math.random() * 15));
      b.style.setProperty('--dl', (Math.random() * 1.1).toFixed(2));
      bars.appendChild(b);
    }
  }

  /* ---------- marching-ants svg on cards ---------- */
  $$('.card').forEach(card => {
    const r = parseFloat(getComputedStyle(card).borderTopLeftRadius) || 26;
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'ants');
    svg.setAttribute('aria-hidden', 'true');
    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('rx', r);
    svg.appendChild(rect);
    card.appendChild(svg);
  });

  /* ---------- shutter flash ---------- */
  const flashEl = $('#flash');
  function shutter() {
    if (reduce) return;
    flashEl.classList.remove('pop');
    void flashEl.offsetWidth;
    flashEl.classList.add('pop');
  }

  /* ---------- reveals ---------- */
  let io;
  function startReveals() {
    io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
          if (e.target.querySelector('#term')) typeTerminal();
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('.reveal').forEach(el => io.observe(el));
  }

  /* ---------- terminal typewriter ---------- */
  let termStarted = false;
  function typeTerminal() {
    if (termStarted) return;
    termStarted = true;
    const el = $('#term');
    const lines = [
      ['<span class="k">$</span> python main.py', 0],
      ['<span class="dim">Student Utility Manager</span>', 0],
      ['  1. Tasks', 0],
      ['  2. Notes', 0],
      ['  3. Expenses', 0],
      ['  4. Events', 0],
      ['  5. Insights', 0],
      ['<span class="ok">✓ connected to MySQL</span>', 0]
    ];
    if (reduce) { el.innerHTML = lines.map(l => l[0]).join('\n'); return; }
    let li = 0;
    let out = '';
    const nextLine = () => {
      if (li >= lines.length) return;
      const html = lines[li][0];
      // type visible text char by char while keeping markup intact
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      const plain = tmp.textContent;
      let ci = 0;
      const step = () => {
        ci++;
        // rebuild: walk the html progressively by plain text length
        el.innerHTML = out + partial(html, ci) + '';
        if (ci < plain.length) setTimeout(step, 24);
        else { out += html + '\n'; li++; setTimeout(nextLine, 160); }
      };
      step();
    };
    function partial(html, n) {
      let count = 0, res = '', inTag = false, open = [];
      for (let i = 0; i < html.length; i++) {
        const ch = html[i];
        if (ch === '<') {
          inTag = true;
          const end = html.indexOf('>', i);
          const tag = html.slice(i, end + 1);
          res += tag;
          if (/^<\/span/.test(tag)) open.pop(); else open.push('span');
          i = end; inTag = false; continue;
        }
        if (count >= n) break;
        res += ch; count++;
      }
      return res + open.map(() => '</span>').join('');
    }
    nextLine();
  }

  /* =========================================================
     PRELOADER — kick-off clock + viewfinder focus pull
     ========================================================= */
  const loader = $('#loader');
  const minuteEl = $('#minute');
  const labelEl = $('#loaderLabel');
  const barEl = $('#loaderBar');
  let finished = false;

  function finish() {
    if (finished) return;
    finished = true;
    loader.classList.add('done');
    body.classList.remove('loading');
    body.classList.add('ready');
    shutter();
    startReveals();
    setTimeout(() => loader.remove(), 1400);
  }

  if (reduce) {
    finish();
  } else {
    const DURATION = 2100;
    const t0 = performance.now();
    const tick = now => {
      if (finished) return;
      const p = clamp((now - t0) / DURATION, 0, 1);
      const e = 1 - Math.pow(1 - p, 2.2);
      minuteEl.textContent = Math.round(e * 90);
      barEl.style.width = (e * 100) + '%';
      loader.style.setProperty('--blur', ((1 - e) * 14).toFixed(1) + 'px');
      if (p < 1) requestAnimationFrame(tick);
      else {
        labelEl.textContent = 'FULL TIME';
        labelEl.classList.add('ft');
        setTimeout(finish, 420);
      }
    };
    requestAnimationFrame(tick);
    $('#skip').addEventListener('click', finish);
  }
  setTimeout(finish, 6000); // fail-safe

  /* =========================================================
     CURSOR
     ========================================================= */
  const ring = $('#cursor');
  const dot = $('#cursorDot');
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  if (fine && !reduce) {
    root.classList.add('has-cursor');
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
    document.addEventListener('pointerover', e => {
      ring.classList.toggle('hover', !!e.target.closest('a, button, .card, [data-magnetic]'));
    });
    addEventListener('pointerdown', () => ring.classList.add('press'));
    addEventListener('pointerup', () => ring.classList.remove('press'));
  } else {
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });
  }

  /* ---------- magnetic buttons ---------- */
  if (fine && !reduce) {
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * 0.28}px, ${dy * 0.4}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- card spotlight + 3D tilt ---------- */
  $$('.card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      if (card.hasAttribute('data-tilt') && fine && !reduce) {
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', (px * 7).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (py * -7).toFixed(2) + 'deg');
      }
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });

  /* ---------- hero: mouse parallax + RGB split on the name ---------- */
  const hero = $('#home');
  const heroVisual = $('#heroVisual');
  const nameEl = $('#name');
  let tx = 0, ty = 0, cx = 0, cy = 0, split = 0;
  hero.addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width) * 2 - 1;
    ty = ((e.clientY - r.top) / r.height) * 2 - 1;
    split = clamp(split + (e.movementX || 0) * 0.22, -11, 11);
  });
  hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; });

  /* click the photo: shutter + refocus */
  const frame = $('#frame');
  const af = $('#af');
  const afState = $('#afState');
  function setAfState(txt, locked) {
    afState.textContent = txt;
    afState.classList.toggle('locked', !!locked);
  }
  setTimeout(() => setAfState('LOCKED', true), 3400);
  frame.addEventListener('click', () => {
    shutter();
    setAfState('FOCUSING', false);
    af.classList.remove('again');
    void af.offsetWidth;
    af.classList.add('again');
    setTimeout(() => setAfState('LOCKED', true), 1100);
  });

  /* =========================================================
     BACKGROUND: signal network
     ========================================================= */
  const bg = $('#bg');
  const bctx = bg.getContext('2d');
  let W = 0, H = 0, pts = [];
  function sizeBg() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    bg.width = W * dpr; bg.height = H * dpr;
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(70, Math.floor((W * H) / 24000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.32, vy: (Math.random() - 0.5) * 0.32,
      r: Math.random() * 1.3 + 0.5
    }));
  }
  sizeBg();
  addEventListener('resize', sizeBg);

  function drawBg() {
    bctx.clearRect(0, 0, W, H);
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10;
      const dxm = p.x - mx, dym = p.y - my;
      const dm = Math.hypot(dxm, dym);
      if (dm < 140 && dm > 0) { p.x += (dxm / dm) * 0.6; p.y += (dym / dm) * 0.6; }
      bctx.beginPath();
      bctx.arc(p.x, p.y, p.r, 0, 6.283);
      bctx.fillStyle = 'rgba(125,211,252,.55)';
      bctx.fill();
      for (let j = i + 1; j < pts.length; j++) {
        const q = pts[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 125) {
          bctx.strokeStyle = `rgba(125,211,252,${(1 - d / 125) * 0.17})`;
          bctx.lineWidth = 1;
          bctx.beginPath(); bctx.moveTo(p.x, p.y); bctx.lineTo(q.x, q.y); bctx.stroke();
        }
      }
      if (dm < 170) {
        bctx.strokeStyle = `rgba(167,139,250,${(1 - dm / 170) * 0.5})`;
        bctx.beginPath(); bctx.moveTo(p.x, p.y); bctx.lineTo(mx, my); bctx.stroke();
      }
    }
  }

  /* =========================================================
     OSCILLOSCOPE (about)
     ========================================================= */
  const scope = $('#scope');
  const sctx = scope ? scope.getContext('2d') : null;
  let scopeVisible = false, sw = 0, sh = 0;
  function sizeScope() {
    if (!scope) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const r = scope.getBoundingClientRect();
    sw = r.width; sh = r.height;
    scope.width = sw * dpr; scope.height = sh * dpr;
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  if (scope) {
    sizeScope();
    addEventListener('resize', sizeScope);
    new IntersectionObserver(es => { scopeVisible = es[0].isIntersecting; if (scopeVisible) sizeScope(); }).observe(scope);
  }
  function drawScope(t) {
    sctx.clearRect(0, 0, sw, sh);
    sctx.strokeStyle = 'rgba(125,211,252,.08)';
    sctx.lineWidth = 1;
    for (let i = 1; i < 8; i++) { sctx.beginPath(); sctx.moveTo((sw / 8) * i, 0); sctx.lineTo((sw / 8) * i, sh); sctx.stroke(); }
    for (let i = 1; i < 6; i++) { sctx.beginPath(); sctx.moveTo(0, (sh / 6) * i); sctx.lineTo(sw, (sh / 6) * i); sctx.stroke(); }
    const k = 0.018 + (mx / innerWidth) * 0.02;
    const amp = sh * (0.2 + Math.min(Math.abs(scrollVel) * 0.012, 0.15));
    const s = t * 0.002;
    // channel 2 (violet)
    sctx.beginPath();
    for (let x = 0; x <= sw; x += 3) {
      const y = sh / 2 + Math.sin(x * k * 0.5 + s * 0.7) * amp * 0.55 + Math.sin(x * k * 1.6 - s) * amp * 0.18;
      x === 0 ? sctx.moveTo(x, y) : sctx.lineTo(x, y);
    }
    sctx.strokeStyle = 'rgba(167,139,250,.55)'; sctx.lineWidth = 1.5; sctx.stroke();
    // channel 1 (cyan, square-ish harmonics)
    sctx.beginPath();
    for (let x = 0; x <= sw; x += 2) {
      const a = x * k + s;
      const y = sh / 2 - (Math.sin(a) + Math.sin(3 * a) / 3 + Math.sin(5 * a) / 5) * amp * 0.75;
      x === 0 ? sctx.moveTo(x, y) : sctx.lineTo(x, y);
    }
    sctx.shadowColor = 'rgba(125,211,252,.9)'; sctx.shadowBlur = 10;
    sctx.strokeStyle = '#7dd3fc'; sctx.lineWidth = 2; sctx.stroke();
    sctx.shadowBlur = 0;
  }

  /* =========================================================
     MARQUEE (speeds up with scroll)
     ========================================================= */
  const tracks = $$('.marquee-track').map((el, i) => {
    el.innerHTML = el.innerHTML + el.innerHTML;
    return { el, x: 0, dir: i % 2 === 0 ? -1 : 1, half: 0 };
  });
  function measureMarquee() { tracks.forEach(t => { t.half = t.el.scrollWidth / 2; if (t.dir > 0) t.x = -t.half; }); }
  addEventListener('load', measureMarquee);
  addEventListener('resize', measureMarquee);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureMarquee);
  measureMarquee();

  /* =========================================================
     SCROLL: progress, header, nav + layers, word scrub
     ========================================================= */
  const header = $('#header');
  const progress = $('#progress');
  const orbit = $('#orbit');
  let lastY = scrollY, scrollVel = 0, dirDown = true;

  function onScroll() {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    header.classList.toggle('scrolled', y > 30);
    if (!body.classList.contains('menu-open')) header.classList.toggle('hide', y > 260 && y > lastY + 2);
    if (y < lastY - 2) header.classList.remove('hide');
    lastY = y;

    if (scrubWords.length) {
      const r = scrub.getBoundingClientRect();
      const p = clamp((innerHeight * 0.82 - r.top) / (r.height + innerHeight * 0.3), 0, 1);
      const n = Math.round(p * scrubWords.length * 1.05);
      scrubWords.forEach((w, i) => w.classList.toggle('on', i < n));
    }
    if (orbit) orbit.style.transform = `rotate(${y * 0.06}deg)`;
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const ids = ['home', 'about', 'education', 'projects', 'learning', 'contact'];
  const secObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      $$('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === id));
      $$('[data-layer]').forEach(a => a.classList.toggle('active', a.dataset.layer === id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ids.forEach(id => { const s = document.getElementById(id); if (s) secObs.observe(s); });

  /* ---------- mobile menu ---------- */
  const toggle = $('.menu-toggle');
  const nav = $('#nav');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open);
    header.classList.remove('hide');
  });
  $$('.nav a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
  }));

  /* ---------- toast + copy email ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }
  $('#copyEmail').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = EMAIL; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (__) {}
      ta.remove();
    }
    toast('Email copied ✓');
  });

  /* =========================================================
     GOAL! (press G or tap the footer button)
     ========================================================= */
  const cf = $('#confetti');
  const cfx = cf.getContext('2d');
  const goalEl = $('#goal');
  let confetti = [], cfRunning = false;
  function sizeCf() { cf.width = innerWidth; cf.height = innerHeight; }
  sizeCf();
  addEventListener('resize', sizeCf);
  function goal() {
    if (reduce) { toast('GOAL! ⚽'); return; }
    goalEl.classList.remove('show'); void goalEl.offsetWidth; goalEl.classList.add('show');
    const colors = ['#b8ff3d', '#7dd3fc', '#a78bfa', '#ffffff', '#ff4d8d'];
    for (let i = 0; i < 190; i++) {
      const side = i % 2 ? 1 : -1;
      confetti.push({
        x: innerWidth / 2 + side * innerWidth * 0.1,
        y: innerHeight * 0.95,
        vx: (Math.random() - 0.5) * 26,
        vy: -(Math.random() * 19 + 9),
        w: Math.random() * 9 + 5, h: Math.random() * 5 + 3,
        rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4,
        c: colors[(Math.random() * colors.length) | 0], life: 1
      });
    }
    if (!cfRunning) { cfRunning = true; requestAnimationFrame(drawConfetti); }
  }
  function drawConfetti() {
    cfx.clearRect(0, 0, cf.width, cf.height);
    confetti.forEach(p => {
      p.vy += 0.32; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      if (p.y > innerHeight + 30) p.life = 0;
      cfx.save(); cfx.translate(p.x, p.y); cfx.rotate(p.rot);
      cfx.fillStyle = p.c; cfx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      cfx.restore();
    });
    confetti = confetti.filter(p => p.life > 0);
    if (confetti.length) requestAnimationFrame(drawConfetti);
    else { cfRunning = false; cfx.clearRect(0, 0, cf.width, cf.height); }
  }
  addEventListener('keydown', e => {
    if ((e.key === 'g' || e.key === 'G') && !e.metaKey && !e.ctrlKey && !e.altKey) goal();
  });
  $('#egg').addEventListener('click', goal);

  /* ---------- protect the photo & logo from right-click saving only ---------- */
  document.addEventListener('contextmenu', e => { if (e.target.tagName === 'IMG') e.preventDefault(); });

  /* =========================================================
     MASTER LOOP
     ========================================================= */
  let lastScrollY = scrollY;
  function loop(t) {
    // scroll velocity (smoothed)
    const dy = scrollY - lastScrollY; lastScrollY = scrollY;
    scrollVel = lerp(scrollVel, dy, 0.12);

    // cursor
    if (root.classList.contains('has-cursor')) {
      rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18);
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    }

    // hero parallax + RGB split
    cx = lerp(cx, tx, 0.07); cy = lerp(cy, ty, 0.07);
    split *= 0.9;
    if (!reduce) {
      heroVisual.style.setProperty('--tx', cx.toFixed(3));
      heroVisual.style.setProperty('--ty', cy.toFixed(3));
      nameEl.style.setProperty('--rx', split.toFixed(2));
    }

    // marquee
    if (!reduce) {
      const boost = Math.min(Math.abs(scrollVel) * 0.7, 18);
      tracks.forEach(tr => {
        if (!tr.half) tr.half = tr.el.scrollWidth / 2;
        tr.x += tr.dir * (0.8 + boost);
        if (tr.dir < 0 && tr.x <= -tr.half) tr.x += tr.half;
        if (tr.dir > 0 && tr.x >= 0) tr.x -= tr.half;
        tr.el.style.transform = `translate3d(${tr.x}px,0,0)`;
      });
    }

    if (!reduce && !document.hidden) drawBg();
    if (scopeVisible && !reduce) drawScope(t);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  if (reduce) { drawBg(); }
})();


document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});
