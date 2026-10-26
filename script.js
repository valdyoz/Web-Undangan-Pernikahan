const to = new URLSearchParams(location.search).get('to');
if (to) document.getElementById('guestName').textContent = to;

const cv = document.getElementById('fx'), cx = cv.getContext('2d');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
function fit() { cv.width = innerWidth; cv.height = innerHeight; }
fit(); addEventListener('resize', fit);
const bits = Array.from({ length: 46 }, (_, i) => ({
  x: Math.random(), y: Math.random(), r: Math.random() * 5 + 3, v: Math.random() * .0012 + .0005,
  w: Math.random() * 2 + 1, p: Math.random() * 6, petal: i % 3 !== 0
}));
(function draw(t = 0) {
  cx.clearRect(0, 0, cv.width, cv.height);
  bits.forEach(b => {
    b.y += b.v; b.x += Math.sin(t / 1200 + b.p) * .0006;
    if (b.y > 1.05) { b.y = -.05; b.x = Math.random(); }
    const X = b.x * cv.width, Y = b.y * cv.height;
    cx.globalAlpha = .55 + .4 * Math.sin(t / 500 + b.p);
    if (b.petal) {
      cx.save(); cx.translate(X, Y); cx.rotate(t / 900 * b.w + b.p);
      cx.fillStyle = b.p > 3 ? '#e9c1b5' : '#d4af5f';
      cx.beginPath(); cx.ellipse(0, 0, b.r, b.r / 2.2, 0, 0, 7); cx.fill(); cx.restore();
    } else {
      cx.fillStyle = '#f5e2a3'; cx.beginPath(); cx.arc(X, Y, 1.6, 0, 7); cx.fill();
    }
  });
  if (!still) requestAnimationFrame(draw);
})();

addEventListener('scroll', () => {
  const h = document.documentElement;
  progress.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
});

const cover = document.getElementById('cover'), bgm = document.getElementById('bgm'), musicBtn = document.getElementById('musicBtn');
document.getElementById('openBtn').addEventListener('click', () => {
  cover.classList.add('open');
  document.body.classList.remove('locked');
  musicBtn.hidden = false;
  bgm.play().then(() => musicBtn.classList.add('playing')).catch(() => {});
  setTimeout(() => cover.classList.add('gone'), 1700);
});
musicBtn.addEventListener('click', () => {
  if (bgm.paused) { bgm.play(); musicBtn.classList.add('playing'); }
  else { bgm.pause(); musicBtn.classList.remove('playing'); }
});

const target = new Date('2026-12-28T11:00:00+07:00').getTime();
function tick() {
  const d = Math.max(0, target - Date.now());
  cdD.textContent = Math.floor(d / 864e5);
  cdH.textContent = Math.floor(d / 36e5) % 24;
  cdM.textContent = Math.floor(d / 6e4) % 60;
  cdS.textContent = Math.floor(d / 1e3) % 60;
}
const [cdD, cdH, cdM, cdS] = ['cd-d', 'cd-h', 'cd-m', 'cd-s'].map(id => document.getElementById(id));
tick(); setInterval(tick, 1000);

const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('show'); io.unobserve(e.target); }
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

const modal = new bootstrap.Modal(document.getElementById('lightbox'));
document.querySelectorAll('.shot').forEach(s => s.addEventListener('click', () => {
  const img = s.querySelector('img'); if (!img) return;
  lightImg.src = img.src; modal.show();
}));

copyBtn.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(accNo.textContent); copyBtn.textContent = 'Tersalin'; }
  catch { copyBtn.textContent = 'Gagal menyalin'; }
  setTimeout(() => copyBtn.textContent = 'Salin Nomor Rekening', 2000);
});

calBtn.addEventListener('click', e => {
  e.preventDefault();
  const ics = ['BEGIN:VCALENDAR','VERSION:2.0','BEGIN:VEVENT','SUMMARY:Pernikahan Zaen & Nala',
    'DTSTART:20261228T040000Z','DTEND:20261228T070000Z','LOCATION:Jl. Ketintang Wiyata\, Gayungan\, Surabaya','END:VEVENT','END:VCALENDAR'].join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  a.download = 'pernikahan.ics'; a.click();
});

const KEY = 'ucapan-undangan';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
function render() {
  wishes.innerHTML = '';
  load().forEach(w => {
    const d = document.createElement('div'); d.className = 'wish';
    d.innerHTML = '<b></b> <small></small><p class="mb-0 mt-1"></p>';
    d.querySelector('b').textContent = w.nama;
    d.querySelector('small').textContent = '· ' + w.hadir;
    d.querySelector('p').textContent = w.pesan;
    wishes.appendChild(d);
  });
}
rsvpForm.addEventListener('submit', e => {
  e.preventDefault();
  rsvpForm.classList.add('was-validated');
  if (!rsvpForm.checkValidity()) return;
  const data = load();
  data.unshift({ nama: nama.value.trim(), hadir: hadir.value, pesan: pesan.value.trim() });
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
  rsvpForm.reset(); rsvpForm.classList.remove('was-validated'); render();
});
render();

