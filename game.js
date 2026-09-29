'use strict';

/* =========================================================
   AKERRA JOKOA — konfigurazioa
   ========================================================= */
const CONFIG = {
  DURATION: 18,           // partida-iraupena segundotan
  SPEED_INITIAL: 320,     // abiadura hasieran (px/s logiko)
  SPEED_MAX: 620,         // abiadura maximoa
  GRAVITY: 2200,          // grabitatea (px/s^2)
  JUMP_FORCE: 820,        // jauziaren indarra (px/s)
  SHOP_URL: 'https://akerra.eus',
  PRIZES: [
    { label: 'J10', discount: 10, weight: 60 },
    { label: 'V15', discount: 15, weight: 30 },
    { label: 'M20', discount: 20, weight: 10 },
  ],
};

const ASPECT = 16 / 9;
const STORAGE_KEY = 'akerra_jokoa_prize_v1';

/* =========================================================
   Baliabideak (assets) — zerrenda eta aurrekarga
   ========================================================= */
const ASSET_LIST = {
  bg_forest: 'assets/backgrounds/bg_forest.png',
  ground: 'assets/backgrounds/ground.png',
  door_bg: 'assets/backgrounds/door_bg.png',
  player_run_1: 'assets/player/player_run_1.png',
  player_run_2: 'assets/player/player_run_2.png',
  player_run_3: 'assets/player/player_run_3.png',
  player_run_4: 'assets/player/player_run_4.png',
  player_run_5: 'assets/player/player_run_5.png',
  player_run_6: 'assets/player/player_run_6.png',
  player_jump: 'assets/player/player_jump.png',
  player_win: 'assets/player/player_win.png',
  witch: 'assets/enemies/witch.png',
  root_1: 'assets/obstacles/root_1.png',
  root_2: 'assets/obstacles/root_2.png',
  root_3: 'assets/obstacles/root_3.png',
  eguzkilore: 'assets/items/eguzkilore.png',
  stone: 'assets/items/stone.png',
  logo: 'assets/ui/logo.png',
};

const FALLBACK_COLORS = {
  bg_forest: '#182e21',
  ground: '#5a3e26',
  door_bg: '#231c36',
  player_run_1: '#d6953d', player_run_2: '#dba04a', player_run_3: '#e0ab57',
  player_run_4: '#d6953d', player_run_5: '#d08a30', player_run_6: '#d38f36',
  player_jump: '#63ad5a',
  player_win: '#d4af37',
  witch: '#6b2f8a',
  root_1: '#4a2a16', root_2: '#4a2a16', root_3: '#4a2a16',
  eguzkilore: '#c4841e',
  stone: '#787880',
  logo: '#c4841e',
};

const assets = {};

function loadAssets(onProgress) {
  const keys = Object.keys(ASSET_LIST);
  let done = 0;
  return Promise.all(keys.map((key) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      assets[key] = img;
      done++;
      onProgress(done, keys.length);
      resolve();
    };
    img.onerror = () => {
      assets[key] = null; // erorbidea: kolore-laukia erabiliko da
      done++;
      onProgress(done, keys.length);
      resolve();
    };
    img.src = ASSET_LIST[key];
  })));
}

// Irudi handiak (2000px arte) behin bakarrik eskalatzen dira pantailako
// neurrira eta cachean gordetzen dira. Bestela fotograma bakoitzean txikitu
// beharko lirateke, eta mugikorretan tirankadak eragiten dituzte.
const scaledCache = new Map();

function scaledSprite(key, w, h) {
  const img = assets[key];
  if (!img) return null;
  const dpr = renderScale;
  const pw = Math.max(1, Math.round(w * dpr));
  const ph = Math.max(1, Math.round(h * dpr));
  const id = key + '|' + pw + 'x' + ph;
  let c = scaledCache.get(id);
  if (!c) {
    c = document.createElement('canvas');
    c.width = pw;
    c.height = ph;
    const cctx = c.getContext('2d');
    cctx.imageSmoothingQuality = 'high';
    cctx.drawImage(img, 0, 0, pw, ph);
    scaledCache.set(id, c);
  }
  return c;
}

function drawSprite(ctx, key, x, y, w, h, opts) {
  opts = opts || {};
  const img = scaledSprite(key, w, h);
  ctx.save();
  if (opts.alpha !== undefined) ctx.globalAlpha = opts.alpha;
  if (opts.flip) {
    ctx.translate(x + w, y);
    ctx.scale(-1, 1);
    x = 0; y = 0;
  } else if (x !== undefined) {
    // no-op, coords already absolute
  }
  if (img) {
    ctx.drawImage(img, x, y, w, h);
  } else {
    ctx.fillStyle = FALLBACK_COLORS[key] || '#888888';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  }
  ctx.restore();
}

