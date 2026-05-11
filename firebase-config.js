// ============================================================
// Firebase 設定（請貼上你自己的 Firebase 專案設定）
// ============================================================
// 取得方式：
//   1. 到 https://console.firebase.google.com 登入學校帳號
//   2. 建立專案 → 加入「Web App」
//   3. 複製 firebaseConfig 內容貼到下方
//   4. Console → Build → Authentication → Sign-in method → 開啟「電子郵件/密碼」
//   5. Console → Authentication → Users → 新增使用者（這就是後台管理員帳號）
//   6. Console → Build → Realtime Database → 建立資料庫（區域選 asia-southeast1）
//   7. Realtime Database → Rules 貼上 database.rules.json 的內容
// ============================================================

export const firebaseConfig = {
  apiKey: "AIzaSyDGKlW4LuMr_K9uzSvFnL7VVfLVfq-JzLE",
  authDomain: "little-mayor-shimen-2036.firebaseapp.com",
  databaseURL: "https://little-mayor-shimen-2036-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "little-mayor-shimen-2036",
  storageBucket: "little-mayor-shimen-2036.firebasestorage.app",
  messagingSenderId: "522821791839",
  appId: "1:522821791839:web:c92bc35fa8f04b4ffa2bea"
};

// ============================================================
// 候選人預設資料（首次部署或設定畫面按下「重置為預設值」時會用）
// 圖片路徑相對於 repo 根目錄
// ============================================================
export const DEFAULT_CANDIDATES = [
  { id: 1, name: "吳乃暄", imageUrl: "assets/photos/1.jpg", votes: 0 },
  { id: 2, name: "張麒勳", imageUrl: "assets/photos/2.jpg", votes: 0 },
  { id: 3, name: "李芯妮", imageUrl: "assets/photos/3.jpg", votes: 0 },
  { id: 4, name: "邱芃禕", imageUrl: "assets/photos/4.jpg", votes: 0 },
  { id: 5, name: "鄒宗志", imageUrl: "assets/photos/5.jpg", votes: 0 },
  { id: 6, name: "曾秝豪", imageUrl: "assets/photos/6.jpg", votes: 0 }
];

export const DEFAULT_META = {
  title: "石門國小第29屆自治市市長選舉",
  subtitle: "計票實況",
  locked: false  // true 時 admin 也無法再加票
};