const bgVid = document.querySelector('.bgvid');
bgVid.querySelector('source').addEventListener('error', () => bgVid.remove());
if (still) bgVid.pause();
openBtn.addEventListener('click', () => bgVid.play && bgVid.play().catch(() => {}));
(() => {
  const stage = document.getElementById('stage'), groom = document.getElementById('groom'),
        bride = document.getElementById('bride'), btn = document.getElementById('openBtn'),
        cap = document.getElementById('caption'), chip = document.getElementById('chip');
  let max = 0, dx = 0, startX = 0, startDx = 0, dragging = false, done = false;

  const measure = () => { max = bride.offsetLeft - groom.offsetLeft - groom.offsetWidth * .8; };
  const set = v => {
    dx = Math.max(0, Math.min(max, v));
    const p = max ? dx / max : 0;
    stage.style.setProperty('--dx', dx);
    stage.style.setProperty('--p', p.toFixed(3));
    groom.setAttribute('aria-valuenow', Math.round(p * 100));
  };

  function unite() {
    if (done) return;
    done = true;
    set(max);
    stage.classList.add('done');
    groom.classList.remove('pulse');
    groom.style.cursor = 'default';
    cap.textContent = 'Bersatu ✦ silakan buka undangan';
    cap.classList.add('ok');
    btn.disabled = false;
    btn.classList.add('ready');
    for (let i = 0; i < 16; i++) {
      const s = document.createElement('i');
      const a = Math.random() * 6.28, r = 60 + Math.random() * 90;
      s.className = 'cv-spark';
      s.style.setProperty('--bx', Math.cos(a) * r + 'px');
      s.style.setProperty('--by', Math.sin(a) * r + 'px');
      stage.appendChild(s);
      setTimeout(() => s.remove(), 1000);
    }
    if (navigator.vibrate) navigator.vibrate(40);
  }

  groom.addEventListener('pointerdown', e => {
    if (done) return;
    measure();
    dragging = true; startX = e.clientX; startDx = dx;
    groom.setPointerCapture(e.pointerId);
    stage.classList.add('drag');
    groom.classList.remove('pulse');
  });
  groom.addEventListener('pointermove', e => { if (dragging) set(startDx + e.clientX - startX); });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('drag');
    if (max && dx / max >= .85) unite();
    else { set(0); groom.classList.add('pulse'); }
  };
  groom.addEventListener('pointerup', end);
  groom.addEventListener('pointercancel', end);

  groom.addEventListener('keydown', e => {
    if (done) return;
    measure();
    if (e.key === 'ArrowRight') { set(dx + max * .2); if (dx >= max * .99) unite(); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { set(dx - max * .2); e.preventDefault(); }
    else if (e.key === 'Enter' || e.key === ' ') { unite(); e.preventDefault(); }
  });

  addEventListener('resize', () => { measure(); if (done) set(max); });
  measure(); set(0);
  const days = Math.ceil((target - Date.now()) / 864e5);
  chip.textContent = days > 0 ? days + ' hari menuju hari bahagia' : 'Hari bahagia telah tiba';
})();
tagBtn.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(tagText.textContent); tagBtn.textContent = 'Tersalin'; }
  catch { tagBtn.textContent = 'Gagal menyalin'; }
  setTimeout(() => tagBtn.textContent = 'Salin Hashtag', 2000);
});

const WA_NUMBER = '6281358107311';
waBtn.addEventListener('click', () => {
  rsvpForm.classList.add('was-validated');
  if (!rsvpForm.checkValidity()) return;
  const text = 'Halo, saya ' + nama.value.trim() + '.\n' +
    'Konfirmasi kehadiran: ' + hadir.value + '.\n' +
    'Ucapan: ' + pesan.value.trim() + '\n\n' +
    '(Undangan Pernikahan Zaen & Nala, 28 Desember 2026)';
  window.open('https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text), '_blank');
});

function burstAt(x, y, n) {
  if (still) return;
  for (let i = 0; i < n; i++) {
    const s = document.createElement('i');
    const a = Math.random() * 6.28, r = 30 + Math.random() * 55;
    s.className = 'tap';
    s.style.left = x + 'px'; s.style.top = y + 'px';
    s.style.background = i % 3 ? '#f5e2a3' : '#e9c1b5';
    s.style.setProperty('--bx', Math.cos(a) * r + 'px');
    s.style.setProperty('--by', Math.sin(a) * r + 'px');
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 850);
  }
}
function confetti() {
  if (still) return;
  const cols = ['#f5e2a3', '#d4af5f', '#e9c1b5', '#f4ecd8'];
  for (let i = 0; i < 70; i++) {
    const c = document.createElement('i');
    c.className = 'conf';
    c.style.left = Math.random() * 100 + 'vw';
    c.style.background = cols[i % 4];
    c.style.setProperty('--sx', (Math.random() * 240 - 120) + 'px');
    c.style.setProperty('--d', (2.5 + Math.random() * 2.2) + 's');
    c.style.animationDelay = (Math.random() * .6) + 's';
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 5500);
  }
}
document.addEventListener('pointerdown', e => {
  if (e.target.closest('a,button,input,select,textarea,summary,label,#cover,.modal,.pol,#fpCanvas')) return;
  burstAt(e.clientX, e.clientY, 9);
});
const partyBtn = document.getElementById('partyBtn');
if (partyBtn) partyBtn.addEventListener('click', confetti);

(() => {
  const st = document.getElementById('polStage'); if (!st) return;
  const pols = [...st.querySelectorAll('.pol')];
  let z = 10;
  const put = (p, x, y) => { p._x = x; p._y = y; p.style.setProperty('--x', x); p.style.setProperty('--y', y); };
  pols.forEach((p, i) => {
    const step = Math.min(110, st.clientWidth / 6);
    put(p, (i - (pols.length - 1) / 2) * step, (i % 2 ? 1 : -1) * (14 + Math.random() * 22));
    p.style.setProperty('--r', (p.dataset.r || 0) + 'deg');
    let sx, sy, ox, oy, moved;
    p.addEventListener('pointerdown', e => {
      p.setPointerCapture(e.pointerId);
      sx = e.clientX; sy = e.clientY; ox = p._x; oy = p._y; moved = false;
      p.style.zIndex = ++z; p.classList.add('drag');
    });
    p.addEventListener('pointermove', e => {
      if (!p.classList.contains('drag')) return;
      const dx = e.clientX - sx, dy = e.clientY - sy;
      if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;
      const mx = st.clientWidth / 2 - 60, my = st.clientHeight / 2 - 60;
      put(p, Math.max(-mx, Math.min(mx, ox + dx)), Math.max(-my, Math.min(my, oy + dy)));
    });
    const up = () => {
      if (!p.classList.contains('drag')) return;
      p.classList.remove('drag');
      if (!moved) p.classList.toggle('flip');
    };
    p.addEventListener('pointerup', up);
    p.addEventListener('pointercancel', up);
  });
})();