// Irudiaren inguruko ertz garden hutsa mozten du, marrazki erreala bakarrik
// gera dadin (adib. root_3 2000x2000 fitxategi baten erdian dago). Horrela
// tamainak marrazkiari dagozkio, ez fitxategiari.
function trimTransparent(key) {
  const img = assets[key];
  if (!img) return;
  try {
    const sw = imgWidth(img), sh = imgHeight(img);
    // eskala txikian bilatu (azkarragoa), gero jatorrizkotik moztu
    const k = Math.min(1, 512 / Math.max(sw, sh));
    const tw = Math.max(1, Math.round(sw * k)), th = Math.max(1, Math.round(sh * k));
    const probe = document.createElement('canvas');
    probe.width = tw;
    probe.height = th;
    const pctx = probe.getContext('2d');
    pctx.drawImage(img, 0, 0, tw, th);
    const data = pctx.getImageData(0, 0, tw, th).data;
    let minX = tw, minY = th, maxX = -1, maxY = -1;
    for (let y = 0; y < th; y++) {
      for (let x = 0; x < tw; x++) {
        if (data[(y * tw + x) * 4 + 3] > 20) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return;
    const cx = Math.max(0, Math.floor((minX - 1) / k));
    const cy = Math.max(0, Math.floor((minY - 1) / k));
    const cw = Math.min(sw, Math.ceil((maxX + 2) / k)) - cx;
    const ch = Math.min(sh, Math.ceil((maxY + 2) / k)) - cy;
    if (cw >= sw * 0.98 && ch >= sh * 0.98) return; // ia ez dago ertzik
    const out = document.createElement('canvas');
    out.width = cw;
    out.height = ch;
    out.getContext('2d').drawImage(img, cx, cy, cw, ch, 0, 0, cw, ch);
    assets[key] = out;
  } catch (e) { /* adib. file:// bidez irekita: irudia den bezala erabili */ }
}

// Irudiak (img) edo moztutako canvas-ak (neurri naturalik gabe)
function imgWidth(img) { return img.naturalWidth || img.width; }
function imgHeight(img) { return img.naturalHeight || img.height; }

// Baliabidearen benetako neurriaren arabera kalkulatzen du zabalera,
// altuera helburu bat emanda (proportzioak ez distortsionatzeko,
// bg_forest/ground-ek dagoeneko egiten duten bezala)
function spriteBox(key, targetH, fallbackAspect) {
  const img = assets[key];
  const aspect = img ? imgWidth(img) / imgHeight(img) : fallbackAspect;
  return { w: targetH * aspect, h: targetH };
}

// Sorgina marrazten du, beheko %35a gardenago utziz. Iturburuko irudia
// bi zerrendatan ebakita marrazten da (ez irudia osoa bikoiztuta), horrela
// artelana ez da bikoiztu edo distortsionatzen.
function drawWitch() {
  const img = scaledSprite('witch', witch.w, witch.h);
  const splitRatio = 0.65;
  if (img) {
    const sw = img.width;
    const sh = img.height;
    const splitY = Math.round(sh * splitRatio);
    const topH = witch.h * (splitY / sh);
    ctx.save();
    ctx.globalAlpha = witch.alpha;
    ctx.drawImage(img, 0, 0, sw, splitY, witch.x, witch.y, witch.w, topH);
    ctx.globalAlpha = witch.alpha * 0.5;
    ctx.drawImage(img, 0, splitY, sw, sh - splitY, witch.x, witch.y + topH, witch.w, witch.h - topH);
    ctx.restore();
  } else {
    drawSprite(ctx, 'witch', witch.x, witch.y, witch.w, witch.h * splitRatio, { alpha: witch.alpha });
    drawSprite(ctx, 'witch', witch.x, witch.y + witch.h * splitRatio, witch.w, witch.h * (1 - splitRatio), { alpha: witch.alpha * 0.5 });
  }
}

/* =========================================================
   Soinua
   ========================================================= */
const sounds = {
  jump: null, hit: null, win: null, music: null,
};
let muted = false;
let musicStarted = false;

function initSounds() {
  try {
    sounds.jump = new Audio('assets/sounds/jump.mp3');
    sounds.hit = new Audio('assets/sounds/hit.mp3');
    sounds.win = new Audio('assets/sounds/win.mp3');
    sounds.music = new Audio('assets/sounds/music.mp3');
    sounds.music.loop = true;
    sounds.music.volume = 0.5;
  } catch (e) { /* soinurik gabe jarraitu */ }
}

function playSound(name) {
  if (muted) return;
  const s = sounds[name];
  if (!s) return;
  try {
    const clone = name === 'music' ? s : s.cloneNode();
    clone.volume = s.volume || 1;
    const p = clone.play();
    if (p && p.catch) p.catch(() => {});
  } catch (e) { /* fitxategia falta edo blokeatuta: ez apurtu jokoa */ }
}

function startMusicOnce() {
  if (musicStarted) return;
  musicStarted = true;
  if (!sounds.music) return;
  try {
    sounds.music.muted = muted;
    const p = sounds.music.play();
    if (p && p.catch) p.catch(() => {});
  } catch (e) { /* ez dago musikarik */ }
}

function setMuted(v) {
  muted = v;
  Object.values(sounds).forEach((s) => { if (s) s.muted = v; });
  document.querySelectorAll('.mute-btn').forEach((b) => { b.textContent = v ? '🔇' : '🔊'; });
}

/* =========================================================
   Pantailen kudeaketa
   ========================================================= */
const screens = {};
['loading', 'rotate', 'start', 'game', 'lose', 'prize'].forEach((name) => {
  screens[name] = document.getElementById('screen-' + name);
});
let currentScreen = 'loading';

function showScreen(name) {
  currentScreen = name;
  Object.entries(screens).forEach(([key, el]) => {
    if (!el) return;
    el.classList.toggle('active', key === name || (key === 'rotate' && false));
  });
  checkOrientation();
}

/* =========================================================
   Orientazioa
   ========================================================= */
function checkOrientation() {
  const isPortraitNarrow = window.innerHeight > window.innerWidth && window.innerWidth < 820;
  const needsRotate = isPortraitNarrow && currentScreen === 'game';
  screens.rotate.classList.toggle('active', needsRotate);
  if (needsRotate) {
    paused = true;
  } else if (currentScreen === 'game') {
    paused = false;
  }
}

window.addEventListener('resize', () => { resizeCanvas(); checkOrientation(); });
window.addEventListener('orientationchange', () => { resizeCanvas(); checkOrientation(); });

/* =========================================================
   Canvas
   ========================================================= */
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
// Jokoa beti 960x540 bereizmen logikoan marrazten da eta pantailara eskalatzen
// da. Horrela tamainak, jauzia eta abiadura proportzio berean ikusten dira
// mugikorrean zein pantaila handian.
const LOGICAL_W = 960, LOGICAL_H = 540;
// pixel fisikoak unitate logiko bakoitzeko (eskala x devicePixelRatio)
let renderScale = 1;
let lastSizeKey = '';
let assetsReady = false;
const strips = new Map(); // gakoa -> { canvas, w, h }, aurrez marraztutako zintak

function resizeCanvas() {
  const container = screens.game;
  const maxW = container.clientWidth || window.innerWidth;
  const maxH = container.clientHeight || window.innerHeight;
  let w = maxW;
  let h = w / ASPECT;
  if (h > maxH) {
    h = maxH;
    w = h * ASPECT;
  }
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  renderScale = canvas.width / LOGICAL_W;
  ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);

  const sizeKey = canvas.width + 'x' + canvas.height;
  if (sizeKey !== lastSizeKey) {
    lastSizeKey = sizeKey;
    scaledCache.clear();
    strips.clear();
    if (assetsReady) prewarmCaches();
  }
}

/* =========================================================
   Jokoaren egoera
   ========================================================= */
let paused = false;
let gameState = 'idle'; // idle | playing | hit | winSeq
let elapsed = 0;
let lastTime = 0;

const GROUND_H_RATIO = 0.22;
const PLAYER_X_RATIO = 0.33;
// Korrika-irudien ordena (fitxategi-zenbakiak). Pausoaren faseen arabera:
// lurreratu (1), pauso osoa (2), atzeko oinak bultza (3), hanka igo (6),
// hankak elkarrengandik pasa (4), aurreko hanka luzatu (5).
const RUN_FRAME_ORDER = [1, 2, 3, 6, 4, 5];
// Lurzoruan bermatzen diren elementuak (oztopoak, harria) pixel hauek
// hondoratzen dira lurzoruan, airean flotatu beharrean gainean egon daitezen
const GROUND_OVERLAP = 16;
// Lurzoruaren lauza bakoitza zabalago marrazten da (proportzioa mantenduz
// altueran, baina zabalera gehiago luzatuz) junturak gutxiagotan agertzeko
const GROUND_WIDTH_SCALE = 2.0;
// Atzeko basoaren abiadura, lurzoruarenarekiko (0.3 = %30)
const BG_PARALLAX = 0.3;

// Sprite bakoitzaren helburu-altuera (px logiko), zabalera irudi
// bakoitzaren benetako proportziotik kalkulatzen da (spriteBox bidez)
// distortsiorik ez izateko, edozein dela ere ordezkatuko duen artea.
const SPRITE_TARGET_H = {
  player: 160,
  witch: 130,
  stone: 58, // harri ikusgaiaren altuera (ertz gardena moztu ondoren)
  eguzkilore_win: 80,
};
const SPRITE_FALLBACK_ASPECT = {
  player: 120 / 160,
  witch: 150 / 170,
  root_1: 1,
  root_2: 80 / 70,
  root_3: 100 / 80,
  stone: 130 / 110,
  eguzkilore_win: 1,
};
// Sustrai guztiak zabalera berarekin marrazten dira; altuera bakoitzaren
// proportziotik ateratzen da, gehienez ROOT_MAX_H (arku altuak txikiagotuz).
// Txikiagotu balio hauek jauzia errazteko, handitu zailtzeko.
// Sustrai berri baten arteko denbora (s), abiadurarekin laburtzen dena:
// hasieran [1.0, 1.6], amaieran [0.7, 1.2]. Beti jauzi daitezke: jokalari
// perfektu batek gutxienez 0.75 s (hasieran) / 0.5 s (amaieran) behar ditu.
const SPAWN_MIN_START = 1.0, SPAWN_MIN_END = 0.7;
const SPAWN_RANGE_START = 0.6, SPAWN_RANGE_END = 0.5;

function spawnInterval(progress) {
  const min = SPAWN_MIN_START + (SPAWN_MIN_END - SPAWN_MIN_START) * progress;
  const range = SPAWN_RANGE_START + (SPAWN_RANGE_END - SPAWN_RANGE_START) * progress;
  return min + Math.random() * range;
}

const ROOT_WIDTH = 150;
const ROOT_MAX_H = 69;
function obstacleBox(type) {
  const img = assets[type];
  const aspect = img ? imgWidth(img) / imgHeight(img) : SPRITE_FALLBACK_ASPECT[type];
  let w = ROOT_WIDTH;
  let h = w / aspect;
  if (h > ROOT_MAX_H) {
    h = ROOT_MAX_H;
    w = h * aspect;
  }
  return { w, h };
}

const player = {
  w: 120, h: 160,
  y: 0, vy: 0,
  onGround: true,
  runFrame: 0,
  runTimer: 0,
  state: 'run', // run | jump | win
};

// Sorginaren eskuinaldearen eta jokalariaren arteko tartea (px logiko):
// korrika dauden bitartean ez dira inoiz ukitzen
const WITCH_GAP = 80;

const witch = {
  x: 0, y: 0, w: 150, h: 170,
  bobT: Math.random() * Math.PI * 2,
  fleeing: false,
  alpha: 1,
  lungeActive: false,
  lungeT: 0,
};

// Sprite guztiak aldez aurretik prestatzen dira, oztopo bat lehen aldiz
// agertzean irudi handia deskodetu/eskalatu beharrak tirankadarik ez eragiteko
function prewarmCaches() {
  ['player_run_1', 'player_run_2', 'player_run_3', 'player_run_4', 'player_run_5',
    'player_run_6', 'player_jump', 'player_win'].forEach((k) => scaledSprite(k, player.w, player.h));
  scaledSprite('witch', witch.w, witch.h);
  ['root_1', 'root_2', 'root_3'].forEach((k) => {
    const box = obstacleBox(k);
    scaledSprite(k, box.w, box.h);
  });
  ['stone', 'eguzkilore_win'].forEach((k) => {
    const imgKey = k === 'eguzkilore_win' ? 'eguzkilore' : k;
    const box = spriteBox(imgKey, SPRITE_TARGET_H[k], SPRITE_FALLBACK_ASPECT[k]);
    scaledSprite(imgKey, box.w, box.h);
  });
  buildStrip('bg_forest', LOGICAL_H, 1);
  buildStrip('ground', LOGICAL_H * GROUND_H_RATIO, GROUND_WIDTH_SCALE);
  RUN_FRAME_ORDER.forEach((i) => spriteMask('player_run_' + i, player.w, player.h));
  spriteMask('player_jump', player.w, player.h);
  ['root_1', 'root_2', 'root_3'].forEach((k) => {
    const box = obstacleBox(k);
    spriteMask(k, box.w, box.h);
  });
}

function computeSpriteSizes() {
  const p = spriteBox('player_run_1', SPRITE_TARGET_H.player, SPRITE_FALLBACK_ASPECT.player);
  player.w = p.w; player.h = p.h;
  const w = spriteBox('witch', SPRITE_TARGET_H.witch, SPRITE_FALLBACK_ASPECT.witch);
  witch.w = w.w; witch.h = w.h;
}

let obstacles = [];
let nextSpawnIn = 1.2;
let groundOffset = 0;
let bgOffset = 0;
const progressFillEl = document.getElementById('progress-fill');
let currentSpeed = CONFIG.SPEED_INITIAL;

let winSeq = null; // { phase, t, stone }

function getGroundY() {
  return LOGICAL_H * (1 - GROUND_H_RATIO);
}

function resetGame() {
  elapsed = 0;
  gameState = 'playing';
  obstacles = [];
  nextSpawnIn = 1.4;
  groundOffset = 0;
  bgOffset = 0;
  currentSpeed = CONFIG.SPEED_INITIAL;
  player.vy = 0;
  player.onGround = true;
  player.state = 'run';
  player.runFrame = 0;
  player.runTimer = 0;
  player.y = getGroundY() - player.h;
  witch.fleeing = false;
  witch.alpha = 1;
  witch.lungeActive = false;
  witch.lungeT = 0;
  witch.x = LOGICAL_W * PLAYER_X_RATIO - WITCH_GAP - witch.w;
  winSeq = null;
  progressFillEl.style.width = '0%';
}

function jump() {
  if (gameState !== 'playing') return;
  if (!player.onGround) return;
  player.vy = -CONFIG.JUMP_FORCE;
  player.onGround = false;
  player.state = 'jump';
  playSound('jump');
}

function spawnObstacle() {
  const types = ['root_1', 'root_2', 'root_3'];
  const type = types[Math.floor(Math.random() * types.length)];
  const size = obstacleBox(type);
  obstacles.push({
    type,
    x: LOGICAL_W + 20,
    w: size.w,
    h: size.h,
    y: getGroundY() - size.h + GROUND_OVERLAP,
  });
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

// Talka-maskarak: irudi bakoitzaren forma erreala (gardentasunetik),
// pantailako neurrian. Talka marrazkiak benetan ukitzen direnean bakarrik
// gertatzen da, ez laukizuzenak gainjartzen direnean.
const maskCache = new Map();
const MASK_MIN_OVERLAP = 4; // pixel bakarreko ukitzeak ez dira talka

function spriteMask(key, w, h) {
  const mw = Math.max(1, Math.round(w)), mh = Math.max(1, Math.round(h));
  const id = key + '|' + mw + 'x' + mh;
  if (maskCache.has(id)) return maskCache.get(id);
  let mask = null;
  const img = assets[key];
  if (img) {
    try {
      const c = document.createElement('canvas');
      c.width = mw;
      c.height = mh;
      const g = c.getContext('2d');
      g.drawImage(img, 0, 0, mw, mh);
      const data = g.getImageData(0, 0, mw, mh).data;
      const bits = new Uint8Array(mw * mh);
      for (let i = 0; i < bits.length; i++) bits[i] = data[i * 4 + 3] > 128 ? 1 : 0;
      mask = { w: mw, h: mh, bits };
    } catch (e) { mask = null; /* adib. file:// bidez: laukizuzenak erabili */ }
  }
  maskCache.set(id, mask);
  return mask;
}

function playerSpriteKey() {
  if (player.state === 'jump') return 'player_jump';
  if (player.state === 'win') return 'player_win';
  return 'player_run_' + RUN_FRAME_ORDER[player.runFrame];
}

function masksOverlap(ma, ax, ay, mb, bx, by) {
  const x1 = Math.max(ax, bx), y1 = Math.max(ay, by);
  const x2 = Math.min(ax + ma.w, bx + mb.w), y2 = Math.min(ay + ma.h, by + mb.h);
  if (x1 >= x2 || y1 >= y2) return false;
  let hits = 0;
  for (let y = Math.floor(y1); y < y2; y++) {
    const ra = (y - ay) | 0, rb = (y - by) | 0;
    if (ra < 0 || rb < 0 || ra >= ma.h || rb >= mb.h) continue;
    for (let x = Math.floor(x1); x < x2; x++) {
      const ca = (x - ax) | 0, cb = (x - bx) | 0;
      if (ca < 0 || cb < 0 || ca >= ma.w || cb >= mb.w) continue;
      if (ma.bits[ra * ma.w + ca] && mb.bits[rb * mb.w + cb] && ++hits >= MASK_MIN_OVERLAP) return true;
    }
  }
  return false;
}

// Maskarak irakurri ezin badira: lehengo laukizuzenak (%70, jokalariarena oinetan)
function rectCollision(px, o) {
  const pw = player.w * 0.7, ph = player.h * 0.7;
  const pRect = { x: px + (player.w - pw) / 2, y: player.y + player.h - ph, w: pw, h: ph };
  const ow = o.w * 0.7, oh = o.h * 0.7;
  const oRect = { x: o.x + (o.w - ow) / 2, y: o.y + (o.h - oh) / 2, w: ow, h: oh };
  return rectsOverlap(pRect, oRect);
}

function checkCollisions() {
  const px = LOGICAL_W * PLAYER_X_RATIO;
  const pMask = spriteMask(playerSpriteKey(), player.w, player.h);
  for (const o of obstacles) {
    if (!rectsOverlap({ x: px, y: player.y, w: player.w, h: player.h }, o)) continue;
    const oMask = spriteMask(o.type, o.w, o.h);
    const hit = (pMask && oMask)
      ? masksOverlap(pMask, px, player.y, oMask, o.x, o.y)
      : rectCollision(px, o);
    if (hit) return true;
  }
  return false;
}

function triggerHit() {
  gameState = 'hit';
  playSound('hit');
  witch.lungeActive = true;
  witch.lungeT = 0;
}

function triggerWin() {
  gameState = 'winSeq';
  playSound('win');
  obstacles = [];
  winSeq = {
    phase: 'approach',
    t: 0,
    stoneX: LOGICAL_W + 80,
  };
}

/* =========================================================
   Eguneratzea (update)
   ========================================================= */
function update(dt) {
  if (gameState === 'playing') {
    elapsed += dt;
    const progressRatio = Math.min(1, elapsed / CONFIG.DURATION);
    progressFillEl.style.width = (progressRatio * 100) + '%';

    currentSpeed = CONFIG.SPEED_INITIAL + (CONFIG.SPEED_MAX - CONFIG.SPEED_INITIAL) * progressRatio;

    groundOffset += currentSpeed * dt;
    bgOffset += currentSpeed * BG_PARALLAX * dt;

    // jokalariaren fisika
    player.vy += CONFIG.GRAVITY * dt;
    player.y += player.vy * dt;
    const groundY = getGroundY() - player.h;
    if (player.y >= groundY) {
      player.y = groundY;
      player.vy = 0;
      if (!player.onGround) player.state = 'run';
      player.onGround = true;
    }

    if (player.onGround) {
      player.runTimer += dt;
      if (player.runTimer >= 1 / 12) {
        player.runTimer = 0;
        player.runFrame = (player.runFrame + 1) % RUN_FRAME_ORDER.length;
      }
    }

    // sorginaren flotazioa
    witch.bobT += dt * 2;
    witch.y = LOGICAL_H * 0.18 + Math.sin(witch.bobT) * 14;

    // oztopoak
    const timeLeft = CONFIG.DURATION - elapsed;
    if (timeLeft > 3) {
      nextSpawnIn -= dt;
      if (nextSpawnIn <= 0) {
        spawnObstacle();
        nextSpawnIn = spawnInterval(progressRatio);
      }
    }
    for (const o of obstacles) {
      o.x -= currentSpeed * dt;
    }
    obstacles = obstacles.filter((o) => o.x + o.w > -20);

    if (checkCollisions()) {
      triggerHit();
      return;
    }

    if (elapsed >= CONFIG.DURATION) {
      triggerWin();
    }
  } else if (gameState === 'hit') {
    witch.lungeT += dt;
    // jokalaria harrapatzen du (eskuak gainean), ez du zeharkatzen
    const grabX = LOGICAL_W * PLAYER_X_RATIO + 20 - witch.w;
    witch.x = Math.min(grabX, witch.x + 900 * dt);
    witch.bobT += dt * 6;
    witch.y = LOGICAL_H * 0.18 + Math.sin(witch.bobT) * 10;
    if (witch.lungeT >= 0.55) {
      showScreen('lose');
    }
  } else if (gameState === 'winSeq') {
    winSeq.t += dt;
    currentSpeed = Math.max(60, currentSpeed - 260 * dt);
    groundOffset += currentSpeed * dt;
    bgOffset += currentSpeed * BG_PARALLAX * dt;

    // sorgina ihesi
    witch.x -= 500 * dt;
    witch.alpha = Math.max(0, witch.alpha - dt * 1.3);

    if (player.onGround) {
      player.runTimer += dt;
      if (player.runTimer >= 1 / 12) {
        player.runTimer = 0;
        player.runFrame = (player.runFrame + 1) % RUN_FRAME_ORDER.length;
      }
    }

    const targetX = LOGICAL_W * PLAYER_X_RATIO + player.w + 20;
    if (winSeq.phase === 'approach') {
      winSeq.stoneX -= currentSpeed * dt * 0.6;
      if (winSeq.stoneX <= targetX || winSeq.t > 2.6) {
        winSeq.stoneX = targetX;
        winSeq.phase = 'celebrate';
        winSeq.t = 0;
        player.state = 'win';
      }
    } else if (winSeq.phase === 'celebrate') {
      if (winSeq.t > 1.0) {
        winSeq.phase = 'fadeout';
        winSeq.t = 0;
      }
    } else if (winSeq.phase === 'fadeout') {
      if (winSeq.t > 0.7) {
        showScreen('prize');
        initPrizeScreen();
      }
    }
  }
}

/* =========================================================
   Marrazketa (render)
   ========================================================= */
// Zinta bat behin marrazten da canvas batean: irudia normal eta, ondoan,
// bere ispilua. Bi junturak simetrikoak dira, beraz zinta amaigabe errepika
// daiteke ebakirik gabe. Fotograma bakoitzean 2-3 aldiz kopiatzea besterik ez
// da behar (eskalatu edo biratu gabe). Lurzorua eta atzeko basoa horrela doaz.
function buildStrip(key, h, widthScale) {
  const img = assets[key];
  const aspect = img ? imgWidth(img) / imgHeight(img) : LOGICAL_W / h;
  const dpr = renderScale;
  const tilePw = Math.max(1, Math.round(h * aspect * widthScale * dpr));
  const ph = Math.max(1, Math.round(h * dpr));
  const c = document.createElement('canvas');
  c.width = tilePw * 2;
  c.height = ph;
  const g = c.getContext('2d');
  if (img) {
    g.imageSmoothingQuality = 'high';
    g.drawImage(img, 0, 0, tilePw, ph);
    g.translate(tilePw * 2, 0);
    g.scale(-1, 1);
    g.drawImage(img, 0, 0, tilePw, ph);
  } else {
    g.fillStyle = FALLBACK_COLORS[key] || '#333';
    g.fillRect(0, 0, c.width, ph);
  }
  const strip = { canvas: c, w: c.width / dpr, h };
  strips.set(key, strip);
  return strip;
}

function drawStrip(key, offset, y, h, widthScale) {
  let strip = strips.get(key);
  if (!strip || strip.h !== h) strip = buildStrip(key, h, widthScale);
  const dpr = renderScale;
  const period = strip.w;
  // pixel osoetara biribildu, kopien arteko juntura-lerro finik ez agertzeko
  let x = Math.round(-(offset % period) * dpr) / dpr;
  for (; x < LOGICAL_W; x += period) {
    ctx.drawImage(strip.canvas, x, y, period, h);
  }
}

function render() {
  ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);

  // basoa (lurzorua baino motelago, sakonera emateko)
  drawStrip('bg_forest', bgOffset, 0, LOGICAL_H, 1);

  // lurzorua
  const groundH = LOGICAL_H * GROUND_H_RATIO;
  drawStrip('ground', groundOffset, LOGICAL_H - groundH, groundH, GROUND_WIDTH_SCALE);

  // sorgina (beheko zatia gardenagoa: iturburuko irudia bi zerrendatan
  // ebaki eta bakoitza bere lekuan marrazten dugu, irudia bikoiztu gabe)
  if (witch.alpha > 0) {
    drawWitch();
  }

  // oztopoak
  for (const o of obstacles) {
    drawSprite(ctx, o.type, o.x, o.y, o.w, o.h);
  }

  // harria + eguzkilorea (irabazte-sekuentzia)
  if (gameState === 'winSeq' && winSeq) {
    const stoneBox = spriteBox('stone', SPRITE_TARGET_H.stone, SPRITE_FALLBACK_ASPECT.stone);
    const stoneW = stoneBox.w, stoneH = stoneBox.h;
    const stoneY = getGroundY() - stoneH + GROUND_OVERLAP;
    drawSprite(ctx, 'stone', winSeq.stoneX, stoneY, stoneW, stoneH);

    const eguBox = spriteBox('eguzkilore', SPRITE_TARGET_H.eguzkilore_win, SPRITE_FALLBACK_ASPECT.eguzkilore_win);
    const eguW = eguBox.w, eguH = eguBox.h;
    const eguX = winSeq.stoneX + stoneW / 2 - eguW / 2;
    // harriaren goiko aurpegiaren gainean bermatuta
    const eguY = stoneY + stoneH * 0.15 - eguH;
    const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 180);
    ctx.save();
    ctx.globalAlpha = 0.35 + pulse * 0.35;
    ctx.fillStyle = '#e0a83c';
    ctx.beginPath();
    ctx.arc(eguX + eguW / 2, eguY + eguH / 2, Math.max(eguW, eguH) * (0.7 + pulse * 0.25), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    drawSprite(ctx, 'eguzkilore', eguX, eguY, eguW, eguH);
  }

  // jokalaria
  const px = LOGICAL_W * PLAYER_X_RATIO;
  drawSprite(ctx, playerSpriteKey(), px, player.y, player.w, player.h);

  // fundido beltzera irabazte-sekuentziaren amaieran
  if (gameState === 'winSeq' && winSeq && winSeq.phase === 'fadeout') {
    const alpha = Math.min(1, winSeq.t / 0.7);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    ctx.restore();
  }
}

/* =========================================================
   Nagusi begizta
   ========================================================= */
function loop(ts) {
  requestAnimationFrame(loop);
  if (!lastTime) lastTime = ts;
  let dt = (ts - lastTime) / 1000;
  lastTime = ts;
  if (dt > 0.05) dt = 0.05; // saltoak saihesteko (tab atzeko planoan, etab.)

  if (currentScreen !== 'game' || paused) return;

  update(dt);
  render();
}
requestAnimationFrame(loop);

/* =========================================================
   Kontrolak
   ========================================================= */
function handleJumpInput(e) {
  if (currentScreen !== 'game') return;
  if (e) e.preventDefault();
  jump();
}

canvas.addEventListener('pointerdown', handleJumpInput);
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    handleJumpInput(e);
  }
});

