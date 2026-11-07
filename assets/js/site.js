/* =========================================================
   My Dev Hub · interações do site (v2)
   Sem bibliotecas, sem rastreadores, sem chaves no código.
   ========================================================= */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const WA = '5564992718193';
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const waLink = msg => 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);

  /* ---------- links ---------- */
  $$('[data-wa]').forEach(a => {
    a.href = waLink(a.dataset.wa || 'Olá, João! Vim pelo site da My Dev Hub.');
    a.target = '_blank'; a.rel = 'noopener noreferrer';
  });
  $$('a[target="_blank"]').forEach(a => { a.rel = 'noopener noreferrer'; });
  $$('[data-year]').forEach(e => { e.textContent = new Date().getFullYear(); });

  /* ---------- cabeçalho de vidro ---------- */
  const head = $('.head'), headIn = $('.head-in'), menuBtn = $('.menu-btn'), bar = $('#bar');
  const setMenu = open => {
    head.classList.toggle('open', open);
    menuBtn && menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn && (menuBtn.querySelector('b').textContent = open ? 'Fechar' : 'Menu');
  };
  menuBtn && menuBtn.addEventListener('click', () => setMenu(!head.classList.contains('open')));
  $$('.sheet a').forEach((a, i) => a.style.setProperty('--d', (0.04 + i * 0.035).toFixed(3) + 's'));
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', e => { if (head.classList.contains('open') && !head.contains(e.target)) setMenu(false); });

  // indicador que desliza entre as abas
  const tabs = $('.tabs'), ind = $('.tab-ind');
  if (tabs && ind) {
    const cur = $('a[aria-current="page"]', tabs);
    const moveTo = a => {
      if (!a) { ind.style.opacity = 0; return; }
      ind.style.width = a.offsetWidth + 'px';
      ind.style.transform = `translateX(${a.offsetLeft}px)`;
      ind.style.opacity = 1;
    };
    $$('a', tabs).forEach(a => a.addEventListener('pointerenter', () => moveTo(a)));
    tabs.addEventListener('pointerleave', () => moveTo(cur));
    const place = () => { ind.style.transition = 'none'; moveTo(cur); ind.offsetWidth; ind.style.transition = ''; };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(place);
    addEventListener('resize', place);
  }
  // brilho na borda do vidro acompanha o mouse
  if (headIn && FINE && !RM) headIn.addEventListener('pointermove', e => {
    const r = headIn.getBoundingClientRect();
    headIn.style.setProperty('--sheen', (100 - (e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
  });

  let lastY = scrollY;
  const waFloat = $('.wa-float');
  const onScroll = () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    head.classList.toggle('scrolled', y > 24);
    if (!head.classList.contains('open')) {
      if (y > 480 && y > lastY + 4) head.classList.add('away');
      else if (y < lastY - 4 || y < 480) head.classList.remove('away');
    }
    if (waFloat) waFloat.classList.toggle('on', y > innerHeight * 0.4);
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- grade de pontos que acende sob o cursor ---------- */
  const lit = $('.dots-lit');
  if (lit && FINE && !RM) {
    let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty, running = false, idle;
    const tick = () => {
      x = lerp(x, tx, 0.14); y = lerp(y, ty, 0.14);
      lit.style.setProperty('--cx', x.toFixed(1) + 'px'); lit.style.setProperty('--cy', y.toFixed(1) + 'px');
      if (Math.abs(x - tx) + Math.abs(y - ty) > 0.4) requestAnimationFrame(tick); else running = false;
    };
    addEventListener('pointermove', e => {
      tx = e.clientX; ty = e.clientY; lit.classList.add('on');
      clearTimeout(idle); idle = setTimeout(() => lit.classList.remove('on'), 1800);
      if (!running) { running = true; requestAnimationFrame(tick); }
    }, { passive: true });
    document.addEventListener('pointerleave', () => lit.classList.remove('on'));
  }

  /* ---------- odômetro (R$1.000 rolando) ---------- */
  $$('.odo').forEach(o => {
    const txt = o.textContent.trim();
    o.setAttribute('aria-label', txt);
    o.textContent = '';
    let k = 0;
    [...txt].forEach(ch => {
      if (/\d/.test(ch)) {
        const col = document.createElement('span'); col.className = 'col'; col.setAttribute('aria-hidden', 'true');
        const strip = document.createElement('span');
        for (let i = 0; i < 20; i++) { const d = document.createElement('i'); d.textContent = i % 10; strip.append(d); }
        strip.dataset.to = 10 + +ch;
        strip.style.setProperty('--d', (k++ * 0.12).toFixed(2) + 's');
        col.append(strip); o.append(col);
      } else { const s = document.createElement('span'); s.setAttribute('aria-hidden', 'true'); s.textContent = ch; o.append(s); }
    });
  });
  const rollOdo = root => $$('.odo .col>span', root).forEach(s => {
    s.style.transform = `translateY(${-1.06 * s.dataset.to}em)`;
    const w = s.children[s.dataset.to].offsetWidth; if (w) s.parentNode.style.width = w + 'px';
  });

  /* ---------- títulos que sobem palavra por palavra ---------- */
  $$('[data-sp]').forEach(el => {
    const parts = [];
    el.childNodes.forEach(n => {
      if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach(t => parts.push(t));
      else if (n.nodeType === 1 && n.children.length === 0 && /\s/.test(n.textContent.trim())) {
        n.textContent.split(/(\s+)/).forEach(t => {
          if (!t) return;
          if (/^\s+$/.test(t)) { parts.push(t); return; }
          const c = n.cloneNode(false); c.textContent = t; parts.push(c);
        });
      } else parts.push(n);
    });
    el.textContent = '';
    const base = parseFloat(el.dataset.sp) || 0;
    let i = 0;
    parts.forEach(p => {
      if (typeof p === 'string') { if (!p) return; if (/^\s+$/.test(p)) { el.append(' '); return; } }
      else if (p.nodeName === 'BR') { el.append(p); return; }
      const w = document.createElement('span'); w.className = 'w';
      const inner = document.createElement('span');
      inner.style.setProperty('--d', (base + i++ * 0.055).toFixed(3) + 's');
      typeof p === 'string' ? (inner.textContent = p) : inner.append(p);
      w.append(inner); el.append(w);
    });
    el.classList.add('sp');
  });

  /* ---------- revelar ao rolar ---------- */
  $$('[data-st]').forEach(g => {
    const step = parseFloat(g.dataset.st) || 0.08;
    $$(':scope > [data-r]', g).forEach((c, i) => c.style.setProperty('--d', (i * step).toFixed(2) + 's'));
  });
  $$('[data-d]').forEach(e => e.style.setProperty('--d', e.dataset.d + 's'));
  const hero = $('.hero');
  const inHero = el => hero && hero.contains(el);
  const onReveal = el => {
    el.classList.add('in');
    if ($('.odo', el)) rollOdo(el);
    if (el.dataset.count !== undefined) countUp(el);
    if (el.classList.contains('app')) runApp(el);
  };
  const targets = $$('[data-r], .sp, [data-count], .app').filter(el => !inHero(el) || el.classList.contains('app'));
  if ('IntersectionObserver' in window && !RM) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { onReveal(e.target); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: '0px 0px -5% 0px' });
    targets.forEach(el => io.observe(el));
  } else targets.forEach(onReveal);

  // herói: entra quando as fontes carregam
  const startHero = () => {
    if (!hero) return;
    hero.classList.add('ready');
    $$('.sp', hero).forEach(s => s.classList.add('in'));
    setTimeout(() => rollOdo(hero), 500);
  };
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise(r => setTimeout(r, 900))]).then(() => requestAnimationFrame(startHero));

  function countUp(el) {
    const to = parseFloat(el.dataset.count), pre = el.dataset.pre || '';
    if (RM) { el.textContent = pre + to; return; }
    const t0 = performance.now(), dur = 1500;
    const tick = t => { const k = clamp((t - t0) / dur, 0, 1); el.textContent = pre + Math.round(to * (1 - Math.pow(1 - k, 4))); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }

  /* ---------- painel do curso ganhando vida ---------- */
  function runApp(app) {
    app.classList.add('live');
    const items = $$('.mods li', app);
    if (RM) { items.slice(0, 2).forEach(li => li.classList.add('done')); items[2] && items[2].classList.add('now'); return; }
    items.forEach((li, i) => {
      if (i < 2) setTimeout(() => { li.classList.remove('now'); li.classList.add('done'); }, 700 + i * 650);
      if (i <= 2) setTimeout(() => { li.classList.add('now'); }, 350 + i * 650);
    });
  }

  /* ---------- texto que acende conforme rola ---------- */
  const rts = $$('.reveal-text');
  rts.forEach(rt => {
    const parts = [];
    rt.childNodes.forEach(n => {
      const hl = n.nodeType === 1;
      n.textContent.split(/(\s+)/).forEach(t => { if (t) parts.push([t, hl]); });
    });
    rt.textContent = '';
    parts.forEach(([t, hl]) => {
      if (/^\s+$/.test(t)) { rt.append(' '); return; }
      const s = document.createElement('span'); s.className = 'wd' + (hl ? ' hl' : ''); s.textContent = t; rt.append(s);
    });
  });

  /* ---------- módulos + medidor ---------- */
  const track = $('.track'), modules = track ? $$('.module', track) : [], meter = $('.meter');
  const meterVal = meter && $('.val b', meter), meterLine = meter && $('.line', meter);
  const fmt = v => v.toLocaleString('pt-BR');

  /* ---------- parallax leve das fotos ---------- */
  const pars = $$('[data-par]');

  let ticking = false;
  const frame = () => {
    ticking = false;
    const vh = innerHeight;
    rts.forEach(rt => {
      const r = rt.getBoundingClientRect();
      const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0, 1);
      const ws = rt.children, n = Math.round(p * ws.length);
      for (let i = 0; i < ws.length; i++) ws[i].classList.toggle('on', i < n);
    });
    if (track) {
      const r = track.getBoundingClientRect();
      const p = clamp((vh * 0.5 - r.top) / (r.height - vh * 0.3), 0, 1);
      let best = 0, bd = 1e9;
      modules.forEach((m, i) => { const mr = m.getBoundingClientRect(); const d = Math.abs(mr.top + mr.height / 2 - vh * 0.5); if (d < bd) { bd = d; best = i; } });
      modules.forEach((m, i) => m.classList.toggle('active', i === best));
      if (meterVal) meterVal.textContent = fmt(Math.round((100 + p * 900) / 10) * 10);
      if (meterLine) meterLine.style.setProperty('--p', (0.1 + p * 0.9).toFixed(3));
    }
    pars.forEach(img => {
      const r = img.parentElement.getBoundingClientRect();
      const k = (r.top + r.height / 2 - vh / 2) / vh;
      img.style.transform = `scale(1.06) translateY(${(k * -18).toFixed(1)}px)`;
    });
  };
  if (!RM && (rts.length || track || pars.length)) {
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
    addEventListener('resize', frame);
    frame();
  } else {
    rts.forEach(rt => $$('.wd', rt).forEach(w => w.classList.add('on')));
    modules.forEach(m => m.classList.add('active'));
  }

  /* ---------- cards e botões: luz que segue o cursor ---------- */
  if (FINE) {
    $$('.card').forEach(c => c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }));
    $$('.btn').forEach(b => b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      b.style.setProperty('--bx', (e.clientX - r.left) + 'px'); b.style.setProperty('--by', (e.clientY - r.top) + 'px');
    }));
  }

  /* ---------- portfólio: a página rola dentro do navegador ---------- */
  $$('.case').forEach(c => {
    const scr = $('.screen', c), img = $('.screen img', c);
    if (!scr || !img) return;
    const set = () => c.style.setProperty('--scroll', Math.min(0, -(img.offsetHeight - scr.offsetHeight + 34)) + 'px');
    img.complete ? set() : img.addEventListener('load', set);
    addEventListener('resize', set);
  });

  /* ---------- perguntas: abre e fecha com suavidade ---------- */
  $$('.faq details').forEach(d => {
    const sum = $('summary', d), ans = $('.ans', d);
    sum.addEventListener('click', e => {
      if (RM || !ans.animate) return;
      e.preventDefault();
      if (d.open) {
        const a = ans.animate([{ height: ans.offsetHeight + 'px' }, { height: '0px' }], { duration: 380, easing: 'cubic-bezier(.4,0,.2,1)' });
        a.onfinish = () => { d.open = false; };
      } else {
        $$('.faq details[open]').forEach(o => { if (o !== d) o.open = false; });
        d.open = true;
        ans.animate([{ height: '0px', opacity: 0 }, { height: ans.offsetHeight + 'px', opacity: 1 }], { duration: 480, easing: 'cubic-bezier(.16,1,.3,1)' });
      }
    });
  });

  /* ---------- contato: monta a mensagem e abre o WhatsApp ---------- */
  const form = $('#zap-form');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const nome = form.nome.value.trim(), assunto = (form.querySelector('input[name="assunto"]:checked') || {}).value || 'Outro', msg = form.msg.value.trim();
    if (!nome) { form.nome.focus(); return; }
    const txt = `Olá, João! Me chamo ${nome}.\nAssunto: ${assunto}` + (msg ? `\n\n${msg}` : '') + '\n\n(Enviado pelo site mydevhub.club)';
    window.open(waLink(txt), '_blank', 'noopener');
  });

  /* ---------- aviso de cookies (LGPD) ---------- */
  const KEY = 'mdh_consent_v1', box = $('.cookie');
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem(KEY, JSON.stringify({ v, t: new Date().toISOString().slice(0, 10) })); } catch (e) {} }
  };
  const showCookie = on => {
    if (!box) return;
    box.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      box.classList.toggle('on', on);
      document.body.classList.toggle('cookie-open', on);
      document.body.style.setProperty('--ch', on ? (box.offsetHeight + 14) + 'px' : '0px');
    }));
  };
  $$('[data-cookie]').forEach(b => b.addEventListener('click', () => { store.set(b.dataset.cookie); showCookie(false); }));
  $$('[data-cookie-open]').forEach(b => b.addEventListener('click', () => showCookie(true)));
  if (box && !store.get()) setTimeout(() => showCookie(true), 1600);
  window.MDH = Object.freeze({ consent: () => (store.get() || {}).v || null });
})();