(() => {
  const a = document.getElementById('songAudio'), btn = document.getElementById('songBtn'),
        v = document.getElementById('vinyl'), note = document.getElementById('songNote');
  if (!a) return;
  btn.addEventListener('click', () => {
    if (a.paused) {
      if (!bgm.paused) { bgm.pause(); musicBtn.classList.remove('playing'); }
      a.play().then(() => { v.classList.add('spin'); btn.textContent = 'Jeda Lagu'; })
        .catch(() => { note.textContent = 'File lagu belum tersedia. Tambahkan audio/lagu.mp3.'; });
    } else { a.pause(); v.classList.remove('spin'); btn.textContent = 'Putar Lagu'; }
  });
  a.addEventListener('ended', () => { v.classList.remove('spin'); btn.textContent = 'Putar Lagu'; });

  const START = new Date('2020-01-01T00:00:00+07:00');
  const days = Math.floor((Date.now() - START) / 864e5);
  const box = document.getElementById('together');
  if (days <= 0) { box.hidden = true; return; }
  const yrs = Math.floor(days / 365), mos = Math.floor((days % 365) / 30);
  document.getElementById('daysSub').textContent = 'hari, sekitar ' + yrs + ' tahun ' + mos + ' bulan';
  const num = document.getElementById('daysNum');
  new IntersectionObserver((es, o) => es.forEach(e => {
    if (!e.isIntersecting) return;
    o.disconnect();
    const t0 = performance.now();
    (function step(t) {
      const k = Math.min(1, (t - t0) / 1800);
      num.textContent = Math.round(days * (1 - Math.pow(1 - k, 3))).toLocaleString('id-ID');
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }), { threshold: .4 }).observe(box);
})();

(() => {
  const body = document.getElementById('quizBody'); if (!body) return;
  const Q = [
    { q: 'Di kota mana pernikahan Zaen & Nala digelar?', o: ['Bandung', 'Surabaya', 'Denpasar', 'Yogyakarta'], a: 1, n: 'Acara digelar di Ketintang, Surabaya.' },
    { q: 'Tanggal berapa hari bahagia mereka?', o: ['18 Desember', '28 Desember', '8 Januari', '20 Desember'], a: 1, n: 'Hari bahagianya 28 Desember 2026.' },
    { q: 'Pukul berapa acara dimulai?', o: ['09.00 WIB', '10.00 WIB', '11.00 WIB', '13.00 WIB'], a: 2, n: 'Akad dimulai pukul 11.00 WIB.' },
    { q: 'Siapa yang lebih sering mengalah?', o: ['Zaen', 'Nala', 'Gantian', 'Rahasia dapur'], a: 2, n: 'Kata mereka, gantian itu kuncinya.' },
    { q: 'Makanan favorit Nala?', o: ['Sate', 'Bakso', 'Pasta', 'Sushi'], a: 0, n: 'Sate selalu jadi pilihan pertama.' }
  ];
  let i = 0, score = 0, locked = false;
  const $ = id => document.getElementById(id);
  const end = $('qEnd');
  function show() {
    locked = false; end.hidden = true; body.hidden = false;
    $('qNext').hidden = true; $('qNote').textContent = '';
    $('qNum').textContent = 'Pertanyaan ' + (i + 1) + ' dari ' + Q.length;
    $('qScore').textContent = 'Skor ' + score;
    $('qBar').style.width = (i / Q.length * 100) + '%';
    $('qText').textContent = Q[i].q;
    const box = $('qOpts'); box.innerHTML = '';
    Q[i].o.forEach((t, k) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'q-opt'; b.textContent = t;
      b.addEventListener('click', () => pick(k, b));
      box.appendChild(b);
    });
  }
  function pick(k, b) {
    if (locked) return; locked = true;
    const ok = k === Q[i].a, btns = [...$('qOpts').children];
    btns[Q[i].a].classList.add('ok');
    if (!ok) b.classList.add('bad');
    btns.forEach(x => x.disabled = true);
    if (ok) { score++; const r = b.getBoundingClientRect(); burstAt(r.left + r.width / 2, r.top + r.height / 2, 12); }
    $('qScore').textContent = 'Skor ' + score;
    $('qNote').textContent = (ok ? 'Benar! ' : 'Belum tepat. ') + Q[i].n;
    $('qNext').hidden = false;
    $('qNext').textContent = i === Q.length - 1 ? 'Lihat Hasil' : 'Lanjut';
  }
  $('qNext').addEventListener('click', () => { i++; i < Q.length ? show() : finish(); });
  function finish() {
    body.hidden = true; end.hidden = false;
    $('qBar').style.width = '100%';
    $('qFinal').textContent = score + ' / ' + Q.length;
    $('qMsg').textContent = score === Q.length ? 'Sempurna! Kamu benar-benar sahabat dekat kami.'
      : score >= 3 ? 'Hebat! Kamu cukup kenal kami berdua.' : 'Tidak apa-apa, kita kenalan lagi di hari bahagia nanti.';
    if (score >= 4) confetti();
  }
  $('qAgain').addEventListener('click', () => { i = 0; score = 0; show(); });
  show();
})();

(() => {
  const cvs = document.getElementById('fpCanvas'); if (!cvs) return;
  const ctx = cvs.getContext('2d'), W = 1080, H = 1350;
  const pick = document.getElementById('fpPick'), inp = document.getElementById('fpInput'), dl = document.getElementById('fpDl');
  let img = null;
  function arch(x, y, w, h) {
    const r = w / 2;
    ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y + r);
    ctx.arc(x + r, y + r, r, Math.PI, 0); ctx.lineTo(x + w, y + h); ctx.closePath();
  }
  function draw() {
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#12403a'); bg.addColorStop(1, '#0b2a25');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    const gold = ctx.createLinearGradient(0, 0, W, 0);
    ['#8c6a2c', '#f5e2a3', '#c9a24d', '#f8e9b8', '#8c6a2c'].forEach((c, k) => gold.addColorStop(k / 4, c));
    ctx.strokeStyle = gold; ctx.lineWidth = 3; ctx.strokeRect(40, 40, W - 80, H - 80);
    ctx.lineWidth = 1; ctx.strokeRect(58, 58, W - 116, H - 116);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#d4af5f'; ctx.font = '400 30px Jost, sans-serif';
    ctx.fillText('T H E   W E D D I N G   O F', W / 2, 135);
    const ax = 170, ay = 175, aw = 740, ah = 800;
    ctx.save(); arch(ax, ay, aw, ah); ctx.clip();
    if (img) {
      const s = Math.max(aw / img.width, ah / img.height), dw = img.width * s, dh = img.height * s;
      ctx.drawImage(img, ax + (aw - dw) / 2, ay + (ah - dh) * .2, dw, dh);
    } else {
      ctx.fillStyle = '#1a5a50'; ctx.fillRect(ax, ay, aw, ah);
      ctx.fillStyle = '#f5e2a3'; ctx.font = 'italic 500 56px "Cormorant Garamond", serif';
      ctx.fillText('Pilih fotomu', W / 2, ay + ah / 2);
    }
    ctx.restore();
    ctx.strokeStyle = gold; ctx.lineWidth = 6; arch(ax, ay, aw, ah); ctx.stroke();
    ctx.lineWidth = 2; arch(ax - 18, ay - 18, aw + 36, ah + 36); ctx.stroke();
    ctx.fillStyle = gold; ctx.font = '130px "Pinyon Script", cursive';
    ctx.fillText('Zaen & Nala', W / 2, 1150);
    ctx.fillStyle = '#f4ecd8'; ctx.font = '500 44px "Cormorant Garamond", serif';
    ctx.fillText('28 DESEMBER 2026', W / 2, 1215);
    ctx.fillStyle = '#d4af5f'; ctx.font = '400 34px Jost, sans-serif';
    ctx.fillText(document.getElementById('tagText').textContent, W / 2, 1268);
  }
  draw();
  if (document.fonts) Promise.all([document.fonts.load('130px "Pinyon Script"'), document.fonts.load('500 44px "Cormorant Garamond"'), document.fonts.load('400 30px Jost')]).then(draw).catch(() => {});
  pick.addEventListener('click', () => inp.click());
  inp.addEventListener('change', () => {
    const f = inp.files[0]; if (!f) return;
    const im = new Image(), url = URL.createObjectURL(f);
    im.onload = () => { img = im; draw(); dl.disabled = false; URL.revokeObjectURL(url); };
    im.src = url;
  });
  dl.addEventListener('click', () => {
    cvs.toBlob(b => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b); a.download = 'bingkai-zaen-nala.png'; a.click();
    }, 'image/png');
  });
})();