/* =========================================================
   Hasiera / berrabiarazte / botoiak
   ========================================================= */
document.getElementById('btn-start').addEventListener('click', () => {
  startMusicOnce();
  resizeCanvas();
  resetGame();
  showScreen('game');
});

document.getElementById('btn-retry').addEventListener('click', () => {
  resizeCanvas();
  resetGame();
  showScreen('game');
});

// Botoiak klikatu ondoren fokua kentzen diegu, bestela zuriune-teklak
// botoia berriz aktibatuko luke jauzi egin beharrean
['btn-mute', 'btn-mute-game'].forEach((id) => {
  const btn = document.getElementById(id);
  btn.addEventListener('click', () => { setMuted(!muted); btn.blur(); });
});

/* =========================================================
   Pantaila osoa
   ========================================================= */
const docEl = document.documentElement;
const fullscreenSupported = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);

function isFullscreen() {
  return !!(document.fullscreenElement || document.webkitFullscreenElement);
}

function toggleFullscreen() {
  try {
    if (isFullscreen()) {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      const p = exit.call(document);
      if (p && p.catch) p.catch(() => {});
    } else {
      const req = docEl.requestFullscreen || docEl.webkitRequestFullscreen;
      const p = req.call(docEl);
      if (p && p.catch) p.catch(() => {});
    }
  } catch (e) { /* nabigatzaileak ukatu du: ez apurtu jokoa */ }
}

