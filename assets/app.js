/* Kaya Global Agency — shared site script (all languages).
   Per-language strings come from window.KD_I18N, defined inline in each page. */

/* ===== ONE place to change the contact e-mail ===== */
var KD_CONFIG = {
  email: 'hello@kayaglobalagency.com',
  siteUrl: 'https://kayaglobalagency.com'
};

(function () {
  'use strict';
  var T = window.KD_I18N || {};
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  root.classList.add('js');

  /* --- local preview (file://): make folder links open index.html --- */
  if (location.protocol === 'file:') {
    $$('a[href]').forEach(function (a) {
      var h = a.getAttribute('href');
      if (/^(https?:|mailto:|#)/.test(h)) return;
      var parts = h.split('#');
      if (/\/$/.test(parts[0]) || parts[0] === '..' || parts[0] === '.') {
        parts[0] = parts[0].replace(/\/?$/, '/') + 'index.html';
        a.setAttribute('href', parts.join('#'));
      }
    });
  }

  /* --- e-mail everywhere from KD_CONFIG --- */
  $$('[data-email]').forEach(function (el) {
    el.textContent = KD_CONFIG.email;
    if (el.tagName === 'A') el.href = 'mailto:' + KD_CONFIG.email;
  });

  /* --- structured data (schema.org) --- */
  if (T.lang && !d.querySelector('[data-page="privacy"]')) {
    var ld = d.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({
      '@context': 'https://schema.org', '@type': 'ProfessionalService',
      name: 'Kaya Global Agency', url: KD_CONFIG.siteUrl + '/' + T.lang + '/',
      email: KD_CONFIG.email, priceRange: '$39 - $450', inLanguage: T.lang,
      description: T.ldDesc || '',
      areaServed: 'Worldwide', address: { '@type': 'PostalAddress', streetAddress: '13208 Myford Rd #343', addressLocality: 'Tustin', addressRegion: 'CA', postalCode: '92782', addressCountry: 'US' }, legalName: 'KAYA GLOBAL TRANSPORTATION LLC',
      knowsLanguage: ['en', 'es', 'tr']
    });
    d.head.appendChild(ld);
  }

  /* --- header --- */
  var header = $('.site-header');
  var onScroll = function () { if (header) header.classList.toggle('scrolled', scrollY > 8); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var mb = $('.menu-btn'), nl = $('.nav-links');
  if (mb && nl) {
    mb.addEventListener('click', function () {
      var o = nl.classList.toggle('open'); mb.setAttribute('aria-expanded', o);
    });
    $$('a', nl).forEach(function (a) { a.addEventListener('click', function () { nl.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); }); });
  }

  /* --- language switcher keeps the current section --- */
  var langLinks = $$('.lang a[data-base], .foot-lang a[data-base]');
  var setLangHash = function (id) {
    langLinks.forEach(function (a) {
      var base = a.getAttribute('data-base');
      if (location.protocol === 'file:' && /\/$/.test(base)) base += 'index.html';
      a.setAttribute('href', base + (id ? '#' + id : ''));
    });
  };
  setLangHash(location.hash.slice(1));
  var sections = $$('main section[id]');
  if ('IntersectionObserver' in window && sections.length) {
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) setLangHash(e.target.id === 'top' ? '' : e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { so.observe(s); });
  }

  /* --- reveal on scroll --- */
  var rvs = $$('.rv');
  if (!reduce && 'IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rvs.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < (window.innerHeight || 800)) el.classList.add('in'); else ro.observe(el);
    });
    /* guvenlik agi: gozlemci calismazsa 2.5 sn sonra her seyi goster */
    setTimeout(function () { rvs.forEach(function (el) { el.classList.add('in'); }); }, 2500);
  } else rvs.forEach(function (el) { el.classList.add('in'); });

  /* --- card spotlight + magnetic CTAs (fine pointers only) --- */
  var fine = window.matchMedia && matchMedia('(pointer: fine)').matches;
  if (fine && !reduce) {
    $$('.card').forEach(function (c) {
      c.addEventListener('pointermove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--px', (e.clientX - r.left) + 'px');
        c.style.setProperty('--py', (e.clientY - r.top) + 'px');
      });
    });
    $$('.magnetic').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.setProperty('--mx', ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px');
        b.style.setProperty('--my', ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px');
      });
      b.addEventListener('pointerleave', function () { b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); });
    });
  }

  /* --- CTA intent preselect --- */
  var intentSel = $('#f-intent');
  d.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-intent]');
    if (t && intentSel) intentSel.value = t.getAttribute('data-intent');
  });

  /* --- pricing toggle --- */
  var money = function (n) { var r = Math.round(n * 100) / 100; return '$' + (r % 1 === 0 ? r.toFixed(0) : r.toFixed(2)); };
  var seg = $('.seg'), thumb = seg && $('.thumb', seg);
  var moveThumb = function (btn) {
    if (!thumb || !btn) return;
    thumb.style.width = btn.offsetWidth + 'px';
    thumb.style.height = btn.offsetHeight + 'px';
    thumb.style.transform = 'translate(' + (btn.offsetLeft - 5) + 'px,' + (btn.offsetTop - 5) + 'px)';
  };
  var applyCycle = function (cycle) {
    $$('.seg button').forEach(function (b) {
      var on = b.getAttribute('data-cycle') === cycle;
      b.setAttribute('aria-pressed', on); if (on) moveThumb(b);
    });
    $$('.plan[data-price]').forEach(function (p) {
      var m = parseFloat(p.getAttribute('data-price')), eff, bill;
      var P = T.pricing || {};
      if (cycle === 'six') { eff = m * 0.9; bill = (P.billed6 || '').replace('{t}', money(eff * 6)); }
      else if (cycle === 'year') { eff = m * 10 / 12; bill = (P.billedYr || '').replace('{t}', money(m * 10)); }
      else { eff = m; bill = P.billedMo || ''; }
      var amt = $('.amt strong', p), bl = $('.bill', p);
      if (reduce) { amt.textContent = money(eff); bl.textContent = bill; return; }
      amt.classList.add('swap'); bl.style.opacity = 0;
      setTimeout(function () { amt.textContent = money(eff); bl.textContent = bill; amt.classList.remove('swap'); bl.style.opacity = 1; }, 220);
    });
  };
  if (seg) {
    $$('.seg button').forEach(function (b) { b.addEventListener('click', function () { applyCycle(b.getAttribute('data-cycle')); }); });
    applyCycle('monthly');
    addEventListener('resize', function () { moveThumb($('.seg button[aria-pressed="true"]')); });
    addEventListener('load', function () { moveThumb($('.seg button[aria-pressed="true"]')); });
  }

  /* --- sample frames: scale 390px iframes to fit --- */
  var fitFrames = function () {
    $$('.frame .fs').forEach(function (fs) {
      var f = $('iframe', fs); if (!f) return;
      var s = fs.clientWidth / 390;
      f.style.transform = 'scale(' + s + ')';
      f.style.height = (fs.clientHeight / s) + 'px';
    });
  };
  fitFrames(); addEventListener('resize', fitFrames);

  /* --- interactive demos --- */
  var D = T.demo || {};
  var star = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9l-5.3 2.7 1-5.8-4.2-4.1 5.9-.9z"/></svg>';
  var stars = '<span class="stars" role="img" aria-label="5/5">' + star + star + star + star + star + '</span>';
  var bell = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/></svg>';
  var timers = [];
  var clearT = function () { timers.forEach(clearTimeout); timers = []; };
  var at = function (ms, fn) { timers.push(setTimeout(fn, reduce ? 0 : ms)); };
  var el = function (tag, cls, html) { var x = d.createElement(tag); if (cls) x.className = cls; x.innerHTML = html; return x; };
  var stepOn = function (panel, i) { $$('.dsteps li', panel).forEach(function (li, k) { li.classList.toggle('on', k <= i); }); };

  var runLead = function (panel) {
    var feed = $('.feed', panel), scr = $('.pscreen', panel);
    feed.innerHTML = ''; $$('.notif', scr).forEach(function (n) { n.remove(); }); stepOn(panel, -1);
    at(200, function () {
      stepOn(panel, 0);
      feed.appendChild(el('div', 'fcard', '<div class="fl">' + D.fName + '</div><div class="fv">' + D.leadName + '</div><div class="fl">' + D.fNeed + '</div><div class="fv">' + D.leadNeed + '</div><div class="fb">' + D.send + '</div>'));
    });
    at(1600, function () { var b = $('.fb', feed); if (b) { b.textContent = D.sent; b.classList.add('done'); } });
    at(2600, function () { stepOn(panel, 1); feed.appendChild(el('div', 'bub sys', D.now)); feed.appendChild(el('div', 'bub in', D.sms)); });
    at(4600, function () { stepOn(panel, 2); scr.appendChild(el('div', 'notif', '<i>' + bell + '</i><div><b>' + D.notifT + '</b><small>' + D.notifB + '</small></div>')); });
    at(7000, function () {
      stepOn(panel, 3); $$('.notif', scr).forEach(function (n) { n.remove(); });
      var f = $('.fcard', feed); if (f) f.remove();
      feed.appendChild(el('div', 'bub sys', D.nextDay)); feed.appendChild(el('div', 'bub in', D.remind));
    });
    at(8600, function () { feed.appendChild(el('div', 'bub out', D.reply)); });
  };
  var runReview = function (panel) {
    var feed = $('.feed', panel); feed.innerHTML = ''; stepOn(panel, -1);
    at(200, function () { stepOn(panel, 0); feed.appendChild(el('div', 'fcard', '<div class="fl">' + D.jobL + '</div><div class="fv">' + D.job + '</div><div class="fb">' + D.markDone + '</div>')); });
    at(1500, function () { var b = $('.fb', feed); if (b) { b.textContent = D.done; b.classList.add('done'); } });
    at(2700, function () { stepOn(panel, 1); var f = $('.fcard', feed); if (f) f.remove(); feed.appendChild(el('div', 'bub sys', D.now)); feed.appendChild(el('div', 'bub in', D.rSms + '<br><span class="rlink">' + stars + ' ' + D.rLink + '</span>')); });
    at(5200, function () { stepOn(panel, 2); feed.appendChild(el('div', 'rcard', '<span class="ex">' + D.exReview + '</span><br>' + stars + '<p>' + D.review + '</p><small>' + D.reviewWho + '</small>')); });
  };
  var runDash = function (panel) {
    stepOn(panel, -1);
    $$('[data-count]', panel).forEach(function (c) { c.textContent = '0'; });
    $$('.bars span', panel).forEach(function (b) { b.style.height = '0'; });
    at(150, function () {
      stepOn(panel, 0);
      $$('[data-count]', panel).forEach(function (c) {
        var target = +c.getAttribute('data-count'), t0 = performance.now(), dur = reduce ? 1 : 1600;
        (function tick(now) {
          var p = Math.min(1, (now - t0) / dur), v = Math.round(target * (1 - Math.pow(1 - p, 3)));
          c.textContent = v.toLocaleString(T.lang === 'tr' ? 'tr-TR' : 'en-US');
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
      $$('.bars span', panel).forEach(function (b) { b.style.height = b.getAttribute('data-h') + '%'; });
    });
    at(1500, function () { stepOn(panel, 1); });
    at(2800, function () { stepOn(panel, 2); });
  };
  var runners = { lead: runLead, review: runReview, dash: runDash };
  var tabs = $$('.tab'), started = false;
  var play = function (name) {
    clearT();
    var panel = $('#panel-' + name); if (!panel) return;
    runners[name](panel);
  };
  var activate = function (tab) {
    tabs.forEach(function (t) {
      var on = t === tab; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      $('#' + t.getAttribute('aria-controls')).hidden = !on;
    });
    play(tab.getAttribute('data-demo'));
  };
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { activate(t); });
    t.addEventListener('keydown', function (e) {
      var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (k) { var n = tabs[(i + k + tabs.length) % tabs.length]; n.focus(); activate(n); }
    });
  });
  $$('[data-replay]').forEach(function (b) {
    b.addEventListener('click', function () { var on = $('.tab[aria-selected="true"]'); if (on) play(on.getAttribute('data-demo')); });
  });
  var demoSec = $('#demo');
  if (demoSec) {
    if ('IntersectionObserver' in window) {
      var dob = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting && !started) { started = true; activate(tabs[0]); dob.disconnect(); }
      }, { threshold: 0.25 });
      dob.observe(demoSec);
    } else activate(tabs[0]);
  }

  /* --- contact form (formsubmit.co AJAX) --- */
  var form = $('#kd-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var st = $('.status', form), btn = $('button[type="submit"]', form), F = T.form || {};
      if (form._honey && form._honey.value) return;
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      data._subject = 'Kaya Global Agency inquiry (' + (T.lang || 'en').toUpperCase() + ')';
      data._template = 'table';
      data._captcha = 'false';
      data.page = location.href.split('#')[0];
      var label = btn.innerHTML; btn.disabled = true; btn.textContent = F.sending || 'Sending…';
      st.className = 'status'; st.textContent = '';
      fetch('https://formsubmit.co/ajax/' + KD_CONFIG.email, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) { return r.json().then(function (j) { if (!r.ok || String(j.success) === 'false') throw new Error(j.message || r.status); }); })
        .then(function () {
          st.className = 'status ok'; st.textContent = F.ok; form.reset();
          if (intentSel) intentSel.value = 'Free website preview';
          if (window.kdTrack) try { window.kdTrack('form'); } catch (x) {}
        })
        .catch(function () {
          st.className = 'status err'; st.innerHTML = '';
          st.appendChild(d.createTextNode(F.err + ' '));
          var a = d.createElement('a'); a.href = 'mailto:' + KD_CONFIG.email; a.textContent = KD_CONFIG.email; st.appendChild(a);
        })
        .then(function () { btn.disabled = false; btn.innerHTML = label; st.setAttribute('tabindex', '-1'); st.focus({ preventScroll: true }); });
    });
  }

  /* --- Kaya Assistant (scripted FAQ bot) --- */
  var C = T.chat, fab = $('.chat-fab'), panel = $('.chat-panel');
  if (C && fab && panel) {
    var log = $('.chat-log', panel), inp = $('.chat-f input', panel), greeted = false;
    var norm = function (s) {
      return s.toLocaleLowerCase(T.lang === 'tr' ? 'tr-TR' : 'en-US').replace(/ı/g, 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    };
    var say = function (who, text, cta) {
      var m = el('div', 'cm ' + who, ''); m.textContent = text;
      if (cta) {
        var b = d.createElement('a'); b.className = 'cta'; b.href = '#contact'; b.textContent = C.cta;
        b.setAttribute('data-intent', 'Free website preview');
        b.addEventListener('click', function () { closeChat(false); });
        m.appendChild(d.createElement('br')); m.appendChild(b);
      }
      log.appendChild(m); log.scrollTop = log.scrollHeight; return m;
    };
    var answer = function (intent) {
      var ty = el('div', 'cm bot typing', '<i></i><i></i><i></i>'); log.appendChild(ty); log.scrollTop = log.scrollHeight;
      setTimeout(function () { ty.remove(); say('bot', C.a[intent] || C.a.fallback, intent !== 'greet'); }, reduce ? 0 : 650);
    };
    var classify = function (q) {
      var s = norm(q), best = 'fallback', score = 0;
      Object.keys(C.kw).forEach(function (k) {
        var sc = 0; C.kw[k].forEach(function (w) { if (s.indexOf(norm(w)) > -1) sc += w.length; });
        if (sc > score) { score = sc; best = k; }
      });
      return best;
    };
    var openChat = function () {
      panel.hidden = false; fab.setAttribute('aria-expanded', 'true');
      if (!greeted) { greeted = true; say('bot', C.greet); }
      setTimeout(function () { if (fine) inp.focus(); }, 50);
    };
    var closeChat = function (focusFab) { panel.hidden = true; fab.setAttribute('aria-expanded', 'false'); if (focusFab) fab.focus(); };
    fab.addEventListener('click', function () { panel.hidden ? openChat() : closeChat(true); });
    $('.chat-x', panel).addEventListener('click', function () { closeChat(true); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) closeChat(true); });
    $$('.chips button', panel).forEach(function (b) {
      b.addEventListener('click', function () { say('me', b.textContent); answer(b.getAttribute('data-q')); });
    });
    $('.chat-f', panel).addEventListener('submit', function (e) {
      e.preventDefault(); var q = inp.value.trim(); if (!q) return;
      say('me', q); inp.value = ''; answer(classify(q));
    });
    window.kdChat = { open: openChat, ask: function (q) { say('me', q); var i = classify(q); answer(i); return i; } };
  }
})();
