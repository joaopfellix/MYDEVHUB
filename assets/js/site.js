/* =========================================================
   My Dev Hub · animações e interações do site
   Sem bibliotecas externas, sem rastreadores, sem chaves.
   ========================================================= */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(pointer: fine)').matches;
  const WA = '5564992718193';
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- links de WhatsApp ---------- */
  $$('[data-wa]').forEach(a => {
    const msg = a.dataset.wa || 'Olá, João! Vim pelo site da My Dev Hub.';
    a.href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  });
  $$('a[target="_blank"]').forEach(a => { a.rel = 'noopener noreferrer'; });
  $$('[data-year]').forEach(e => { e.textContent = new Date().getFullYear(); });

  /* ---------- navegação ---------- */
  const nav = $('.nav');
  const burger = $('.burger');
  const bar = $('#bar');
  let lastY = scrollY;
  const setMenu = open => {
    nav.classList.toggle('open', open);
    burger && burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger && burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  $$('.menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  const waFloat = $('.wa-float');
  const onScroll = () => {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (nav) {
      nav.classList.toggle('solid', y > 20);
      if (!nav.classList.contains('open')) nav.classList.toggle('hide', y > 400 && y > lastY + 2);
      if (y < lastY - 2) nav.classList.remove('hide');
    }
    if (waFloat) waFloat.classList.toggle('on', y > innerHeight * 0.55);
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // item ativo do menu conforme a seção visível
  const links = $$('.menu a[href^="#"]');
  if (links.length && 'IntersectionObserver' in window) {
    const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.remove('on'));
          const l = map.get(e.target.id);
          l && l.classList.add('on');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const s = document.getElementById(id); s && io.observe(s); });
  }

  /* ---------- texto que sobe palavra por palavra ---------- */
  $$('[data-split]').forEach(el => {
    const parts = [];
    el.childNodes.forEach(n => {
      if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach(t => parts.push(t));
      else if (n.nodeType === 1 && n.children.length === 0 && /\s/.test(n.textContent.trim())) {
        // destaque com várias palavras: cada palavra ganha sua própria cópia do elemento
        n.textContent.split(/(\s+)/).forEach(t => {
          if (!t || /^\s+$/.test(t)) { if (t) parts.push(t); return; }
          const c = n.cloneNode(false); c.textContent = t; parts.push(c);
        });
      }
      else parts.push(n.cloneNode(true));
    });
    el.textContent = '';
    let i = 0;
    const base = parseFloat(el.dataset.delay || 0);
    parts.forEach(p => {
      if (typeof p === 'string') {
        if (!p) return;
        if (/^\s+$/.test(p)) { el.append(p.includes('\n') ? ' ' : p); return; }
      }
      if (p.nodeName === 'BR') { el.append(p); return; }
      const w = document.createElement('span'); w.className = 'w';
      const inner = document.createElement('span');
      inner.style.setProperty('--d', (base + i * 0.06).toFixed(2) + 's');
      typeof p === 'string' ? (inner.textContent = p) : inner.append(p);
      w.append(inner); el.append(w); i++;
    });
    el.classList.add('split');
  });

  /* ---------- revelar ao rolar ---------- */
  $$('[data-stagger]').forEach(g => {
    const step = parseFloat(g.dataset.stagger) || 0.1;
    $$(':scope > [data-reveal]', g).forEach((c, i) => c.style.setProperty('--d', (i * step).toFixed(2) + 's'));
  });
  $$('[data-delay]:not([data-split])').forEach(e => e.style.setProperty('--d', e.dataset.delay + 's'));
  const revealEls = $$('[data-reveal], .split:not(.hero .split), [data-count], .code-win');
  const onReveal = el => {
    el.classList.add('in');
    if (el.dataset.count !== undefined) countUp(el);
    if (el.classList.contains('code-win')) typeCode(el);
  };
  if ('IntersectionObserver' in window && !RM) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { onReveal(e.target); io.unobserve(e.target); }
    }), { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else revealEls.forEach(onReveal);

  /* ---------- contadores ---------- */
  function countUp(el) {
    const to = parseFloat(el.dataset.count);
    if (RM) { el.textContent = to; return; }
    const dur = 1600, t0 = performance.now();
    const tick = t => {
      const k = clamp((t - t0) / dur, 0, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - k, 4)));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- efeito "decodificar" ---------- */
  const GLYPHS = '</>{}[]#*&$%01';
  function scramble(el) {
    const final = el.textContent;
    if (RM) return;
    let frame = 0;
    const total = 26;
    const tick = () => {
      el.textContent = final.split('').map((ch, i) => {
        if (ch === ' ') return ' ';
        return frame / total > i / final.length ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }).join('');
      if (++frame <= total) setTimeout(tick, 42);
      else el.textContent = final;
    };
    tick();
  }

  /* ---------- entrada do herói ---------- */
  const hero = $('.hero, .page-hero');
  const startHero = () => {
    if (!hero) return;
    hero.classList.add('ready');
    $$('.split', hero).forEach(s => s.classList.add('in'));
    $$('[data-scramble]', hero).forEach(s => setTimeout(() => scramble(s), 650));
  };
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise(r => setTimeout(r, 900))]).then(() => requestAnimationFrame(startHero));

  /* ---------- canvas do herói: grade neon + partículas ---------- */
  const cv = $('#hero-canvas');
  if (cv) {
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1, running = true, t0 = performance.now();
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    let pts = [];
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(clamp(W * H / 16000, 26, 90));
      let seed = 7;
      const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      pts = Array.from({ length: n }, () => ({ x: rnd() * W, y: rnd() * H, vx: (rnd() - .5) * .25, vy: -(.08 + rnd() * .3), r: .6 + rnd() * 1.6 }));
    };
    const draw = now => {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      // chão em perspectiva
      const hz = H * 0.6, vx = W / 2;
      const g = ctx.createLinearGradient(0, hz, 0, H);
      g.addColorStop(0, 'rgba(22,70,255,0)'); g.addColorStop(1, 'rgba(22,70,255,.5)');
      ctx.strokeStyle = g; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = -16; i <= 16; i++) { ctx.moveTo(vx + i * 14, hz); ctx.lineTo(vx + i * W * 0.16, H); }
      const off = (t * 0.35) % 1;
      for (let j = 0; j < 14; j++) {
        const k = (j + off) / 14, y = hz + (H - hz) * k * k;
        ctx.moveTo(0, y); ctx.lineTo(W, y);
      }
      ctx.stroke();
      // brilho no horizonte
      const hg = ctx.createRadialGradient(vx, hz, 0, vx, hz, Math.max(W, H) * 0.42);
      hg.addColorStop(0, 'rgba(26,209,255,.2)'); hg.addColorStop(1, 'rgba(26,209,255,0)');
      ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H);
      // partículas
      mouse.x = lerp(mouse.x, mouse.tx, .12); mouse.y = lerp(mouse.y, mouse.ty, .12);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { p.x += dx * .015; p.y += dy * .015; }
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
      }
      ctx.lineWidth = .6;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < 9000) { ctx.strokeStyle = `rgba(26,209,255,${.16 * (1 - d2 / 9000)})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
      }
      for (const p of pts) {
        ctx.fillStyle = 'rgba(160,230,255,.85)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
      }
    };
    const loop = now => { if (!running) return; draw(now); requestAnimationFrame(loop); };
    resize();
    addEventListener('resize', () => { resize(); if (RM) draw(performance.now()); });
    if (RM) draw(performance.now());
    else {
      const io = new IntersectionObserver(([e]) => {
        const was = running; running = e.isIntersecting && !document.hidden;
        if (running && !was) requestAnimationFrame(loop);
      });
      io.observe(cv);
      document.addEventListener('visibilitychange', () => {
        const was = running; running = !document.hidden;
        if (running && !was) requestAnimationFrame(loop);
      });
      requestAnimationFrame(loop);
      cv.parentElement.addEventListener('pointermove', e => {
        const r = cv.getBoundingClientRect(); mouse.tx = e.clientX - r.left; mouse.ty = e.clientY - r.top;
      });
      cv.parentElement.addEventListener('pointerleave', () => { mouse.tx = mouse.ty = -9999; });
    }
  }

  /* ---------- foto do herói acompanha o mouse ---------- */
  const portrait = $('.portrait');
  if (portrait && FINE && !RM) {
    const img = $('img', portrait), chips = $$('.chip', portrait);
    let tx = 0, ty = 0, x = 0, y = 0;
    portrait.closest('section').addEventListener('pointermove', e => {
      tx = (e.clientX / innerWidth - .5); ty = (e.clientY / innerHeight - .5);
    });
    const tick = () => {
      x = lerp(x, tx, .08); y = lerp(y, ty, .08);
      portrait.style.transition = 'none'; if (img) img.style.transition = 'none';
      portrait.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 6}deg)`;
      if (img) img.style.transform = `scale(1.06) translate(${x * -10}px,${y * -10}px)`;
      chips.forEach((c, i) => { c.style.transform = `translate(${x * (18 + i * 10)}px,${y * (14 + i * 8)}px)`; });
      requestAnimationFrame(tick);
    };
    setTimeout(() => requestAnimationFrame(tick), 1400);
  }

  /* ---------- cards: brilho que segue o mouse + inclinação 3D ---------- */
  if (FINE) {
    $$('.card').forEach(c => {
      const tilt = c.hasAttribute('data-tilt') && !RM;
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        c.style.setProperty('--mx', (px * 100) + '%'); c.style.setProperty('--my', (py * 100) + '%');
        if (tilt) c.style.transform = `perspective(900px) rotateX(${(.5 - py) * 7}deg) rotateY(${(px - .5) * 7}deg) translateY(-4px)`;
      });
      c.addEventListener('pointerleave', () => { if (tilt) c.style.transform = ''; });
    });
  }

  /* ---------- botões magnéticos ---------- */
  if (FINE && !RM) {
    $$('[data-magnetic]').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .3}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }

  /* ---------- brilho que segue o cursor ---------- */
  const glow = $('.glow-cursor');
  if (glow && FINE && !RM) {
    let gx = innerWidth / 2, gy = innerHeight / 2, cx = gx, cy = gy;
    addEventListener('pointermove', e => { gx = e.clientX; gy = e.clientY; glow.style.opacity = 1; }, { passive: true });
    const tick = () => { cx = lerp(cx, gx, .1); cy = lerp(cy, gy, .1); glow.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(tick); };
    tick();
  }

  /* ---------- parallax e linha do processo ---------- */
  const para = $$('[data-parallax]');
  const steps = $('.steps');
  const stepEls = steps ? $$('.step', steps) : [];
  const line = steps ? $('.line', steps) : null;
  let ticking = false;
  const onFrame = () => {
    ticking = false;
    para.forEach(el => {
      const r = el.parentElement.getBoundingClientRect();
      const k = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      el.style.transform = `scale(1.07) translateY(${k * -22}px)`;
    });
    if (steps && line) {
      const r = steps.getBoundingClientRect();
      const p = clamp((innerHeight * .7 - r.top) / (r.height + innerHeight * .1), 0, 1);
      line.style.setProperty('--p', p.toFixed(3));
      stepEls.forEach((s, i) => s.classList.toggle('lit', p >= (i / stepEls.length) + .02 || p > .97));
    }
  };
  if (!RM && (para.length || steps)) {
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onFrame); } }, { passive: true });
    onFrame();
  } else if (steps) { stepEls.forEach(s => s.classList.add('lit')); line && line.style.setProperty('--p', 1); }

  /* ---------- faixa rolante infinita ---------- */
  $$('.marquee-track').forEach(t => {
    const clone = t.innerHTML;
    t.insertAdjacentHTML('beforeend', clone);
    $$(':scope > span', t).slice(t.children.length / 2).forEach(s => s.setAttribute('aria-hidden', 'true'));
  });

  /* ---------- janela de código digitando ---------- */
  function typeCode(win) {
    if (win.dataset.typed) return; win.dataset.typed = '1';
    const pre = $('pre', win);
    const code = [
      ['c', '// seu próximo site, em 4 linhas\n'],
      ['k', 'const '], ['f', 'site'], ['o', ' = '], ['k', 'new '], ['f', 'Site'], ['o', '({\n'],
      ['', '  negocio: '], ['s', '"Sua marca"'], ['o', ',\n'],
      ['', '  visual: '], ['s', '"premium e rápido"'], ['o', ',\n'],
      ['', '  whatsapp: '], ['k', 'true'], ['o', ',\n'],
      ['', '  google: '], ['s', '"aparecendo"'], ['o', '\n});\n\n'],
      ['f', 'site'], ['o', '.'], ['f', 'publicar'], ['o', '();\n'],
      ['c', '// ✓ no ar em 7 a 10 dias úteis']
    ];
    pre.textContent = '';
    const caret = document.createElement('span'); caret.className = 'caret';
    if (RM) {
      code.forEach(([c, t]) => { const s = document.createElement('span'); if (c) s.className = c; s.textContent = t; pre.append(s); });
      pre.append(caret); return;
    }
    pre.append(caret);
    let i = 0, j = 0, span = null;
    const tick = () => {
      if (i >= code.length) return;
      const [c, t] = code[i];
      if (!span) { span = document.createElement('span'); if (c) span.className = c; pre.insertBefore(span, caret); }
      span.textContent += t[j++];
      if (j >= t.length) { i++; j = 0; span = null; }
      setTimeout(tick, t[j - 1] === '\n' ? 140 : 22 + Math.random() * 40);
    };
    setTimeout(tick, 400);
  }

  /* ---------- FAQ: abre um por vez ---------- */
  $$('.faq details').forEach(d => d.addEventListener('toggle', () => {
    if (d.open) $$('.faq details').forEach(o => { if (o !== d) o.open = false; });
  }));

  /* ---------- aviso de cookies (LGPD) ---------- */
  const KEY = 'mdh_consent_v1';
  const box = $('.cookie');
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem(KEY, JSON.stringify({ v, t: new Date().toISOString().slice(0, 10) })); } catch (e) {} }
  };
  const showCookie = on => {
    if (!box) return;
    box.hidden = false;
    requestAnimationFrame(() => {
      box.classList.toggle('on', on);
      document.body.classList.toggle('has-cookie', on);
      document.body.style.setProperty('--cookie-h', on ? (box.offsetHeight + 16) + 'px' : '0px');
    });
  };
  $$('[data-cookie]').forEach(b => b.addEventListener('click', () => { store.set(b.dataset.cookie); showCookie(false); }));
  $$('[data-cookie-open]').forEach(b => b.addEventListener('click', () => showCookie(true)));
  if (box && !store.get()) setTimeout(() => showCookie(true), 1400);
  // Para o futuro: só carregar ferramentas de medição se window.MDH.consent() === 'all'
  window.MDH = Object.freeze({ consent: () => (store.get() || {}).v || null });
})();
