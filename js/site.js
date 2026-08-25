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

  // ---- dummy form (送信先未接続) ----
  document.querySelectorAll('form[data-fw-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var done = form.querySelector('.fw-form-done');
      if (done) done.style.display = 'block';
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
