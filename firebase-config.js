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
  {
    id: 1, name: "吳乃暄", imageUrl: "assets/photos/1.jpg", votes: 0,
    bio: "1. 三年級班長\n2. 四年級班長\n3. 五年級班長\n4. 四年級區模範生",
    policies: "一、上下課大翻轉一天。\n二、特色餐課程一學年 2 次、讓學生許願菜色。\n三、實現圖書館許願牆的書籍。\n四、五六年級也能上外師的課。",
    videoUrl: "https://youtu.be/irpgSDMcvho"
  },
  {
    id: 2, name: "張麒勳", imageUrl: "assets/photos/2.jpg", votes: 0,
    bio: "1. 模範生\n2. 國樂團\n3. 英文朗讀\n4. 英語說故事\n5. 品格小天使\n6. 班長\n7. 衛生股長",
    policies: "一、票選新刷牙歌。\n二、開放圖書館新書許願。\n三、兒童節上下課翻轉(活動增加)。\n四、新增校外教學午餐選項。\n五、校園壁癌整治。",
    videoUrl: "https://youtu.be/JBe-IUooptA"
  },
  {
    id: 3, name: "李芯妮", imageUrl: "assets/photos/3.jpg", votes: 0,
    bio: "1. 作文比賽佳作\n2. 作文比賽第二名\n3. 朗讀比賽一年級第二名\n4. 朗讀比賽三年級第二名\n5. 五年級演說第二名\n6. 曾擔任班長、學藝股長\n7. 擔任大河長馬工作隊\n8. 連續三年入選才藝發表",
    policies: "一、兒童節上下課大翻轉。\n二、期末抽獎增加名額和種類。\n三、特殊節日請名人演講、演出(歌手、作家…)。\n四、戶外教學讓學生投票地點。\n五、校外得獎可以獲得圖書館 VIP。",
    videoUrl: "https://youtu.be/HTcHJOSpY34"
  },
  {
    id: 4, name: "邱芃禕", imageUrl: "assets/photos/4.jpg", votes: 0,
    bio: "1. 品格小天使\n2. 衛生股長\n3. 校模範生\n4. 午休長\n5. 五年級專題比賽第一名\n6. 參加兒童才藝發表\n7. 參加朗讀比賽\n8. 參加校外數學考試\n9. 與校長有約",
    policies: "一、吃得健康、吃得歡心：每個月都有一次「歡心午餐」的票選活動。\n二、設備汰舊換新：加速學校課桌椅、置物櫃、平板電腦皮套的汰換。\n三、兒童節上下課大翻轉 2.0 版:延長上下課大翻轉的時數,並引進充氣城堡、旋轉木馬等設施。\n四、下課開放籃球機,讓同學使用。",
    videoUrl: "https://youtu.be/1uiPWhS2DwU"
  },
  {
    id: 5, name: "鄒宗志", imageUrl: "assets/photos/5.jpg", votes: 0,
    bio: "1. 五年級風紀股長\n2. 四年級副班長\n3. 三年級體育股長\n4. 三年級定期評量進步獎",
    policies: "一、兒童節上下課大翻轉。\n二、圖書館新增各類書籍。\n三、新增特色餐的樣式。",
    videoUrl: "https://youtu.be/v8fcK0Y2EUg"
  },
  {
    id: 6, name: "曾秝豪", imageUrl: "assets/photos/6.jpg", votes: 0,
    bio: "1. 五年級班長\n2. 五年級衛生股長\n3. 五年級閩語朗讀第一名\n4. 五年級國語演講第三名\n5. 四年級閩語朗讀第二名\n6. 期中考成績優異",
    policies: "一、增設遊樂器材。\n二、兒童節上下課大翻轉一整天。\n三、戶外教育地點讓學生許願。",
    videoUrl: "https://youtu.be/UKfy9nSrwUs"
  }
];

export const DEFAULT_META = {
  title: "石門國小第29屆自治市市長選舉",
  subtitle: "計票實況",
  locked: false, // true 時 admin 也無法再加票
  openAt: "",    // datetime-local 格式 "2026-05-11T14:30"；空字串 = 立即開放
  noticeVideoUrl: "https://youtu.be/DR3DSUI8cI0",        // 選舉注意事項影片
  liveVideoUrl: "https://www.youtube.com/live/ZIRZ0Qk0B7A", // 開票現場 YouTube 直播
  schoolLogoUrl: ""                                       // 學校 LOGO（base64 dataURL；空字串時用預設 icon）
};
