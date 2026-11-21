/* Landing page · Lives Automatizadas com IA */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const body = document.body;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- preço e link de compra (tudo vem do <body>) ---------- */
  const price = (body.dataset.price || '').trim();
  if (price) $$('[data-p]').forEach(e => { e.textContent = price; });
  const checkout = (body.dataset.checkout || '').trim();
  const wa = 'https://wa.me/' + (body.dataset.wa || '5561985450132') + '?text=' +
    encodeURIComponent('Olá, João! Quero comprar o curso Lives Automatizadas com IA.');
  $$('[data-buy]').forEach(a => {
    if (/^https:\/\//.test(checkout)) { a.href = checkout; a.removeAttribute('target'); }
    else { a.href = wa; a.target = '_blank'; a.rel = 'noopener noreferrer'; }
  });
  $$('[data-year]').forEach(e => { e.textContent = new Date().getFullYear(); });

  /* ---------- topo, barra de progresso e barra de compra ---------- */
  const top = $('.top'), bar = $('#bar'), dock = $('#dock'), offer = $('#oferta'), hero = $('.hero');
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    top.classList.toggle('solid', y > 20);
    bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    const r = offer.getBoundingClientRect();
    const offerVisible = r.top < innerHeight && r.bottom > 0;
    dock.classList.toggle('on', y > hero.offsetHeight * .7 && !offerVisible);
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- revelar ao rolar ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: .12 });
  $$('.rv').forEach(el => io.observe(el));
  requestAnimationFrame(() => $('.hero h1').classList.add('in'));

  /* ---------- luz que segue o mouse nos cartões (sutil) ---------- */
  $$('.step').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));

  /* ---------- celular: inclina levemente com o mouse ---------- */
  const phone = $('#phone');
  if (phone && !reduce && matchMedia('(pointer:fine)').matches) {
    const stage = $('.stage');
    stage.addEventListener('pointermove', e => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      phone.style.transform = `rotateY(${-14 + x * 16}deg) rotateX(${6 - y * 10}deg) rotateZ(2deg)`;
    });
    stage.addEventListener('pointerleave', () => { phone.style.transform = ''; });
  }

  /* ---------- simulação da live (chat, corações, espectadores) ---------- */
  const chat = $('#chat'), hearts = $('#hearts'), vw = $('#vw');
  const names = ['Ana', 'Lucas', 'Bia', 'Rafa', 'Duda', 'Caio', 'Mari', 'Leo', 'Gabi', 'Theo', 'Júlia', 'Davi'];
  const lines = [
    'que live top 🔥', 'como faz isso??', 'tô assistindo do trabalho kkk', 'IA tá muito real',
    'boa noite pessoal', 'manda o link 🙏', 'primeira vez aqui', 'muito bom!!', 'quero aprender isso',
    'mandei um presente 🎁', 'isso roda sozinho mesmo?', 'salvei aqui'
  ];
  const colors = ['#1ad1ff', '#5b8cff', '#2ee59d', '#9db8ff', '#7ae7ff'];
  const pick = a => a[Math.floor(Math.random() * a.length)];
  let n = 0;
  const addMsg = () => {
    const li = document.createElement('li');
    const name = names[(n * 7) % names.length];
    const isBuy = n % 6 === 5;
    const av = document.createElement('span');
    av.className = 'av'; av.textContent = name[0];
    av.style.background = pick(colors);
    const p = document.createElement('span');
    const b = document.createElement('b'); b.textContent = name;
    p.append(b, isBuy ? 'comprou pelo link 🛒' : lines[(n * 5) % lines.length]);
    if (isBuy) li.className = 'buy';
    li.append(av, p);
    chat.append(li);
    while (chat.children.length > 8) chat.firstElementChild.remove();
    n++;
  };
  const heartSvg = '<svg viewBox="0 0 24 24"><use href="#i-heart"/></svg>';
  const addHeart = () => {
    const s = document.createElement('span');
    s.innerHTML = heartSvg;
    s.style.setProperty('--x', (Math.random() * 50 - 30).toFixed(0) + 'px');
    s.style.setProperty('--c', pick(colors));
    hearts.append(s);
    setTimeout(() => s.remove(), 2700);
  };
  let viewers = 1204;
  const tick = () => {
    viewers = Math.max(980, viewers + Math.round(Math.random() * 22 - 7));
    vw.textContent = viewers.toLocaleString('pt-BR');
  };

  for (let i = 0; i < 4; i++) addMsg();
  if (!reduce) {
    let timers = [];
    const start = () => {
      if (timers.length) return;
      timers = [setInterval(addMsg, 1500), setInterval(addHeart, 420), setInterval(tick, 1800)];
    };
    const stop = () => { timers.forEach(clearInterval); timers = []; };
    // só anima enquanto o celular estiver na tela (economiza bateria)
    new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop())).observe($('.stage'));
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  }

  /* ---------- aviso de cookies (LGPD) — mesma chave do site ---------- */
  const KEY = 'mdh_consent_v2', box = $('.cookie');
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem(KEY, JSON.stringify({ v, t: new Date().toISOString().slice(0, 10) })); } catch (e) {} }
  };
  const showCookie = on => {
    if (!box) return;
    box.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => box.classList.toggle('on', on)));
  };
  $$('[data-cookie]').forEach(b => b.addEventListener('click', () => {
    store.set(b.dataset.cookie); showCookie(false);
    document.dispatchEvent(new CustomEvent('mdh:consent', { detail: b.dataset.cookie }));
  }));
  $$('[data-cookie-open]').forEach(b => b.addEventListener('click', () => showCookie(true)));
  if (box && !store.get()) setTimeout(() => showCookie(true), 2200);
})();
