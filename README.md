# 🗳️ 石門國小自治市市長選舉計票系統

即時計票 + 即時監票的雙端系統，部署在 GitHub Pages，後端用 Firebase Realtime Database 同步資料、Firebase Auth 保護後台寫入。

## 📐 三個畫面

| 頁面 | 用途 | 權限 |
|---|---|---|
| `index.html` | 入口分流 | 公開 |
| `viewer.html` | 公開監票（全班觀看，唯讀，即時同步） | 公開 |
| `admin.html` | 後台唱票 / 候選人設定 | 教師帳號登入後可寫 |

**安全原則**：viewer 連結即使被學生拿到也只能看；admin 必須以管理員 email/密碼登入才能改票數，連結被拿到也無法亂動。

---

## 🚀 部署步驟（一次設定）

### Step 1. 建立 Firebase 專案

1. 到 [Firebase Console](https://console.firebase.google.com)，用 **學校帳號**（`ipad@mail2.smes.tyc.edu.tw`）登入
2. 「新增專案」→ 命名為例如 `little-mayor-shimen`
3. **Authentication**：左側 → Build → Authentication → 開始使用 → 「電子郵件/密碼」設為啟用
4. **Authentication → Users**：新增使用者，這就是後台管理員帳號（請記下 email + 密碼）
5. **Realtime Database**：左側 → Build → Realtime Database → 建立資料庫
   - 區域選 **asia-southeast1**（新加坡）
   - 先選「鎖定模式」（後面我們會貼自己的 Rules）
6. Realtime Database → **Rules** 分頁 → 把整個 `database.rules.json` 的內容貼上去 → 發布

### Step 2. 取得 Web App 設定

1. 專案總覽 → 點 `</>` 圖示加入「Web App」
2. App 暱稱：`little-mayor-web`，**不要** 勾選 Firebase Hosting
3. 註冊後會看到 `firebaseConfig` 程式碼，把 `apiKey`、`authDomain`、`databaseURL` 等值複製
4. 編輯本專案的 `firebase-config.js`，把 `YOUR_API_KEY` 等占位字串換成你剛複製的值

> 注意：`databaseURL` 一定要有，類似 `https://xxx-default-rtdb.asia-southeast1.firebasedatabase.app`，沒填的話即時同步會失效。

### Step 3. 設定授權網域

Firebase Console → Authentication → Settings → **Authorized domains** → Add domain：
- `cagoooo.github.io`（GitHub Pages 預設網域）

### Step 4. 推送到 GitHub Pages

```powershell
cd H:\Little-Mayor
git init
git add .
git commit -m "🗳️ Little Mayor: voting system v1"
git branch -M main
git remote add origin https://github.com/cagoooo/Little-Mayer.git
git push -u origin main
```

到 GitHub repo → Settings → Pages → Source 選 `Deploy from a branch` → Branch 選 `main` → `/ (root)` → Save。

幾分鐘後即可在 `https://cagoooo.github.io/Little-Mayer/` 開啟。

---

## 🔐 安全模型

- **Realtime Database Rules**（已寫在 `database.rules.json`）：
  ```
  /election/.read = true       ← 任何人都能讀
  /election/.write = auth != null  ← 只有登入過的人能寫
  ```
- **公開 Web App 的 apiKey 不是密碼**：那是專案識別碼，安全是靠 Rules 把關。即使學生看到 viewer.html 的原始碼複製出 apiKey，也無法寫資料庫。
- **管理員帳號**：在 Firebase Console → Authentication → Users 統一新增/移除。要多人唱票，就建多組 email/密碼。

---

## 🎮 使用流程

### 開票當天（後台）
1. 唱票員打開 `admin.html` → 用管理員帳號登入
2. 切到「設定」分頁，確認候選人姓名/照片/活動標題正確
3. 切回「唱票」分頁，每唱一張票按對應候選人的 **加 1 票**
4. 唱錯了？按 **− 號** 或左上角的 **復原上次**
5. 全部唱完按右上角 **計票中** 切換成 **已封存**，鎖住票數

### 各班觀看（前台）
- 班級老師打開 `viewer.html` 投影到大螢幕
- 不需要登入，後台每按一下這裡立刻刷新

---

## 🔄 版本更新機制（避免使用者看到舊版）

本系統有 Service Worker + 版本輪詢，**每次部署使用者會自動收到「立刻更新」提示**：

- `sw.js`：HTML 用 network-first（永遠最新）、JS/CSS 用 cache-first（含版本字串自然失效）
- `version-check.js`：每 60 秒查 `version.json`，發現版本變更就彈藍色 banner
- 右下角永遠顯示目前版本號

### 改完程式要部署時的流程

```powershell
# 1. 自動 bump 版本（patch）+ 同步寫入 sw.js / version-check.js / 各 HTML 的 ?v=
.\bump-version.ps1
# 或自訂版本號 / 備註：
.\bump-version.ps1 -NewVersion 1.2.0 -Notes "新增匯出 CSV 功能"

# 2. push
git add -A
git commit -m "🚀 v1.0.1 - bug fix"
git push
```

GitHub Pages 重建後 1 分鐘內，現有使用者畫面會自動跳出「🚀 已發布新版」按鈕，按一下就立即更新。

---

## 🛠️ 本機測試（不部署）

打開 `index.html` 直接雙擊 → 瀏覽器 → 應該能看到入口。
但若要測 Firebase 同步，必須用 http(s):// 而非 file://，可：

```powershell
cd H:\Little-Mayor
python -m http.server 8000
# 瀏覽 http://localhost:8000
```

並把 `localhost` 加到 Firebase Authorized domains。

---

## 🧩 候選人預設資料

預設帶入 6 位（編號／姓名／照片）：
1. 吳乃暄
2. 張麒勳
3. 李芯妮
4. 邱芃禕
5. 鄒宗志
6. 曾秝豪

第一次連線會自動寫入；若日後要改，後台「設定」分頁可即時編輯。

---

Made with ❤️ by [阿凱老師](https://www.smes.tyc.edu.tw/) ｜ © 石門國小
