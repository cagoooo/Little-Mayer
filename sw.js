// Service Worker — Little Mayor 計票系統
// 策略：
//   - HTML / version.json：network-first（永遠最新）
//   - JS / CSS / 照片：cache-first（含版本字串自然失效）
//   - Firebase / Google API / CDN：直通網路（不攔不快取）

const VERSION = 'v1.0.22';                 // 部署時由 bump-version 腳本更新
const STATIC_CACHE = `little-mayor-static-${VERSION}`;
const HTML_CACHE   = `little-mayor-html-${VERSION}`;

const PRECACHE = [
  './',
  './index.html',
  './viewer.html',
  './admin.html',
  './firebase-config.js',
  './version-check.js',
  './sound.js',
  './assets/photos/1.jpg',
  './assets/photos/2.jpg',
  './assets/photos/3.jpg',
  './assets/photos/4.jpg',
  './assets/photos/5.jpg',
  './assets/photos/6.jpg'
];

// === install：預快取 + 立刻接管 ===
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(STATIC_CACHE).then(cache =>
      Promise.allSettled(PRECACHE.map(url =>
        cache.add(new Request(url, { cache: 'reload' })).catch(err => {
          console.warn('[SW] precache fail', url, err);
        })
      ))
    )
  );
});

// === activate：清舊快取、立即接管所有頁面 ===
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !k.endsWith(VERSION)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// === fetch ===
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // 跳過 Firebase / Google / 第三方 CDN，永遠走網路
  const passThroughHosts = [
    'firebaseio.com', 'firebasedatabase.app', 'googleapis.com',
    'gstatic.com', 'cdn.tailwindcss.com', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com'
  ];
  if (passThroughHosts.some(h => url.hostname.includes(h))) return;

  // HTML 與 version.json：network-first（拿不到才退快取）
  const isHtml = req.mode === 'navigate'
              || url.pathname.endsWith('.html')
              || url.pathname.endsWith('/');
  const isVersion = url.pathname.endsWith('/version.json');

  if (isHtml || isVersion) {
    e.respondWith(networkFirst(req, isVersion ? STATIC_CACHE : HTML_CACHE));
    return;
  }

  // 其他（JS / CSS / 圖）：cache-first
  e.respondWith(cacheFirst(req, STATIC_CACHE));
});

async function networkFirst(req, cacheName) {
  try {
    const res = await fetch(req, { cache: 'no-store' });
    if (res && res.ok && res.type !== 'opaque') {
      const cache = await caches.open(cacheName);
      cache.put(req, res.clone()).catch(() => {});
    }
    return res;
  } catch (err) {
    const cached = await caches.match(req);
    if (cached) return cached;
    throw err;
  }
}

async function cacheFirst(req, cacheName) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok && res.type !== 'opaque') {
      const cache = await caches.open(cacheName);
      cache.put(req, res.clone()).catch(() => {});
    }
    return res;
  } catch (err) {
    // 沒網路又沒快取 — 對 HTML 回 fallback
    if (req.mode === 'navigate') {
      return caches.match('./index.html');
    }
    throw err;
  }
}

// === 接收頁面命令：強制 skipWaiting（給「立刻更新」按鈕用） ===
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
