(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* Petals and confetti */
  var pc = $('#petals'), pctx = pc.getContext('2d');
  var cc = $('#confetti'), cctx = cc.getContext('2d');
  var W = 0, H = 0, dpr = 1, petals = [], bits = [];
  var colors = ['#ff7aa2', '#ffd979', '#8cc8ff', '#a8e6cf', '#cbb8f7', '#ffffff', '#ff9d7a'];

  function newPetal(anywhere) {
    return { x: Math.random() * W, y: anywhere ? Math.random() * H : -20, r: 6 + Math.random() * 7, vy: 0.4 + Math.random() * 0.7, sw: Math.random() * 6.28, sp: 0.01 + Math.random() * 0.02, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.03, a: 0.25 + Math.random() * 0.3 };
  }
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    [pc, cc].forEach(function (c) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
    pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!petals.length && !reduce) { for (var i = 0; i < 16; i++) petals.push(newPetal(true)); }
  }
  function drawPetals() {
    pctx.clearRect(0, 0, W, H);
    petals.forEach(function (p) {
      p.sw += p.sp; p.x += Math.sin(p.sw) * 0.6; p.y += p.vy; p.rot += p.vr;
      if (p.y > H + 20) { var n = newPetal(false); p.x = n.x; p.y = n.y; p.vy = n.vy; p.r = n.r; }
      pctx.save();
      pctx.translate(p.x, p.y);
      pctx.rotate(p.rot);
      pctx.fillStyle = 'rgba(255,122,162,' + p.a.toFixed(2) + ')';
      pctx.beginPath();
      pctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, 6.2832);
      pctx.fill();
      pctx.restore();
    });
  }
  function drawBits() {
    cctx.clearRect(0, 0, W, H);
    for (var k = bits.length - 1; k >= 0; k--) {
      var b = bits[k];
      b.vy += 0.12; b.vx *= 0.99; b.x += b.vx; b.y += b.vy; b.rot += b.vr; b.life--;
      if (b.life <= 0 || b.y > H + 30) { bits.splice(k, 1); continue; }
      cctx.save();
      cctx.translate(b.x, b.y);
      cctx.rotate(b.rot);
      cctx.globalAlpha = Math.min(1, b.life / 40);
      cctx.fillStyle = b.c;
      cctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      cctx.restore();
    }
  }
  function loop() { drawPetals(); drawBits(); requestAnimationFrame(loop); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  function burst(x, y, n) {
    if (reduce) return;
    n = n || 80;
    for (var i = 0; i < n; i++) {
      var a = Math.random() * 6.2832, s = 3 + Math.random() * 7;
      bits.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 4, w: 6 + Math.random() * 6, h: 4 + Math.random() * 5, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4, c: pick(colors), life: 110 + Math.random() * 60 });
    }
  }
  function rain() {
    if (reduce) return;
    for (var i = 0; i < 140; i++) {
      bits.push({ x: Math.random() * W, y: -Math.random() * H * 0.6, vx: (Math.random() - 0.5) * 2, vy: 1 + Math.random() * 3, w: 6 + Math.random() * 6, h: 4 + Math.random() * 5, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3, c: pick(colors), life: 300 + Math.random() * 100 });
    }
  }

  window.addEventListener('resize', size);
  size();
  if (!reduce) requestAnimationFrame(loop);

  /* Cake */
  var cake = $('#cake'), hint = $('#hint');
  cake.addEventListener('click', function () {
    var out = cake.classList.toggle('out');
    cake.setAttribute('aria-pressed', out ? 'true' : 'false');
    hint.textContent = out ? 'Wish made. I hope every bit of it comes true.' : 'Lit again. Make another one.';
    if (out) {
      var r = cake.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height * 0.1, 90);
    }
  });

  /* Confetti button */
  var cBtn = $('#confetti-btn');
  cBtn.addEventListener('click', function () {
    var r = cBtn.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 60);
    rain();
  });

  /* Music box */
  var tune = [[392, 0.75], [392, 0.25], [440, 1], [392, 1], [523.25, 1], [493.88, 2],
    [392, 0.75], [392, 0.25], [440, 1], [392, 1], [587.33, 1], [523.25, 2],
    [392, 0.75], [392, 0.25], [783.99, 1], [659.25, 1], [523.25, 1], [493.88, 1], [440, 2],
    [698.46, 0.75], [698.46, 0.25], [659.25, 1], [523.25, 1], [587.33, 1], [523.25, 2]];
  var actx = null, playing = false;
  var songBtn = $('#song');
  songBtn.addEventListener('click', function () {
    if (playing) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!actx) actx = new AC();
      if (actx.state === 'suspended') actx.resume();
      var start = actx.currentTime + 0.3;
      var t = start;
      var beat = 0.46;
      tune.forEach(function (n) {
        [[1, 0.12, 'sine'], [2, 0.03, 'triangle']].forEach(function (h) {
          var o = actx.createOscillator();
          var g = actx.createGain();
          o.type = h[2];
          o.frequency.value = n[0] * h[0];
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(h[1], t + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
          o.connect(g);
          g.connect(actx.destination);
          o.start(t);
          o.stop(t + 1.5);
        });
        t += n[1] * beat;
      });
      playing = true;
      songBtn.disabled = true;
      songBtn.textContent = 'Playing...';
      setTimeout(function () {
        playing = false;
        songBtn.disabled = false;
        songBtn.textContent = 'Play the song';
      }, (t - start + 1.8) * 1000);
    } catch (err) { /* sound is optional */ }
  });

  /* Balloons */
  var balloons = $$('.balloon');
  var bMsg = $('#balloon-msg'), bCount = $('#balloon-count'), refill = $('#refill');
  var left = balloons.length;
  balloons.forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.classList.contains('popped')) return;
      b.classList.add('popped');
      b.setAttribute('aria-hidden', 'true');
      b.tabIndex = -1;
      left--;
      var r = b.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 36);
      bMsg.textContent = b.getAttribute('data-msg');
      bCount.textContent = left > 0 ? left + (left === 1 ? ' balloon left' : ' balloons left') : 'All popped. Every one was for you.';
      if (left === 0) refill.hidden = false;
    });
  });
  refill.addEventListener('click', function () {
    balloons.forEach(function (b) { b.classList.remove('popped'); b.removeAttribute('aria-hidden'); b.tabIndex = 0; });
    left = balloons.length;
    bCount.textContent = left + ' balloons left';
    bMsg.textContent = 'Pop a balloon to read what\'s inside.';
    refill.hidden = true;
  });

  /* Polaroids */
  $$('.pol').forEach(function (p) {
    p.addEventListener('click', function () {
      var f = p.classList.toggle('flipped');
      p.setAttribute('aria-pressed', f ? 'true' : 'false');
    });
  });

  /* Scratch coupons */
  function paintFoil(ctx, w, h) {
    var g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#d9d3ea');
    g.addColorStop(0.5, '#f4f0fb');
    g.addColorStop(1, '#c8c0de');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (var y = 8, row = 0; y < h; y += 18, row++) {
      for (var x = 8; x < w; x += 18) {
        ctx.beginPath();
        ctx.arc(x + (row % 2 ? 9 : 0), y, 1.6, 0, 6.2832);
        ctx.fill();
      }
    }
    ctx.fillStyle = '#6a5c7b';
    ctx.font = '600 28px Caveat, cursive';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('scratch here', w / 2, h / 2);
  }
  function setupScratch(card) {
    var cv = $('canvas', card);
    var ctx = cv.getContext('2d');
    var ratio = Math.min(window.devicePixelRatio || 1, 2);
    var w = card.clientWidth, h = card.clientHeight;
    cv.width = Math.round(w * ratio);
    cv.height = Math.round(h * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    paintFoil(ctx, w, h);
    var drawing = false, done = false, lx = 0, ly = 0;

    function pos(e) {
      var r = cv.getBoundingClientRect();
      return { x: (e.clientX - r.left) * (w / r.width), y: (e.clientY - r.top) * (h / r.height) };
    }
    function scratch(p) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 34;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      lx = p.x; ly = p.y;
    }
    function cleared() {
      var d = ctx.getImageData(0, 0, cv.width, cv.height).data;
      var c = 0, t = 0;
      for (var i = 3; i < d.length; i += 16) { t++; if (d[i] === 0) c++; }
      return c / t;
    }
    function reveal() {
      if (done) return;
      done = true;
      cv.style.transition = 'opacity 0.6s ease';
      cv.style.opacity = '0';
      cv.style.pointerEvents = 'none';
      var r = card.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 50);
    }
    cv.addEventListener('pointerdown', function (e) {
      if (done) return;
      drawing = true;
      try { cv.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      var p = pos(e);
      lx = p.x; ly = p.y;
      scratch(p);
      cv.style.cursor = 'grabbing';
    });
    cv.addEventListener('pointermove', function (e) { if (drawing) scratch(pos(e)); });
    function stop() {
      if (!drawing) return;
      drawing = false;
      cv.style.cursor = 'grab';
      if (cleared() > 0.5) reveal();
    }
    cv.addEventListener('pointerup', stop);
    cv.addEventListener('pointercancel', stop);
    cv.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reveal(); }
    });
  }
  var ready = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  ready.then(function () { $$('.coupon').forEach(setupScratch); });

  /* Reasons */
  var reasons = [
    'You remember the little things.',
    'You laugh with your whole face.',
    'You tell me the truth, and you tell it kindly.',
    'You make people feel safe.',
    'You are brave in quiet ways.',
    'You show up, every single time.',
    'You make long drives and waiting rooms fun.',
    'You believe in people before they believe in themselves.',
    'Your messages make my day better.',
    'You are the best kind of loud and the best kind of quiet.',
    'You make me want to be a better friend.',
    'You feel like home.'
  ];
  var deck = [];
  var rEl = $('#reason');
  function nextReason() {
    if (!deck.length) {
      deck = reasons.slice();
      for (var i = deck.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = deck[i]; deck[i] = deck[j]; deck[j] = tmp;
      }
    }
    var t = deck.pop();
    if (t === rEl.textContent && deck.length) { var u = deck.pop(); deck.push(t); t = u; }
    return t;
  }
  $('#another').addEventListener('click', function () {
    if (reduce) { rEl.textContent = nextReason(); return; }
    rEl.classList.add('swap');
    setTimeout(function () { rEl.textContent = nextReason(); rEl.classList.remove('swap'); }, 220);
  });

  /* Wall of wishes */
  var wall = $('#wall'), form = $('#wish-form'), input = $('#wish'), status = $('#status');
  var palette = ['#ffd979', '#ffc2d6', '#bfe3ff', '#c9f0de', '#e0d3ff'];
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) { status.textContent = 'Write a wish first, then stick it up.'; return; }
    var n = document.createElement('div');
    n.className = 'sticky';
    n.textContent = text;
    n.style.setProperty('--c', pick(palette));
    n.style.setProperty('--r', (Math.random() * 8 - 4).toFixed(1) + 'deg');
    wall.insertBefore(n, wall.firstChild);
    while (wall.children.length > 12) wall.removeChild(wall.lastChild);
    input.value = '';
    status.textContent = 'Stuck on the wall. I hope it comes true.';
    var r = n.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 40);
  });

  /* Back to top */
  $('#again').addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
})();
