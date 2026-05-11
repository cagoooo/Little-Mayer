// 純 Web Audio API 合成音效，零外部資源、跨平台一致
// 用法：window.lmSound.voteAdd() / voteSub() / leaderChange() / tieAlert()
// 使用者必須先有互動（點擊任何東西）才能解鎖 AudioContext（瀏覽器 autoplay policy）

(function () {
    let ctx = null;
    let muted = localStorage.getItem('lm_muted') === '1';

    function ensureCtx() {
        if (!ctx) {
            try {
                const AC = window.AudioContext || window.webkitAudioContext;
                if (!AC) return null;
                ctx = new AC();
            } catch (e) { return null; }
        }
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});
        return ctx;
    }

    // 單一 oscillator + envelope 合成短音
    function tone({ freq, duration = 0.18, type = 'sine', volume = 0.25, attack = 0.005, decay = 0 }) {
        if (muted) return;
        const c = ensureCtx();
        if (!c) return;
        const t0 = c.currentTime + 0.001;
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        osc.connect(gain);
        gain.connect(c.destination);
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(volume, t0 + attack);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
        osc.start(t0);
        osc.stop(t0 + duration + 0.05);
    }

    // 序列音（多個 tone 排隊）
    function sequence(notes) {
        if (muted) return;
        let delay = 0;
        for (const n of notes) {
            setTimeout(() => tone(n), delay * 1000);
            delay += (n.gap !== undefined) ? n.gap : (n.duration || 0.18);
        }
    }

    window.lmSound = {
        // admin: +1 票（高脆音）
        voteAdd() {
            tone({ freq: 880, duration: 0.12, type: 'triangle', volume: 0.22 });
            setTimeout(() => tone({ freq: 1320, duration: 0.10, type: 'triangle', volume: 0.18 }), 30);
        },
        // admin: -1 票（低悶音）
        voteSub() {
            tone({ freq: 220, duration: 0.18, type: 'sine', volume: 0.20 });
        },
        // viewer: 領先變動（上升大三和弦 C5-E5-G5）
        leaderChange() {
            sequence([
                { freq: 523, duration: 0.14, type: 'triangle', volume: 0.25 },
                { freq: 659, duration: 0.14, type: 'triangle', volume: 0.25 },
                { freq: 784, duration: 0.30, type: 'triangle', volume: 0.30 }
            ]);
        },
        // viewer: 並列領先（兩聲提示音）
        tieAlert() {
            sequence([
                { freq: 698, duration: 0.12, type: 'sine', volume: 0.22 },
                { freq: 698, duration: 0.20, type: 'sine', volume: 0.22, gap: 0.18 }
            ]);
        },
        // 切換靜音
        toggle() {
            muted = !muted;
            localStorage.setItem('lm_muted', muted ? '1' : '0');
            return muted;
        },
        isMuted() { return muted; }
    };
})();