function renderSky() {
  const sky = document.getElementById('wishSky'); if (!sky) return;
  let data = load().slice(0, 9), sample = false;
  if (!data.length) {
    sample = true;
    data = [
      { nama: 'Sahabat', pesan: 'Selamat menempuh hidup baru, semoga samawa!' },
      { nama: 'Keluarga', pesan: 'Semoga selalu bahagia dan dilimpahi berkah.' },
      { nama: 'Rekan Kerja', pesan: 'Turut berbahagia untuk kalian berdua!' },
      { nama: 'Teman Kuliah', pesan: 'Akhirnya sah juga! Langgeng sampai kakek nenek.' },
      { nama: 'Tetangga', pesan: 'Barakallah, semoga jadi keluarga yang harmonis.' },
      { nama: 'Sepupu', pesan: 'Happy wedding! Jangan lupa traktir ya.' },
      { nama: 'Sahabat Lama', pesan: 'Bahagia selalu, Zaen dan Nala!' }
    ];
  }
  sky.innerHTML = '';
  const rows = [6, 37, 68];            
  data.forEach((w, k) => {
    const c = document.createElement('div'); c.className = 'sky-card';
    c.innerHTML = '<b></b><span></span>';
    c.querySelector('b').textContent = w.nama + (sample ? ' · contoh' : '');
    c.querySelector('span').textContent = String(w.pesan).slice(0, 90);
    c.style.top = rows[k % 3] + '%';
    const dur = 30;                    
    c.style.setProperty('--d', dur + 's');
    c.style.animationDelay = (-(k * dur / data.length)) + 's';
    sky.appendChild(c);
  });
}

rsvpForm.addEventListener('submit', () => setTimeout(renderSky, 0));
renderSky();