function updateFullscreenButtons() {
  const on = isFullscreen();
  document.querySelectorAll('.fullscreen-btn').forEach((b) => {
    b.textContent = on ? '⤡' : '⤢';
    b.setAttribute('aria-label', on ? 'Irten pantaila osotik' : 'Pantaila osoa');
  });
}

['btn-fullscreen', 'btn-fullscreen-game'].forEach((id) => {
  const btn = document.getElementById(id);
  if (!fullscreenSupported) {
    btn.style.display = 'none';
    return;
  }
  btn.addEventListener('click', () => { toggleFullscreen(); btn.blur(); });
});

document.addEventListener('fullscreenchange', updateFullscreenButtons);
document.addEventListener('webkitfullscreenchange', updateFullscreenButtons);

document.addEventListener('pointerdown', startMusicOnce, { once: true });
document.addEventListener('keydown', startMusicOnce, { once: true });

/* =========================================================
   Sarien pantaila
   ========================================================= */
function pickWeightedPrize() {
  const total = CONFIG.PRIZES.reduce((sum, p) => sum + p.weight, 0);
  let r = Math.random() * total;
  for (const p of CONFIG.PRIZES) {
    if (r < p.weight) return p;
    r -= p.weight;
  }
  return CONFIG.PRIZES[0];
}

