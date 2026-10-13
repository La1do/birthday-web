const $ = id => document.getElementById(id);
const rnd = (a, b) => a + Math.random() * (b - a);

// ===== Cấu hình =====
const MESSAGE = `Nhân dịp sinh nhật chị Quỳnh Trang, em cầu chúc Cha luôn đồng hành, che chở và ban phước lành dư dật trên từng bước đường của chị. Chúc chị tuổi mới luôn vững vàng đức tin, bình an và tràn đầy niềm vui—nhớ cười thật nhiều mỗi ngày chị nhé! Mong rằng sang năm sau, chị cùng các anh em KVB6 mình sẽ cùng nhau ăn mừng một sinh nhật thật trọn vẹn và ý nghĩa trong tâm linh!`;
const CANDLES = 24;
const PHOTO_FILE = 'photo.png';        // đổi ảnh: thay file hoặc đổi tên ở đây ('' = không hiện ảnh)
const PHOTO_CAPTION = 'Chị Quỳnh Trang 💖';
let selectedPhotoUrl = '';
// Nhạc nền, ưu tiên: MUSIC_FILE > YOUTUBE_ID > nhạc hộp tự tạo
const MUSIC_FILE = '';                 // vd: 'music.mp3' (đặt cùng thư mục)
const YOUTUBE_ID = 'BE0_POJLBp8';      // phần sau v= trong link YouTube ('' = tắt)
const TYPE_SPEED = 38; // ms / ký tự

// ===== Confetti (an toàn nếu CDN lỗi) =====
const fx = o => { try { window.confetti && window.confetti({ zIndex: 10, ...o }); } catch (e) {} };
function burst() {
  const end = Date.now() + 2500;
  (function f() {
    fx({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0, y: .8 } });
    fx({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1, y: .8 } });
    if (Date.now() < end) requestAnimationFrame(f);
  })();
  fx({ particleCount: 160, spread: 110, startVelocity: 45, origin: { y: .5 } });
}

// ===== Nhạc nền =====
// [tần số Hz, số phách] — Happy Birthday (C major)
const SONG = [
  [392,.75],[392,.25],[440,1],[392,1],[523.25,1],[493.88,2],
  [392,.75],[392,.25],[440,1],[392,1],[587.33,1],[523.25,2],
  [392,.75],[392,.25],[783.99,1],[659.25,1],[523.25,1],[493.88,1],[440,1],
  [698.46,.75],[698.46,.25],[659.25,1],[523.25,1],[587.33,1],[523.25,2]
];
let ctx, master, audio, muted = false;

function tone(f, t, d) {
  [[f, .2, 'triangle'], [f * 2, .06, 'sine']].forEach(([fr, v, type]) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = fr;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(v, t + .01);
    g.gain.exponentialRampToValueAtTime(.0001, t + d * 1.8);
    o.connect(g).connect(master);
    o.start(t); o.stop(t + d * 1.8 + .05);
  });
}
function playOnce() {
  let t = ctx.currentTime + .1;
  SONG.forEach(([f, b]) => { tone(f, t, b * .6); t += b * .6; });
  setTimeout(playOnce, (t - ctx.currentTime + 1.5) * 1000);
}
function startSynth() {
  if (ctx) return;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = muted ? 0 : .7; master.connect(ctx.destination);
    playOnce();
  } catch (e) {}
}
let yt;
function startYouTube() {
  window.onYouTubeIframeAPIReady = () => {
    yt = new YT.Player('yt', {
      width: 200, height: 200, videoId: YOUTUBE_ID,
      playerVars: { autoplay: 1, loop: 1, playlist: YOUTUBE_ID, controls: 0, playsinline: 1 },
      events: {
        onReady: e => { e.target.setVolume(70); if (muted) e.target.mute(); e.target.playVideo(); },
        onError: () => { yt = null; startSynth(); } // video chặn embed / chạy từ file:// -> dùng nhạc hộp
      }
    });
  };
  const s = document.createElement('script');
  s.src = 'https://www.youtube.com/iframe_api';
  s.onerror = startSynth;
  document.head.appendChild(s);
}
function startMusic() {
  try {
    if (MUSIC_FILE) { audio = new Audio(MUSIC_FILE); audio.loop = true; audio.volume = .6; audio.play().catch(startSynth); }
    else if (YOUTUBE_ID) startYouTube();
    else startSynth();
    $('mute').hidden = false;
  } catch (e) {}
}
$('mute').addEventListener('click', () => {
  muted = !muted;
  $('mute').textContent = muted ? '🔇' : '🔊';
  if (audio) audio.muted = muted;
  if (master) master.gain.value = muted ? 0 : .7;
  if (yt && yt.mute) { muted ? yt.mute() : (yt.unMute(), yt.playVideo()); }
});