(() => {
  const sec = document.querySelector('.couple'), base = document.getElementById('cupid');
  if (!sec || !base || still) return;

  const second = base.cloneNode(true);
  second.removeAttribute('id');
  second.classList.add('two');
  sec.appendChild(second);

  let live = false, dustCount = 0;
  new IntersectionObserver(es => { live = es[0].isIntersecting; }).observe(sec);

  const TRAIL_MS = 2800;   
  const add = (cls, px, py, vars) => {
    const el = document.createElement('i');
    el.className = cls; el.style.left = px + 'px'; el.style.top = py + 'px';
    for (const k in vars) el.style.setProperty(k, vars[k]);
    sec.appendChild(el);
    return el;
  };

  function fly(c, speed, startX, startY, phase) {
    const flip = c.querySelector('.cp-flip'), spin = c.querySelector('.cp-spin');
    let x = startX, y = startY, vx = 0, vy = 0, tx = x, ty = y, hover = 0, face = 1, tilt = 0,
        t = phase, last = performance.now(), dustT = 0, shootT = 2 + phase;

    const pick = () => {
      const w = sec.clientWidth - c.offsetWidth, h = sec.clientHeight - c.offsetHeight;
      tx = 10 + Math.random() * Math.max(10, w - 20);
      ty = 60 + Math.random() * Math.max(10, h - 130);
      hover = Math.random() < .35 ? .4 + Math.random() * .9 : 0;
    };
    const heart = () => {
      const el = add('cp-heart', x + c.offsetWidth / 2 + face * 36, y + c.offsetHeight * .45, {
        '--hx': (face * (90 + Math.random() * 70)) + 'px',
        '--hy': (-30 - Math.random() * 70) + 'px',
        '--hr': (face * 25) + 'deg'
      });
      el.textContent = '♥';
      setTimeout(() => el.remove(), 1600);
    };
    pick();

    (function loop(now) {
      const dt = Math.min(.05, (now - last) / 1000); last = now; t += dt;
      if (live) {
        const dx = tx - x, dy = ty - y, d = Math.hypot(dx, dy) || 1;
        if (d < 30) { if (hover > 0) hover -= dt; else pick(); }
        const sp = (d < 30 ? 20 : 190) * speed, k = Math.min(1, dt * 2.4);
        vx += (dx / d * sp - vx) * k;
        vy += (dy / d * sp - vy) * k;
        x += (vx + Math.sin(t * 8.7) * 42) * dt;
        y += (vy + Math.cos(t * 6.1) * 42 + Math.sin(t * 3.3) * 16) * dt;
        if (Math.abs(vx) > 15) face = vx > 0 ? 1 : -1;
        const want = Math.max(-18, Math.min(18, Math.abs(vx) / 16 + vy / 22));
        tilt += (want - tilt) * Math.min(1, dt * 6);
        c.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
        flip.style.transform = 'scaleX(' + face + ') rotate(' + tilt.toFixed(1) + 'deg)';

        dustT -= dt;
        if (dustT <= 0 && Math.hypot(vx, vy) > 60 && dustCount < 160) {
          dustT = .07;
          dustCount++;
          const el = add('cp-dust', x + c.offsetWidth / 2 - face * c.offsetWidth * .32, y + c.offsetHeight * .6, { '--dx': (-face * 28) + 'px' });
          setTimeout(() => { el.remove(); dustCount--; }, TRAIL_MS);
        }
        shootT -= dt;
        if (shootT <= 0) { heart(); shootT = 5 + Math.random() * 4; }
      } else { last = now; }
      requestAnimationFrame(loop);
    })(last);

    c.addEventListener('click', () => {
      for (let i = 0; i < 5; i++) setTimeout(heart, i * 90);
      spin.classList.remove('go'); void spin.offsetWidth; spin.classList.add('go');
      hover = 1;
    });
  }

  fly(base, 1, 30, 90, 0);
  fly(second, .85, Math.max(40, sec.clientWidth - 160), Math.max(200, sec.clientHeight * .55), 1.7);
})();

