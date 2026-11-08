/* Medição de visitas e anúncios (Pixel da Meta + Metricool).
   Só carrega se a pessoa clicar em "Aceitar" no aviso de cookies (LGPD).
   Para ligar o Pixel, coloque o ID dele em PIXEL_ID (só números). */
(() => {
  'use strict';
  const PIXEL_ID = '';                                   // ex.: '1234567890123456'
  const METRICOOL_HASH = '707d638ccd7085221b641e24dc5801d'; // marca mydevhub.club no Metricool

  const path = location.pathname;
  const isPlan = /\/cursos\/plano-[a-z]+\/?$/.test(path);
  const isThanks = /\/obrigado\/?$/.test(path);
  const CHECKOUT = /^https:\/\/(syncpaycheckout\.com|link\.syncpayments\.com\.br)\//;
  const prices = { 'plano-inicial': 27, 'plano-intermediario': 97, 'plano-avancado': 197 };
  const plan = (path.match(/plano-[a-z]+/) || [])[0];

  const load = (src, onload) => {
    const s = document.createElement('script');
    s.async = true; s.src = src; if (onload) s.onload = onload;
    document.head.appendChild(s);
  };

  let started = false;
  const start = () => {
    if (started) return; started = true;

    // Metricool: visitas e de onde vieram
    if (METRICOOL_HASH) {
      load('https://tracker.metricool.com/resources/be.js', () => {
        try { window.beTracker.t({ hash: METRICOOL_HASH }); } catch (e) {}
      });
    }

    // Pixel da Meta
    if (!/^\d{10,20}$/.test(PIXEL_ID)) return;
    const n = window.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!window._fbq) window._fbq = n;
    n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
    load('https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', PIXEL_ID);
    fbq('track', 'PageView');
    if (isPlan && plan) fbq('track', 'ViewContent', { content_name: plan, value: prices[plan], currency: 'BRL' });
    if (isThanks) {
      let last = null; try { last = sessionStorage.getItem('mdh_plan'); } catch (e) {}
      fbq('track', 'Purchase', last && prices[last] ? { content_name: last, value: prices[last], currency: 'BRL' } : { currency: 'BRL', value: 0 });
    }

    // clique no botão de compra (checkout da Sync Pay)
    document.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('a[href]');
      if (!a || !CHECKOUT.test(a.href)) return;
      try { if (plan) sessionStorage.setItem('mdh_plan', plan); } catch (e) {}
      fbq('track', 'InitiateCheckout', plan ? { content_name: plan, value: prices[plan], currency: 'BRL' } : { currency: 'BRL' });
    }, true);
  };

  const consent = () => {
    try { return (JSON.parse(localStorage.getItem('mdh_consent_v2')) || {}).v; } catch (e) { return null; }
  };
  if (consent() === 'all') start();
  document.addEventListener('mdh:consent', e => { if (e.detail === 'all') start(); });
})();
