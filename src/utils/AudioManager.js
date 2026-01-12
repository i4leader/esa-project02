/**
 * 音效管理器
 * 管理游戏音效和背景音乐
 */
export class AudioManager {
    constructor() {
        this.sounds = {};
        this.backgroundMusic = null;
        this.isMusicEnabled = true;
        this.isSoundEnabled = true;
        
        // 初始化音效
        this.initSounds();
    }
    
    /**
     * 初始化音效
     */
    initSounds() {
        // 使用 Web Audio API 生成简单音效
        this.sounds.cut = this.createCutSound();
        this.sounds.explosion = this.createExplosionSound();
        this.sounds.background = this.createBackgroundMusic();
    }
    
    /**
     * 创建切割音效
     */
    createCutSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        return {
            play: () => {
                if (!this.isSoundEnabled) return;
                
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                
                osc.connect(gain);
                gain.connect(audioContext.destination);
                
                osc.frequency.value = 800;
                osc.type = 'sine';
                
                gain.gain.setValueAtTime(0.3, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                
                osc.start(audioContext.currentTime);
                osc.stop(audioContext.currentTime + 0.1);
            }
        };
    }
    
    /**
     * 创建爆炸音效
     */
    createExplosionSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        return {
            play: () => {
                if (!this.isSoundEnabled) return;
                
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                
                osc.connect(gain);
                gain.connect(audioContext.destination);
                
                osc.frequency.setValueAtTime(200, audioContext.currentTime);
                osc.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
                osc.type = 'sawtooth';
                
                gain.gain.setValueAtTime(0.5, audioContext.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                
                osc.start(audioContext.currentTime);
                osc.stop(audioContext.currentTime + 0.3);
            }
        };
    }
    
    /**
     * 创建背景音乐
     */
    createBackgroundMusic() {
        // 简单的背景音乐循环
        return {
            play: () => {
                // 背景音乐可以通过加载音频文件实现
                // 这里暂时使用简单的实现
            },
            stop: () => {}
        };
    }
    
    /**
     * 播放切割音效
     */
    playCutSound() {
        if (this.sounds.cut) {
            this.sounds.cut.play();
        }
    }
    
    /**
     * 播放爆炸音效
     */
    playExplosionSound() {
        if (this.sounds.explosion) {
            this.sounds.explosion.play();
        }
    }
    
    /**
     * 切换背景音乐
     */
    toggleMusic() {
        this.isMusicEnabled = !this.isMusicEnabled;
        
        if (this.backgroundMusic) {
            if (this.isMusicEnabled) {
                this.backgroundMusic.play();
            } else {
                this.backgroundMusic.pause();
            }
        }
        
        return this.isMusicEnabled;
    }
    
    /**
     * 切换音效
     */
    toggleSound() {
        this.isSoundEnabled = !this.isSoundEnabled;
        return this.isSoundEnabled;
    }
}