(() => {
  const $ = s => document.querySelector(s);
  const mk = (tag, cls, html) => { const e = document.createElement(tag); e.className = cls; if (html) e.innerHTML = html; return e; };

  const spots = host => {
    if (!host || still) return;
    [[28, 13, 0], [72, 17, -6]].forEach(([ox, sd, dl]) => {
      const s = mk('div', 'spot');
      s.style.setProperty('--ox', ox + '%');
      s.style.setProperty('--sd', sd + 's');
      s.style.animationDelay = dl + 's';
      host.appendChild(s);
    });
  };
  spots($('.hero')); spots($('#invitation > footer'));

  const fireworks = () => {
    if (still) return;
    const cols = ['#f5e2a3', '#d4af5f', '#e9c1b5', '#fff6d6', '#e0475b'];
    for (let b = 0; b < 5; b++) setTimeout(() => {
      const x = innerWidth * (.15 + Math.random() * .7), y = innerHeight * (.15 + Math.random() * .4);
      for (let i = 0; i < 26; i++) {
        const p = mk('i', 'fw'), a = i / 26 * 6.283, r = 70 + Math.random() * 60;
        p.style.left = x + 'px'; p.style.top = y + 'px';
        p.style.background = cols[(i + b) % cols.length];
        p.style.setProperty('--bx', Math.cos(a) * r + 'px');
        p.style.setProperty('--by', Math.sin(a) * r + 'px');
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1500);
      }
    }, b * 380);
  };
  const pb = document.getElementById('partyBtn');
  if (pb) pb.addEventListener('click', fireworks);

  ['.story', '.family', '.events', '.rundown', '.maps', '.guestinfo', '.live', '.gallery', '.memories', '.song', '.quiz', '.hashtag', '.photoframe', '.gift-sec', '.rsvp']
    .forEach(sel => {
      const s = $(sel); if (!s) return;
      s.appendChild(mk('div', 'bot bot-a'));
      s.appendChild(mk('div', 'bot bot-b'));
    });

  if (!still) {
    const BF = `<svg viewBox="0 0 40 30" aria-hidden="true">
      <g class="bw l"><path d="M20 15C14 4 4 2 3 8C2 14 10 16 20 15Z" fill="#d4af5f"/><path d="M20 16C12 18 6 24 9 27C13 29 19 22 20 16Z" fill="#f5e2a3"/></g>
      <g class="bw r"><path d="M20 15C26 4 36 2 37 8C38 14 30 16 20 15Z" fill="#d4af5f"/><path d="M20 16C28 18 34 24 31 27C27 29 21 22 20 16Z" fill="#f5e2a3"/></g>
      <path d="M20 8V24" stroke="#6b4528" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M20 8C18 4 16 3 15 3M20 8C22 4 24 3 25 3" stroke="#6b4528" fill="none" stroke-width=".9" stroke-linecap="round"/></svg>`;
    [['.couple', [[28, 30, 0, 1], [62, 38, -14, .8]]], ['.story', [[40, 34, -6, .9]]]].forEach(([sel, list]) => {
      const s = $(sel); if (!s) return;
      list.forEach(([top, dur, del, sc]) => {
        const b = mk('div', 'bfly', BF);
        b.style.top = top + '%';
        b.style.setProperty('--bd', dur + 's');
        b.style.setProperty('--bw', del + 's');
        b.style.setProperty('--bs', sc);
        s.appendChild(b);
      });
    });
  }

  const oc = $('.opening .container');
  if (oc) oc.insertBefore(mk('div', 'env-wrap', `<svg viewBox="0 0 80 72" aria-hidden="true">
      <path class="env-open" d="M6 24L40 2L74 24Z" fill="#16493f" stroke="#d4af5f" stroke-width="1.4" stroke-linejoin="round"/>
      <g class="env-letter"><rect x="15" y="28" width="50" height="34" rx="2" fill="#f4ecd8"/><path d="M23 38h34M23 45h34M23 52h20" stroke="#c9a24d" stroke-width="1.4" stroke-linecap="round"/></g>
      <rect x="6" y="24" width="68" height="44" rx="3" fill="#0f2f2a" stroke="#d4af5f" stroke-width="1.4"/>
      <path d="M6 68L34 46M74 68L46 46" stroke="#d4af5f" stroke-width="1.2" fill="none" stroke-linecap="round"/>
      <g class="env-closed"><path d="M6 24L40 48L74 24Z" fill="#16493f" stroke="#d4af5f" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M40 52c-6-5-11 1-6 6l6 5 6-5c5-5 0-11-6-6z" fill="#e0475b" transform="translate(0,-12)"/></g></svg>`), oc.firstChild);

  const mem = $('.memories');
  if (mem) {
    const L = mk('div', 'lights');
    for (let k = 0; k < 14; k++) {
      const b = document.createElement('i');
      b.style.setProperty('--k', k);
      b.style.animationDelay = (-(k * .37) % 2.8) + 's';
      L.appendChild(b);
    }
    mem.appendChild(L);
  }

  document.querySelectorAll('.gallery .shot').forEach(s => s.addEventListener('click', e => {
    if (still) return;
    for (let i = 0; i < 7; i++) {
      const h = mk('div', 'heartup', '♥');
      h.style.left = e.clientX + 'px'; h.style.top = e.clientY + 'px';
      h.style.setProperty('--hx', (Math.random() * 120 - 60) + 'px');
      h.style.setProperty('--hy', (-110 - Math.random() * 90) + 'px');
      h.style.setProperty('--hs', .8 + Math.random() * .9);
      h.style.animationDelay = (i * .07) + 's';
      document.body.appendChild(h);
      setTimeout(() => h.remove(), 1900);
    }
  }));

  // 10) Bintang jatuh
  if (!still) [['.opening', [[14, 8, 11, 0], [30, 52, 15, -7]]], ['.quote', [[10, 20, 13, -3]]], ['#invitation > footer', [[16, 60, 17, -9]]]]
    .forEach(([sel, list]) => {
      const h = $(sel); if (!h) return;
      list.forEach(([t, l, d, w]) => {
        const s = mk('div', 'shoot');
        s.style.top = t + '%'; s.style.left = l + '%';
        s.style.setProperty('--d', d + 's'); s.style.setProperty('--w', w + 's');
        h.appendChild(s);
      });
    });
})();

