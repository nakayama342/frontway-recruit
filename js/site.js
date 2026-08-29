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

  // ---- 送信前の内容確認モーダル ----
  function fwShowConfirm(rows, onOk) {
    var old = document.getElementById('fw-confirm');
    if (old) old.remove();
    var ov = document.createElement('div');
    ov.id = 'fw-confirm';
    ov.style.cssText = 'position:fixed;inset:0;z-index:100;background:rgba(4,6,15,.82);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px';
    var panel = document.createElement('div');
    panel.style.cssText = 'max-width:560px;width:100%;max-height:80vh;overflow-y:auto;background:#0b1022;border:1px solid rgba(124,154,255,.3);border-radius:18px;padding:28px 24px;box-shadow:0 24px 80px rgba(0,0,0,.6)';
    var h = document.createElement('div');
    h.textContent = '以下の内容で送信します。よろしいですか？';
    h.style.cssText = 'font-size:16px;font-weight:700;color:#fff;margin-bottom:14px';
    panel.appendChild(h);
    rows.forEach(function (r) {
      if (!r[1]) return;
      var dt = document.createElement('div');
      dt.textContent = r[0];
      dt.style.cssText = 'font-size:12px;font-weight:600;color:#7c9aff;margin:14px 0 3px;letter-spacing:.04em';
      var dd = document.createElement('div');
      dd.textContent = r[1];
      dd.style.cssText = 'font-size:14px;line-height:1.9;color:#e8ecf8;white-space:pre-wrap;word-break:break-word';
      panel.appendChild(dt);
      panel.appendChild(dd);
    });
    var btns = document.createElement('div');
    btns.style.cssText = 'display:flex;gap:12px;margin-top:26px;flex-wrap:wrap';
    var ok = document.createElement('button');
    ok.type = 'button';
    ok.textContent = 'この内容で送信する';
    ok.style.cssText = 'flex:1;min-width:170px;padding:14px 20px;border-radius:999px;border:none;cursor:pointer;background:linear-gradient(90deg,#4f7cff,#8b5cf6);color:#fff;font-size:14px;font-weight:700;font-family:inherit';
    var cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.textContent = '修正する';
    cancel.style.cssText = 'flex:1;min-width:120px;padding:14px 20px;border-radius:999px;cursor:pointer;background:rgba(79,124,255,.06);border:1px solid rgba(140,160,255,.45);color:#dfe6ff;font-size:14px;font-weight:600;font-family:inherit';
    cancel.addEventListener('click', function () { ov.remove(); });
    ov.addEventListener('click', function (ev) { if (ev.target === ov) ov.remove(); });
    ok.addEventListener('click', function () { ov.remove(); onOk(); });
    btns.appendChild(ok);
    btns.appendChild(cancel);
    panel.appendChild(btns);
    ov.appendChild(panel);
    document.body.appendChild(ov);
  }

  // ---- contact form -> GAS endpoint (スプレッドシート記録 + 通知) ----
  var FW_FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxUHKOCMzXa77ahm1ilRRmoIxevDPnxiXNNlkOrDMesEW36c6wSNnM_sIEBZqwZe9s2eA/exec';
  document.querySelectorAll('form[data-fw-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var done = form.querySelector('.fw-form-done');
      var data = { form: 'お問い合わせ' };
      ['type', 'name', 'email', 'company', 'message', 'website'].forEach(function (k) {
        var el = form.querySelector('[name="' + k + '"]');
        if (el) data[k] = el.value;
      });
      fwShowConfirm([
        ['ご希望の内容', data.type],
        ['お名前', data.name],
        ['メールアドレス', data.email],
        ['会社名', data.company],
        ['メッセージ', data.message]
      ], function () {
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