// ===== Luồng chính =====
function openGift() {
  const s1 = $('s1');
  if (s1.classList.contains('opening')) return;
  s1.classList.add('opening');
  $('open').style.display = 'none';
  startMusic(); // cần thao tác click của người dùng mới phát được
  setTimeout(() => {
    s1.classList.add('hide');
    $('s2').classList.remove('hide');
    fx({ particleCount: 120, spread: 100, origin: { y: .6 } });
  }, 1500);
}
$('open').addEventListener('click', openGift);
$('gift').addEventListener('click', openGift);
$('photoPick').addEventListener('click', () => $('photoInput').click());
$('photoInput').addEventListener('change', event => {
  const file = event.target.files[0];
  if (!file) return;
  if (selectedPhotoUrl) URL.revokeObjectURL(selectedPhotoUrl);
  selectedPhotoUrl = URL.createObjectURL(file);
  $('photoPick').textContent = `Đã chọn: ${file.name}`;
});

// Nến
const cc = ['#ff6b9d', '#7afcff', '#ffd86f', '#b388ff', '#6bff95', '#ff9a6b'];
[Math.ceil(CANDLES / 2), Math.floor(CANDLES / 2)].forEach((n, r) => {
  const row = document.createElement('div');
  row.className = 'row r' + r;
  for (let i = 0; i < n; i++) {
    const c = document.createElement('div'), f = document.createElement('i');
    c.className = 'candle'; c.style.setProperty('--c', cc[(i + r * 3) % 6]);
    f.className = 'flame'; f.style.animationDelay = rnd(0, .3) + 's';
    c.appendChild(f); row.appendChild(c);
  }
  $('candles').appendChild(row);
});

// Co giãn để luôn vừa 1 màn hình (bánh + khung lời chúc)
function fit() {
  const st = $('stage'), W = st.clientWidth, H = st.clientHeight;
  if (!W || !H) return;
  $('cake').style.setProperty('--cs', Math.min(W / 360, H / 225, 1.6));
  const rv = $('reveal');
  rv.style.setProperty('--fit', Math.min(1, W / rv.offsetWidth, H / rv.offsetHeight));
}
addEventListener('resize', fit);
if (window.ResizeObserver) new ResizeObserver(fit).observe($('stage'));
if (document.fonts) document.fonts.ready.then(fit);
$('rest').textContent = MESSAGE; // giữ chỗ sẵn cho cả đoạn chúc để bố cục không nhảy khi gõ chữ
fit();

function showReveal() {
  const p = $('photo'), rv = $('reveal');
  const photoSrc = selectedPhotoUrl || PHOTO_FILE;
  const go = () => {
    fit();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      rv.classList.add('show');
      p.classList.add('show');
      $('cake').classList.add('dim');
      setTimeout(typeMsg, 900);
    }));
  };
  if (!photoSrc) { go(); return; }
  const img = $('photoImg');
  img.onerror = () => { p.hidden = true; go(); };
  img.onload = () => { p.hidden = false; go(); };
  $('photoCap').textContent = PHOTO_CAPTION;
  img.src = photoSrc;
}

let blown = false;
$('blow').addEventListener('click', () => {
  if (blown) return;
  blown = true;
  if (yt && yt.playVideo) yt.playVideo(); // thêm 1 lần click để chắc chắn nhạc chạy
  document.querySelectorAll('.flame').forEach(f => { f.style.transitionDelay = rnd(0, .7) + 's'; });
  $('cake').classList.add('out');
  $('blow').style.visibility = 'hidden';
  setTimeout(() => { burst(); showReveal(); }, 1100);
});

function typeMsg() {
  const el = $('msg');
  let i = 0;
  const iv = setInterval(() => {
    i++;
    $('typed').textContent = MESSAGE.slice(0, i);
    $('rest').textContent = MESSAGE.slice(i);
    if (i >= MESSAGE.length) { clearInterval(iv); el.classList.add('done'); }
  }, TYPE_SPEED);
}

// ===== Nền: sao, bóng bay, trái tim =====
for (let i = 0; i < 90; i++) {
  const s = document.createElement('div'), z = rnd(1, 4);
  s.className = 'star';
  s.style.cssText = `left:${rnd(0, 100)}%;top:${rnd(0, 100)}%;width:${z}px;height:${z}px;animation-delay:${rnd(0, 3)}s`;
  $('stars').appendChild(s);
}
const cols = ['#ff6b9d', '#ffd86f', '#7afcff', '#b388ff', '#6bff95', '#ff9a6b'];
function floatUp(cls, css, life) {
  const d = document.createElement('div');
  d.className = cls; d.style.cssText = css;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), life);
  return d;
}
setInterval(() => floatUp('balloon',
  `left:${rnd(0, 95)}%;background:radial-gradient(circle at 30% 30%,#fff9,${cols[Math.random() * 6 | 0]});animation-duration:${rnd(8, 15)}s`, 16000), 1400);
setInterval(() => {
  const h = floatUp('heart', `left:${rnd(0, 100)}%;font-size:${rnd(14, 32)}px;animation-duration:${rnd(5, 10)}s`, 10000);
  h.textContent = ['💖', '✨', '💗', '🌸'][Math.random() * 4 | 0];
}, 700);