(() => {
  if (!document.getElementById('fontCaveat')) {
    const l = document.createElement('link');
    l.id = 'fontCaveat'; l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap';
    document.head.appendChild(l);
  }

  document.body.insertAdjacentHTML('afterbegin', `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <filter id="wob" x="-6%" y="-6%" width="112%" height="112%">
    <feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="3.4"/>
  </filter>

  <symbol id="sk-bib" viewBox="0 0 200 140">
    <g filter="url(#wob)" stroke="#4a5240" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 16C64 9 138 9 188 16L195 124C140 133 60 133 5 124Z" fill="#efe6cf" stroke-width="3"/>
      <path d="M20 27C70 22 130 22 180 27" fill="none" stroke-width="1.8"/>
      <g fill="#4a5240" stroke="none"><circle cx="20" cy="18" r="3"/><circle cx="180" cy="18" r="3"/><circle cx="14" cy="120" r="3"/><circle cx="186" cy="120" r="3"/></g>
      <text x="100" y="47" text-anchor="middle" font-family="Jost,sans-serif" font-size="14" font-weight="500" letter-spacing="4" fill="#4a5240" stroke="none">ZAEN &amp; NALA</text>
      <text x="100" y="99" text-anchor="middle" font-family="Cormorant Garamond,serif" font-size="58" font-weight="700" fill="none" stroke-width="2">2812</text>
      <path d="M20 107C70 110 130 110 180 107" fill="none" stroke-width="1.8"/>
      <text x="100" y="125" text-anchor="middle" font-family="Jost,sans-serif" font-size="13" font-weight="500" letter-spacing="6" fill="#4a5240" stroke="none">WEDDING</text>
      <g transform="rotate(-35 26 22)" fill="#efe6cf" stroke-width="2.2"><rect x="6" y="16" width="42" height="10" rx="5"/><path d="M14 21H38" fill="none"/></g>
    </g>
  </symbol>

  <symbol id="sk-ticket" viewBox="0 0 200 90">
    <g filter="url(#wob)" stroke="#4a5240" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 10H190V34A11 11 0 0 0 190 56V80H10V56A11 11 0 0 0 10 34Z" fill="#efe6cf" stroke-width="3"/>
      <path d="M148 15V75" fill="none" stroke-width="2" stroke-dasharray="4 5"/>
      <text x="78" y="37" text-anchor="middle" font-family="Jost,sans-serif" font-size="12" font-weight="500" letter-spacing="3" fill="#4a5240" stroke="none">ZAEN &amp; NALA</text>
      <text x="78" y="64" text-anchor="middle" font-family="Cormorant Garamond,serif" font-size="27" font-weight="700" fill="none" stroke-width="1.6">WEDDING</text>
      <text transform="translate(170 45) rotate(90)" text-anchor="middle" font-family="Jost,sans-serif" font-size="11" font-weight="500" letter-spacing="3" fill="#4a5240" stroke="none">ADMIT ONE</text>
    </g>
  </symbol>

  <symbol id="sk-stamp" viewBox="0 0 110 130">
    <g filter="url(#wob)" stroke="#4a5240" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 6H104V124H6Z" fill="#efe6cf" stroke-width="4" stroke-dasharray="6 4"/>
      <rect x="17" y="17" width="76" height="96" fill="none" stroke-width="2"/>
      <text x="55" y="32" text-anchor="middle" font-family="Jost,sans-serif" font-size="9" font-weight="500" letter-spacing="3" fill="#4a5240" stroke="none">INDONESIA</text>
      <path d="M55 88C31 70 35 46 47 46C52 46 55 50 55 53C55 50 58 46 63 46C75 46 79 70 55 88Z" fill="#e9c1b5" stroke-width="2.6"/>
      <text x="55" y="106" text-anchor="middle" font-family="Jost,sans-serif" font-size="10" font-weight="500" letter-spacing="2" fill="#4a5240" stroke="none">28.12.26</text>
    </g>
  </symbol>

  <symbol id="sk-passport" viewBox="0 0 120 120">
    <path id="skp" d="M60,60 m-39,0 a39,39 0 1,1 78,0 a39,39 0 1,1 -78,0" fill="none"/>
    <g filter="url(#wob)" stroke="#4a5240" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="60" cy="60" r="56" fill="#efe6cf" stroke-width="3"/>
      <circle cx="60" cy="60" r="48" fill="none" stroke-width="1.6"/>
      <circle cx="60" cy="60" r="29" fill="none" stroke-width="1.6"/>
      <text font-family="Jost,sans-serif" font-size="11" font-weight="600" letter-spacing="2" fill="#4a5240" stroke="none"><textPath href="#skp">SURABAYA ✦ 28 DES 2026 ✦ </textPath></text>
      <g transform="rotate(-10 60 60)"><rect x="31" y="50" width="58" height="21" rx="2" fill="none" stroke-width="2"/><text x="60" y="65.5" text-anchor="middle" font-family="Jost,sans-serif" font-size="12" font-weight="600" letter-spacing="2" fill="#4a5240" stroke="none">ARRIVED</text></g>
    </g>
  </symbol>

  <symbol id="sk-cassette" viewBox="0 0 160 104">
    <g filter="url(#wob)" stroke="#4a5240" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6" y="8" width="148" height="88" rx="9" fill="#efe6cf" stroke-width="3"/>
      <rect x="18" y="18" width="124" height="36" rx="4" fill="none" stroke-width="2"/>
      <text x="80" y="43" text-anchor="middle" font-family="Caveat,cursive" font-size="25" font-weight="700" fill="#4a5240" stroke="none">our song ♡</text>
      <rect x="46" y="60" width="68" height="20" rx="10" fill="none" stroke-width="2.2"/>
      <circle cx="62" cy="70" r="6" fill="none" stroke-width="2"/><circle cx="98" cy="70" r="6" fill="none" stroke-width="2"/>
      <path d="M30 96L40 84M130 96L120 84" fill="none" stroke-width="2"/>
      <g fill="#4a5240" stroke="none"><circle cx="16" cy="16" r="2.4"/><circle cx="144" cy="16" r="2.4"/><circle cx="16" cy="88" r="2.4"/><circle cx="144" cy="88" r="2.4"/></g>
    </g>
  </symbol>

  <symbol id="sk-polaroid" viewBox="0 0 110 130">
    <g filter="url(#wob)" stroke="#4a5240" stroke-linecap="round" stroke-linejoin="round">
      <rect x="6" y="6" width="98" height="118" fill="#efe6cf" stroke-width="3"/>
      <rect x="14" y="14" width="82" height="78" fill="#2e6b5e" stroke-width="2"/>
      <path d="M55 78C34 62 38 42 48 42C52 42 55 45 55 48C55 45 58 42 62 42C72 42 76 62 55 78Z" fill="none" stroke="#efe6cf" stroke-width="2.4"/>
      <text x="55" y="113" text-anchor="middle" font-family="Caveat,cursive" font-size="21" font-weight="700" fill="#4a5240" stroke="none">forever</text>
      <rect x="33" y="-3" width="44" height="14" fill="#e9c1b5" stroke-width="1.6" transform="rotate(-4 55 4)"/>
    </g>
  </symbol>

  <symbol id="sk-heart" viewBox="0 0 64 64">
    <g filter="url(#wob)" stroke="#4a5240" stroke-linecap="round" stroke-linejoin="round">
      <path d="M32 58C6 40 8 14 24 14C29 14 32 18 32 22C32 18 35 14 40 14C56 14 58 40 32 58Z" fill="#e9c1b5" stroke-width="3"/>
      <path d="M18 25C19 21 23 20 26 23M14 33C14 30 15 28 16 27" fill="none" stroke-width="2"/>
    </g>
  </symbol>

  <symbol id="sk-sparkle" viewBox="0 0 64 64">
    <g filter="url(#wob)" stroke="#4a5240" stroke-linecap="round" stroke-linejoin="round">
      <path d="M32 4C34 24 42 30 60 32C42 34 34 40 32 60C30 40 22 34 4 32C22 30 30 24 32 4Z" fill="#efe6cf" stroke-width="3"/>
    </g>
  </symbol>

  <symbol id="sk-flower" viewBox="0 0 64 64">
    <g filter="url(#wob)" stroke="#4a5240" stroke-linecap="round" stroke-linejoin="round">
      <g fill="#efe6cf" stroke-width="2.2">
        <ellipse cx="32" cy="14" rx="6" ry="11"/><ellipse cx="32" cy="14" rx="6" ry="11" transform="rotate(45 32 32)"/>
        <ellipse cx="32" cy="14" rx="6" ry="11" transform="rotate(90 32 32)"/><ellipse cx="32" cy="14" rx="6" ry="11" transform="rotate(135 32 32)"/>
        <ellipse cx="32" cy="14" rx="6" ry="11" transform="rotate(180 32 32)"/><ellipse cx="32" cy="14" rx="6" ry="11" transform="rotate(225 32 32)"/>
        <ellipse cx="32" cy="14" rx="6" ry="11" transform="rotate(270 32 32)"/><ellipse cx="32" cy="14" rx="6" ry="11" transform="rotate(315 32 32)"/>
      </g>
      <circle cx="32" cy="32" r="8" fill="#f5c451" stroke-width="2.4"/>
    </g>
  </symbol>

  <symbol id="sk-arrow" viewBox="0 0 100 64">
    <g filter="url(#wob)" fill="none" stroke="#efe6cf" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 54C22 16 56 8 86 26"/><path d="M70 15L88 27L72 42"/>
    </g>
  </symbol>
  </defs></svg>`);

  const PLAN = {
    '.opening':   [['bib','tl',-8,150],['note:Dua hati, satu cerita ♡','br',7,150]],
    '.facts':     [['polaroid','tr',9,92],['note:Fun facts tentang kami!','bl',-6,150],['sparkle','mr',10,50]],
    '.story':     [['passport','tl',-9,100],['note:Cerita kami, versi singkat','br',6,150],['sparkle','ml',-8,50]],
    '.family':    [['stamp','tr',8,84],['note:Terima kasih, Ayah & Ibu ♡','bl',-7,160]],
    '.events':    [['ticket','tr',7,165],['note:Jangan sampai telat ya!','bl',-8,150]],
    '.rundown':   [['note:Pssst, ini jadwal lengkapnya','tr',6,160],['stamp','bl',-9,84],['sparkle','ml',8,50]],
    '.maps':      [['arrow','tl',-6,92],['note:Awas nyasar! Ikuti peta ini','tr',-6,160],['passport','bl',8,96]],
    '.guestinfo': [['note:Info penting, dibaca dulu ya','tl',-6,160],['flower','br',10,60],['sparkle','mr',-8,50]],
    '.live':      [['polaroid','tr',8,88],['note:Nonton dari rumah juga boleh','bl',-7,160]],
    '.gallery':   [['polaroid','tl',-10,92],['note:Foto-foto favorit kami','tr',7,150],['flower','bl',9,60],['heart','br',-8,56]],
    '.song':      [['cassette','tl',-8,135],['note:Putar kencang-kencang!','br',7,150],['sparkle','mr',8,50]],
    '.quiz':      [['note:Berani ikut kuis? Nilaimu berapa?','tl',-7,160],['stamp','br',9,84],['heart','bl',-8,56]],
    '.hashtag':   [['note:Jangan lupa tag kami ya!','tl',-6,150],['sparkle','tr',10,50],['polaroid','bl',-7,86]],
    '.photoframe':[['polaroid','tr',8,90],['note:Gaya paling cakep, ya!','bl',-7,150]],
    '.gift-sec':  [['note:Doa kalian sudah cukup ♡','tl',-8,160],['stamp','br',7,84],['flower','tr',12,60]],
    '.rsvp':      [['note:Ditunggu kehadirannya!','tr',7,150],['passport','bl',-8,96],['heart','tl',-9,56]],
  };

  const secs = [];
  Object.keys(PLAN).forEach(sel => {
    const sec = document.querySelector(sel); if (!sec) return;
    secs.push(sec);
    PLAN[sel].forEach(([type, pos, rot, size]) => {
      const el = document.createElement('span');
      el.setAttribute('aria-hidden', 'true');
      el.className = 'stk p-' + pos;
      el.style.setProperty('--r', rot + 'deg');
      el.style.setProperty('--s', (size || 90) + 'px');
      el.style.animationDelay = (-Math.random() * 6).toFixed(2) + 's';
      el.style.animationDuration = (5 + Math.random() * 3).toFixed(2) + 's';
      if (type.indexOf('note:') === 0) {
        el.classList.add('note');
        el.textContent = type.slice(5);
      } else {
        const vb = { bib: '200 140', ticket: '200 90', stamp: '110 130', passport: '120 120', cassette: '160 104', polaroid: '110 130', arrow: '100 64' }[type] || '64 64';
        const wh = vb.split(' ');
        el.innerHTML = '<svg viewBox="0 0 ' + vb + '"><use href="#sk-' + type + '" width="' + wh[0] + '" height="' + wh[1] + '"/></svg>';
      }
      sec.appendChild(el);
    });
  });

  const io2 = new IntersectionObserver(es => es.forEach(e => {
    e.target.querySelectorAll(':scope > .stk').forEach(s => { s.style.animationPlayState = e.isIntersecting ? 'running' : 'paused'; });
  }));
  secs.forEach(s => io2.observe(s));
})();