// Kodea sariaren izena bera da (J10, V15, M20). Lehen gordetako kode
// luzeek (AKERRA-J10-XXXX) beren `label`-a erabiltzen dute, sari bera mantenduz.
function loadSavedPrize() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    const valid = CONFIG.PRIZES.map((p) => p.label);
    if (data && valid.includes(data.code)) return { code: data.code };
    if (data && valid.includes(data.label)) return { code: data.label };
  } catch (e) { /* localStorage ez erabilgarri */ }
  return null;
}

function savePrize(code) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ code }));
  } catch (e) { /* ezin gorde, ez du jokoa apurtzen */ }
}

function revealPrizeResult(code) {
  document.getElementById('prize-code').textContent = code;
  const result = document.getElementById('prize-result');
  result.classList.add('visible');
}

function initPrizeScreen() {
  const choicesWrap = document.getElementById('prize-choices');
  const result = document.getElementById('prize-result');
  result.classList.remove('visible');
  document.getElementById('btn-copy').classList.remove('copied');
  document.getElementById('btn-copy').textContent = 'KOPIATU';

  const saved = loadSavedPrize();
  const buttons = choicesWrap.querySelectorAll('.eguzkilore-choice');
  buttons.forEach((b) => {
    b.classList.remove('chosen', 'fade-out', 'hover');
    b.disabled = false;
    b.style.visibility = 'visible';
  });

  if (saved) {
    choicesWrap.style.display = 'none';
    revealPrizeResult(saved.code);
    return;
  }

  choicesWrap.style.display = 'flex';

  buttons.forEach((btn) => {
    const onChoose = () => {
      buttons.forEach((b) => { b.onclick = null; b.ontouchstart = null; });
      buttons.forEach((b) => {
        if (b === btn) {
          b.classList.add('chosen');
        } else {
          b.classList.add('fade-out');
        }
      });
      const prize = pickWeightedPrize();
      const code = prize.label;
      savePrize(code);
      setTimeout(() => revealPrizeResult(code), 500);
    };
    btn.onclick = onChoose;
  });
}

