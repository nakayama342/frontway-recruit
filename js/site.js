// Frontway corporate site — shared behavior: particles, reveal, nav, progress bar
(function () {
  // ---- mobile hamburger menu ----
  var burger = document.getElementById('fw-burger');
  var menu = document.getElementById('fw-menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.style.display === 'flex';
      menu.style.display = open ? 'none' : 'flex';
      burger.setAttribute('aria-label', open ? 'メニューを開く' : 'メニューを閉じる');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { menu.style.display = 'none'; });
    });
  }

  // ---- loading screen: fake progress 0 -> 100, then curtain up ----
  var loader = document.getElementById('fw-loader');
  if (loader) {
    var bar = document.getElementById('fw-bar');
    var pct = document.getElementById('fw-pct');
    var progress = 0;
    var step = function () {
      progress = Math.min(100, progress + 3 + Math.random() * 9);
      var v = Math.floor(progress);
      if (bar) bar.style.width = v + '%';
      if (pct) pct.textContent = v + '%';
      if (progress < 100) {
        setTimeout(step, 90 + Math.random() * 110);
      } else {
        setTimeout(function () {
          loader.style.transform = 'translateY(-100%)';
          loader.style.opacity = '0';
          setTimeout(function () { loader.remove(); }, 800);
        }, 350);
      }
    };
    setTimeout(step, 500);
  }

  // ---- scroll progress bar ----
  var prog = document.getElementById('fw-progress');
  window.addEventListener('scroll', function () {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    if (prog && max > 0) prog.style.width = (h.scrollTop / max * 100).toFixed(2) + '%';
  }, { passive: true });

  // ---- staggered scroll reveal ----
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      var siblings = el.parentElement
        ? Array.prototype.filter.call(el.parentElement.children, function (s) { return s.classList.contains('fw-reveal'); })
        : [el];
      var idx = Math.max(0, siblings.indexOf(el));
      setTimeout(function () { el.classList.add('is-in'); }, idx * 110);
      io.unobserve(el);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fw-reveal').forEach(function (el) { io.observe(el); });

  // ---- contact form -> GAS endpoint (スプレッドシート記録 + 通知) ----
  var FW_FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxUHKOCMzXa77ahm1ilRRmoIxevDPnxiXNNlkOrDMesEW36c6wSNnM_sIEBZqwZe9s2eA/exec';
  document.querySelectorAll('form[data-fw-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var done = form.querySelector('.fw-form-done');
      var data = { form: 'お問い合わせ' };
      ['type', 'name', 'email', 'company', 'message'].forEach(function (k) {
        var el = form.querySelector('[name="' + k + '"]');
        if (el) data[k] = el.value;
      });
      if (btn) { btn.disabled = true; btn.textContent = '送信中…'; }
      fetch(FW_FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(data)
      }).then(function (res) { return res.json(); }).then(function () {
        form.reset();
        if (done) done.style.display = 'block';
        if (btn) btn.textContent = '送信しました';
      }).catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = '送信する'; }
        alert('送信に失敗しました。お手数ですが時間をおいて再度お試しください。');
      });
    });
  });

  // ---- particle network background ----
  var canvas = document.getElementById('fw-net');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var W, H, pts = [];
  var DENSITY = Number(canvas.getAttribute('data-density') || 80);
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  for (var i = 0; i < DENSITY; i++) {
    pts.push({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.0005, vy: (Math.random() - 0.5) * 0.0005 });
  }
  var mouse = { x: -9999, y: -9999 };
  window.addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > 1) p.vx *= -1;
      if (p.y < 0 || p.y > 1) p.vy *= -1;
    }
    for (var i = 0; i < pts.length; i++) {
      var a = pts[i], ax = a.x * W, ay = a.y * H;
      for (var j = i + 1; j < pts.length; j++) {
        var c = pts[j], dx = ax - c.x * W, dy = ay - c.y * H, d2 = dx * dx + dy * dy;
        if (d2 < 22500) {
          ctx.strokeStyle = 'rgba(79,124,255,' + (0.14 * (1 - d2 / 22500)).toFixed(3) + ')';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(c.x * W, c.y * H); ctx.stroke();
        }
      }
      var mdx = ax - mouse.x, mdy = ay - mouse.y, md2 = mdx * mdx + mdy * mdy;
      if (md2 < 32400) {
        ctx.strokeStyle = 'rgba(139,92,246,' + (0.35 * (1 - md2 / 32400)).toFixed(3) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(79,124,255,0.55)';
      ctx.beginPath(); ctx.arc(ax, ay, 1.4, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(tick);
  }
  tick();
})();
