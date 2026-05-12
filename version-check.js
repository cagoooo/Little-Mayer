// 版本檢查 + Service Worker 註冊
// 在每個頁面 <body> 結束前載入：<script defer src="version-check.js"></script>

(function () {
  const APP_VERSION = '1.0.28';   // ← 部署時由 bump-version 腳本更新
  const CHECK_INTERVAL_MS = 60 * 1000;  // 每 60 秒查一次新版

  // ---------- 1. 註冊 Service Worker ----------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then(reg => {
        console.log('[Version] SW 已註冊，目前版本 v' + APP_VERSION);

        // 偵測新 SW 安裝完成
        reg.addEventListener('updatefound', () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener('statechange', () => {
            if (sw.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateBanner('檢測到新版本');
            }
          });
        });

        // 每次頁面載入主動檢查一次
        reg.update();
      }).catch(err => console.warn('[Version] SW 註冊失敗', err));

      // SW 切換版本時自動 reload（已點擊「立刻更新」後生效）
      let reloaded = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloaded) return;
        reloaded = true;
        location.reload();
      });
    });
  }

  // ---------- 2. 每 60 秒輪詢 version.json ----------
  async function pollVersion() {
    try {
      const r = await fetch('./version.json?t=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) return;
      const data = await r.json();
      console.log(`[Version] poll: local=${APP_VERSION}, remote=${data.version}`);
      if (data.version && data.version !== APP_VERSION) {
        showUpdateBanner('已發布新版 v' + data.version, data.notes || '');
      }
    } catch (e) {
      console.warn('[Version] poll failed', e);
    }
  }
  setTimeout(pollVersion, 5000);
  setInterval(pollVersion, CHECK_INTERVAL_MS);

  // ---------- 3. 浮動更新提示 ----------
  let bannerShown = false;
  function showUpdateBanner(title, notes) {
    if (bannerShown) return;
    bannerShown = true;
    console.log('[Version] 顯示更新 banner:', title);

    const css = `
      .lm-update-banner {
        position: fixed; left: 50%; bottom: 24px; transform: translateX(-50%);
        z-index: 99999; min-width: 280px; max-width: 92vw;
        background: linear-gradient(135deg, #4f46e5, #7c3aed);
        color: #fff; padding: 14px 18px; border-radius: 14px;
        box-shadow: 0 12px 32px rgba(0,0,0,.25);
        font-family: 'Noto Sans TC', system-ui, sans-serif;
        display: flex; align-items: center; gap: 14px;
        animation: lm-slide-up .4s cubic-bezier(.4,0,.2,1);
      }
      .lm-update-banner__icon {
        font-size: 22px; flex-shrink: 0;
      }
      .lm-update-banner__text { font-size: 14px; line-height: 1.4; flex-grow: 1; }
      .lm-update-banner__title { font-weight: 700; }
      .lm-update-banner__notes { opacity: .85; font-size: 12px; margin-top: 2px; }
      .lm-update-banner__btn {
        background: #fff; color: #4f46e5; border: 0;
        padding: 8px 16px; border-radius: 8px; font-weight: 700;
        cursor: pointer; font-size: 13px; flex-shrink: 0;
        transition: transform .15s, background .15s;
      }
      .lm-update-banner__btn:hover { background: #f3f4f6; transform: scale(1.05); }
      .lm-update-banner__close {
        background: transparent; border: 0; color: #fff; cursor: pointer;
        font-size: 18px; opacity: .7; padding: 0 4px; line-height: 1;
      }
      .lm-update-banner__close:hover { opacity: 1; }
      @keyframes lm-slide-up {
        from { transform: translate(-50%, 80px); opacity: 0; }
        to   { transform: translate(-50%, 0);     opacity: 1; }
      }
    `;
    if (!document.getElementById('lm-update-style')) {
      const style = document.createElement('style');
      style.id = 'lm-update-style';
      style.textContent = css;
      document.head.appendChild(style);
    }

    const bar = document.createElement('div');
    bar.className = 'lm-update-banner';
    bar.innerHTML = `
      <span class="lm-update-banner__icon">🚀</span>
      <div class="lm-update-banner__text">
        <div class="lm-update-banner__title">${title}</div>
        ${notes ? `<div class="lm-update-banner__notes">${notes}</div>` : ''}
      </div>
      <button class="lm-update-banner__btn">立刻更新</button>
      <button class="lm-update-banner__close" title="稍後">×</button>
    `;
    document.body.appendChild(bar);

    bar.querySelector('.lm-update-banner__btn').addEventListener('click', async () => {
      try {
        // 通知 SW 立刻接管，再 reload
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          const reg = await navigator.serviceWorker.getRegistration();
          if (reg && reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            return; // controllerchange 會觸發 reload
          }
        }
        // 退而求其次：清快取後 reload
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map(k => caches.delete(k)));
        }
        location.reload();
      } catch (e) {
        location.reload();
      }
    });
    bar.querySelector('.lm-update-banner__close').addEventListener('click', () => {
      bar.remove();
      bannerShown = false;
    });
  }

  // ---------- 4. 右下角小版本號（hover 看完整資訊） ----------
  window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('lm-version-tag')) return;
    const tag = document.createElement('div');
    tag.id = 'lm-version-tag';
    tag.textContent = 'v' + APP_VERSION;
    tag.style.cssText = `
      position: fixed; right: 8px; bottom: 6px; z-index: 9998;
      font-size: 10px; color: rgba(100,116,139,.6);
      font-family: ui-monospace, SFMono-Regular, monospace;
      pointer-events: none; user-select: none;
    `;
    document.body.appendChild(tag);
  });
})();