document.getElementById('btn-copy').addEventListener('click', () => {
  const code = document.getElementById('prize-code').textContent;
  const btn = document.getElementById('btn-copy');
  const done = () => {
    btn.textContent = 'KOPIATUTA ✓';
    btn.classList.add('copied');
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(done).catch(() => {
      fallbackCopy(code);
      done();
    });
  } else {
    fallbackCopy(code);
    done();
  }
});

function fallbackCopy(text) {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  } catch (e) { /* ezin kopiatu, erabiltzaileak eskuz egin dezake */ }
}

document.getElementById('btn-shop').addEventListener('click', () => {
  window.open(CONFIG.SHOP_URL, '_blank', 'noopener');
});

/* =========================================================
   Abiarazte-sekuentzia: aurrekarga
   ========================================================= */
function initLoadingImages() {
  document.getElementById('loading-logo').src = ASSET_LIST.logo;
  document.getElementById('loading-logo').onerror = function () {
    this.style.background = FALLBACK_COLORS.logo;
    this.removeAttribute('src');
  };
  document.getElementById('start-logo').src = ASSET_LIST.logo;
  document.getElementById('start-logo').onerror = function () {
    this.style.background = FALLBACK_COLORS.logo;
    this.removeAttribute('src');
  };
  document.getElementById('progress-eguzkilore').src = ASSET_LIST.eguzkilore;
  document.getElementById('progress-eguzkilore').onerror = function () {
    this.style.background = FALLBACK_COLORS.eguzkilore;
    this.removeAttribute('src');
  };
  document.querySelectorAll('.eguzkilore-choice img').forEach((img) => {
    img.onerror = function () {
      this.style.background = FALLBACK_COLORS.eguzkilore;
      this.removeAttribute('src');
    };
  });
}

initSounds();
initLoadingImages();
resizeCanvas();

loadAssets((done, total) => {
  const pct = Math.round((done / total) * 100);
  document.getElementById('loading-bar-fill').style.width = pct + '%';
  document.getElementById('loading-percent').textContent = pct + '%';
}).then(() => {
  ['root_1', 'root_2', 'root_3', 'stone'].forEach(trimTransparent);
  computeSpriteSizes();
  assetsReady = true;
  prewarmCaches();
  setTimeout(() => {
    showScreen('start');
  }, 250);
});
