/* =========================================================
   Görünür — ortak JavaScript
   Hiçbir veri bir sunucuya gönderilmez. Analytics / Pixel yüklenmez.
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  /* ---------- Güvenli localStorage ---------- */
  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { return null; }
    return null;
  }

  /* ---------- WhatsApp linkleri (placeholder numara) ---------- */
  var WA_NUMBER = '905xxxxxxxxx';
  var WA_TEXT = {
    genel: 'Merhaba, Görünür hakkında bilgi almak istiyorum. İşletmemin adı: ',
    karne: 'Merhaba, işletmem için ücretsiz Google profil karnesi rica ediyorum. İşletmemin adı: ',
    cevap: 'Merhaba, Görünür Cevap paketini 14 gün ücretsiz denemek istiyorum. İşletmemin adı: ',
    takip: 'Merhaba, Görünür Cevap + Takip paketini 14 gün ücretsiz denemek istiyorum. İşletmemin adı: ',
    kurumsal: 'Merhaba, Görünür Kurumsal paketi için görüşmek istiyorum. İşletmemin adı ve şube sayısı: ',
    fiyat: 'Merhaba, Görünür paketleri hakkında bilgi almak istiyorum. İşletmemin adı: ',
    soru: 'Merhaba, Görünür hakkında bir sorum var: ',
    kayit: 'Merhaba, işletmemi haritaya kaydettirmek istiyorum. İşletmemin adı ve adresi: ',
    qr: 'Merhaba, ücretsiz Google yorum QR kodu istiyorum. İşletmemin adı: ',
    reklam: 'Merhaba, Google reklam yönetimi hakkında görüşmek istiyorum. İşletmemin adı: ',
    en: 'Hello, I would like to know more about Görünür. My business name: '
  };
  function waHref(key) {
    var text = WA_TEXT[key] || WA_TEXT.genel;
    return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text);
  }
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.setAttribute('href', waHref(a.getAttribute('data-wa')));
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener');
  });

  /* ---------- Tema (gr-tema) ---------- */
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function currentTheme() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return mq && mq.matches ? 'dark' : 'light';
  }
  if (!root.getAttribute('data-theme')) root.setAttribute('data-theme', currentTheme());
  function syncThemeButtons() {
    var dark = currentTheme() === 'dark';
    var lang = root.lang === 'en';
    document.querySelectorAll('.theme-btn').forEach(function (b) {
      b.setAttribute('aria-pressed', dark ? 'true' : 'false');
      if (b.classList.contains('icon-btn')) b.setAttribute('aria-label', lang ? (dark ? 'Switch to light theme' : 'Switch to dark theme') : (dark ? 'Açık temaya geç' : 'Koyu temaya geç'));
    });
  }
  document.querySelectorAll('.theme-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      store('gr-tema', next);
      syncThemeButtons();
    });
  });
  if (mq && mq.addEventListener) {
    mq.addEventListener('change', function (e) {
      if (!store('gr-tema')) { root.setAttribute('data-theme', e.matches ? 'dark' : 'light'); syncThemeButtons(); }
    });
  }
  syncThemeButtons();

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobil menü ---------- */
  var menuBtn = document.querySelector('.menu-btn');
  var menu = document.getElementById('mobile-menu');
  if (menuBtn && menu) {
    var setMenu = function (open) {
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', menuBtn.getAttribute(open ? 'data-close-label' : 'data-open-label'));
      menu.hidden = !open;
    };
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); }
    });
    var wide = window.matchMedia('(min-width: 1121px)');
    var onWide = function (e) { if (e.matches) setMenu(false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide);
  }

  /* ---------- Hero: yorum yanıt slaytı ---------- */
  document.querySelectorAll('[data-slider]').forEach(function (sl) {
    var slides = Array.prototype.slice.call(sl.querySelectorAll('.slide'));
    var steps = Array.prototype.slice.call(sl.querySelectorAll('.step-btn'));
    var caption = sl.querySelector('[data-caption]');
    var toggle = sl.querySelector('.slider-toggle');
    if (reduceMotion) {
      // Hareket azaltılmışsa: 3 görsel alt alta, sabit
      sl.classList.add('is-static');
      slides.forEach(function (s) { s.removeAttribute('aria-hidden'); });
      return;
    }
    var DURATION = 5000, idx = 0, elapsed = 0, last = null;
    var userPaused = false, hover = false, focusIn = false;
    function bar(i) { return steps[i] && steps[i].querySelector('.step-bar'); }
    function go(i) {
      idx = i; elapsed = 0;
      slides.forEach(function (s, n) {
        s.classList.toggle('is-active', n === i);
        s.setAttribute('aria-hidden', n === i ? 'false' : 'true');
      });
      steps.forEach(function (b, n) {
        if (n === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
        var br = bar(n); if (br) br.style.transform = 'scaleX(0)';
      });
      if (caption) caption.textContent = steps[i].getAttribute('data-text');
    }
    function isPaused() { return userPaused || hover || focusIn || document.hidden; }
    function tick(t) {
      if (last === null) last = t;
      var dt = Math.min(t - last, 100); last = t;
      if (!isPaused()) {
        elapsed += dt;
        if (elapsed >= DURATION) go((idx + 1) % slides.length);
        else { var br = bar(idx); if (br) br.style.transform = 'scaleX(' + (elapsed / DURATION).toFixed(4) + ')'; }
      }
      requestAnimationFrame(tick);
    }
    steps.forEach(function (b, n) { b.addEventListener('click', function () { go(n); }); });
    if (toggle) {
      toggle.addEventListener('click', function () {
        userPaused = !userPaused;
        toggle.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
        toggle.setAttribute('aria-label', sl.getAttribute(userPaused ? 'data-play-label' : 'data-pause-label'));
      });
    }
    sl.addEventListener('mouseenter', function () { hover = true; });
    sl.addEventListener('mouseleave', function () { hover = false; });
    sl.addEventListener('focusin', function () { focusIn = true; });
    sl.addEventListener('focusout', function (e) { if (!sl.contains(e.relatedTarget)) focusIn = false; });
    document.addEventListener('visibilitychange', function () { last = null; });
    go(0);
    requestAnimationFrame(tick);
  });

  /* ---------- Yüzen WhatsApp: hero görünürken gizli (hero'nun kendi butonu var) ---------- */
  var waFloat = document.querySelector('.wa-float');
  var heroEl = document.querySelector('.hero');
  if (waFloat && heroEl && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      waFloat.classList.toggle('is-away', entries[0].isIntersecting);
    }, { threshold: 0.12 }).observe(heroEl);
  }

  /* ---------- Kaydırınca sırayla belirme (0,6 sn arayla) ---------- */
  var groups = document.querySelectorAll('[data-flow]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.querySelectorAll('.rv').forEach(function (el, i) {
          el.style.transitionDelay = (i * 0.6) + 's';
          el.classList.remove('rv-pending');
        });
        io.unobserve(e.target);
      });
    }, { threshold: 0.15 });
    groups.forEach(function (g) {
      // Yalnızca sayfa açıldığında ekranın altındaysa gizlenir; ekrandaysa hiç saklanmaz.
      if (g.getBoundingClientRect().top > window.innerHeight * 0.9) {
        g.querySelectorAll('.rv').forEach(function (el) { el.classList.add('rv-pending'); });
        io.observe(g);
      }
    });
  }

  /* ---------- Çerez banner'ı (gr-cerez) ---------- */
  var COOKIE_KEY = 'gr-cerez', COOKIE_V = 1;
  var banner = document.getElementById('cookie');
  function readConsent() {
    try { var c = JSON.parse(store(COOKIE_KEY) || 'null'); return c && c.v === COOKIE_V ? c : null; } catch (e) { return null; }
  }
  function applyConsent(c) {
    // Burada izin verilen araçlar yüklenecek (ör. GA4 Consent Mode, Meta Pixel).
    // Bu sürümde hiçbir üçüncü taraf script yüklenmez; izin geri alınırsa ilgili çerezler silinir.
    if (!c.analytics) ['_ga', '_gid', '_gcl_aw', '_gcl_au'].forEach(dropCookie);
    if (!c.ads) ['_fbp', '_fbc'].forEach(dropCookie);
    document.dispatchEvent(new CustomEvent('gr:consent', { detail: c }));
  }
  function dropCookie(name) {
    var host = location.hostname;
    document.cookie = name + '=; Max-Age=0; path=/';
    if (host) document.cookie = name + '=; Max-Age=0; path=/; domain=.' + host.replace(/^www\./, '');
    document.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (n.indexOf('_ga_') === 0 && name === '_ga') document.cookie = n + '=; Max-Age=0; path=/';
    });
  }
  function saveConsent(analytics, ads) {
    var c = { v: COOKIE_V, analytics: !!analytics, ads: !!ads, at: new Date().toISOString() };
    store(COOKIE_KEY, JSON.stringify(c));
    applyConsent(c);
    closeBanner();
    var st = document.querySelector('[data-consent-status]');
    if (st) renderStatus(st);
  }
  function openBanner(showPrefs) {
    if (!banner) return;
    var c = readConsent();
    banner.hidden = false;
    banner.querySelector('[data-view="main"]').hidden = !!showPrefs;
    banner.querySelector('[data-view="prefs"]').hidden = !showPrefs;
    var a = banner.querySelector('#ck-analytics'), d = banner.querySelector('#ck-ads');
    if (a) a.checked = !!(c && c.analytics);
    if (d) d.checked = !!(c && c.ads);
  }
  function closeBanner() { if (banner) banner.hidden = true; }
  function renderStatus(el) {
    var c = readConsent(), en = root.lang === 'en';
    if (!c) { el.textContent = en ? 'You have not made a choice yet.' : 'Henüz bir seçim yapmadınız.'; return; }
    el.textContent = (en ? 'Your choice: ' : 'Seçiminiz: ') +
      (en ? 'Visit counting ' : 'Ziyaret sayımı ') + (c.analytics ? (en ? 'on' : 'açık') : (en ? 'off' : 'kapalı')) + ', ' +
      (en ? 'ads ' : 'reklam ') + (c.ads ? (en ? 'on' : 'açık') : (en ? 'off' : 'kapalı')) + '.';
  }
  if (banner) {
    banner.addEventListener('click', function (e) {
      var act = e.target.closest('[data-ck]');
      if (!act) return;
      var a = act.getAttribute('data-ck');
      if (a === 'all') saveConsent(true, true);
      else if (a === 'necessary') saveConsent(false, false);
      else if (a === 'prefs') openBanner(true);
      else if (a === 'save') saveConsent(banner.querySelector('#ck-analytics').checked, banner.querySelector('#ck-ads').checked);
    });
    var existing = readConsent();
    if (existing) applyConsent(existing); else openBanner(false);
  }
  document.querySelectorAll('[data-open-cookie]').forEach(function (b) {
    b.addEventListener('click', function () { openBanner(true); });
  });
  document.querySelectorAll('[data-consent-status]').forEach(renderStatus);

  /* ---------- Karne formu (örnek sonuç, hiçbir yere gönderilmez) ---------- */
  var form = document.getElementById('karne-form');
  if (form) {
    var step1 = form.querySelector('[data-step="1"]');
    var step2 = document.querySelector('[data-step="2"]');
    var step3 = document.querySelector('[data-step="3"]');
    var step4 = document.querySelector('[data-step="4"]');
    var chosen = null;
    function esc(s) { return s.replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
    function setErr(id, msg) { var e = document.getElementById(id); if (e) { e.textContent = msg || ''; e.hidden = !msg; } }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('#k-name').value.trim();
      var place = form.querySelector('#k-place').value.trim();
      if (name.length < 2) { setErr('k-name-err', 'İşletmenizin adını yazın.'); form.querySelector('#k-name').focus(); return; }
      setErr('k-name-err', '');
      var isLink = /^https?:\/\//i.test(name) || /maps\.(app\.)?goo/i.test(name);
      var label = isLink ? 'Bağlantıdaki işletme' : name;
      var loc = place || 'Konum belirtilmedi';
      var list = [
        { t: label, s: loc + ' · 4,3 ★ · 87 yorum' },
        { t: label + ' (2. şube)', s: loc + ' · 4,1 ★ · 23 yorum' },
        { t: label + ' Express', s: loc + ' · 3,9 ★ · 12 yorum' }
      ];
      var res = step2.querySelector('.results');
      res.innerHTML = list.map(function (r, i) {
        return '<button type="button" class="result" data-i="' + i + '" aria-pressed="false"><span><b>' + esc(r.t) + '</b><span>' + esc(r.s) + '</span></span><svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></button>';
      }).join('');
      step2.hidden = false; step3.hidden = true; step4.hidden = true;
      step2.classList.add('reveal');
      res.querySelectorAll('.result').forEach(function (b) {
        b.addEventListener('click', function () {
          res.querySelectorAll('.result').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
          b.setAttribute('aria-pressed', 'true');
          chosen = list[+b.getAttribute('data-i')];
          step3.querySelector('[data-chosen]').textContent = chosen.t + ' — ' + chosen.s;
          step3.hidden = false; step3.classList.add('reveal');
          step3.querySelector('#k-phone').focus();
        });
      });
      step2.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest' });
    });

    var phoneForm = document.getElementById('karne-phone');
    phoneForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var tel = phoneForm.querySelector('#k-phone').value.replace(/\D/g, '');
      if (!/^(90)?0?5\d{9}$/.test(tel)) { setErr('k-phone-err', 'Numarayı 05xx xxx xx xx biçiminde yazın.'); return; }
      setErr('k-phone-err', '');
      step4.querySelector('[data-biz]').textContent = chosen ? chosen.t : '';
      step4.hidden = false; step4.classList.add('reveal');
      step4.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  }
})();
