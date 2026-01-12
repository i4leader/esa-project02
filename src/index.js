import { HandTracking } from './components/HandTracking.js';
import { GameScene } from './components/GameScene.js';
import { ScoreSystem } from './components/ScoreSystem.js';
import { AudioManager } from './utils/AudioManager.js';
import { SystemInfo } from './utils/SystemInfo.js';

/**
 * 游戏主类
 * 整合所有组件，管理游戏状态和交互
 */
class FruitCuttingGame {
    constructor() {
        // DOM 元素
        this.videoElement = document.getElementById('video-input');
        this.canvasElement = document.getElementById('game-canvas');
        this.handCanvasElement = document.getElementById('hand-canvas');
        this.gameContainer = document.getElementById('game-container');
        this.startScreen = document.getElementById('start-screen');
        this.pauseScreen = document.getElementById('pause-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.startButton = document.getElementById('start-button');
        this.restartButton = document.getElementById('restart-button');
        this.scoreValueEl = document.getElementById('score-value');
        this.timeRemainingEl = document.getElementById('time-remaining');
        this.finalScoreValueEl = document.getElementById('final-score-value');
        this.countdownEl = document.getElementById('countdown');
        this.musicToggleBtn = document.getElementById('music-toggle');

        // 游戏组件
        this.handTracking = null;
        this.gameScene = null;
        this.scoreSystem = null;
        this.audioManager = null;
        this.systemInfo = null;

        // 游戏状态
        this.gameState = 'idle'; // idle, starting, playing, paused, gameover, restarting
        this.startCountdown = 0;
        this.startCountdownTimer = null;

        // 重新开始按钮状态
        this.restartCountdown = 0;
        this.restartCountdownTimer = null;

        // 初始化
        this.init();
    }

    /**
     * 初始化游戏
     */
    async init() {
        // 初始化系统信息
        this.systemInfo = new SystemInfo();

        // 初始化音效管理器
        this.audioManager = new AudioManager();

        // 初始化计分系统
        this.scoreSystem = new ScoreSystem();
        this.scoreSystem.onScoreChange = (score) => {
            this.updateScoreDisplay(score);
        };
        this.scoreSystem.onTimeChange = (time) => {
            this.updateTimeDisplay(time);
        };
        this.scoreSystem.onGameOver = (data) => {
            this.showGameOver(data);
        };

        // 初始化手势识别
        this.handTracking = new HandTracking(
            this.videoElement,
            this.handCanvasElement,
            (hands, trails) => this.onHandsDetected(hands, trails)
        );

        // 初始化游戏场景
        this.gameScene = new GameScene(
            this.canvasElement,
            (fruitType) => this.onFruitCut(fruitType),
            () => this.onBombCut()
        );

        // 设置事件监听
        this.setupEventListeners();

        // 初始化摄像头
        await this.initializeCamera();
    }

    /**
     * Initialize camera
     */
    async initializeCamera() {
        const success = await this.handTracking.initialize();

        if (success) {
            this.systemInfo.updateCameraStatus('Connected');
        } else {
            this.systemInfo.updateCameraStatus('Failed');
            alert('Unable to access camera. Please check your permissions.');
        }
    }

    /**
     * 设置事件监听
     */
    setupEventListeners() {
        // 空格键暂停/继续
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.togglePause();
            }
        });

        // 音乐切换按钮
        if (this.musicToggleBtn) {
            this.musicToggleBtn.addEventListener('click', () => {
                const isEnabled = this.audioManager.toggleMusic();
                this.musicToggleBtn.textContent = isEnabled ? '🔊' : '🔇';
            });
        }

        // 重新开始按钮
        if (this.restartButton) {
            this.restartButton.addEventListener('click', () => {
                this.restartGame();
            });
        }
    }

    /**
     * 手部检测回调
     */
    onHandsDetected(hands, trails) {
        // 更新切割路径
        const cuttingPaths = this.handTracking.getCuttingPaths();
        this.gameScene.updateCuttingPaths(cuttingPaths);

        // 检查开始按钮交互
        if (this.gameState === 'idle' || this.gameState === 'starting') {
            this.checkStartButtonInteraction(hands);
        }

        // 检查重新开始按钮交互
        if (this.gameState === 'gameover' || this.gameState === 'restarting') {
            this.checkRestartButtonInteraction(hands);
        }
    }

    /**
     * 检查开始按钮交互
     */
    checkStartButtonInteraction(hands) {
        if (!this.startButton) return;

        const rect = this.startButton.getBoundingClientRect();
        const isHandOver = this.handTracking.isHandInArea(
            rect.left,
            rect.top,
            rect.width,
            rect.height
        );

        if (isHandOver) {
            if (this.gameState === 'idle') {
                this.gameState = 'starting';
                this.startButton.classList.add('active');
                this.startCountdown = 3;
                this.updateCountdown();

                this.startCountdownTimer = setInterval(() => {
                    this.startCountdown--;
                    this.updateCountdown();

                    if (this.startCountdown <= 0) {
                        clearInterval(this.startCountdownTimer);
                        this.startGame();
                    }
                }, 1000);
            }
        } else {
            if (this.gameState === 'starting') {
                this.gameState = 'idle';
                this.startButton.classList.remove('active');
                this.countdownEl.textContent = '';
                clearInterval(this.startCountdownTimer);
            }
        }
    }

    /**
     * 更新倒计时显示
     */
    updateCountdown() {
        if (this.countdownEl) {
            this.countdownEl.textContent = this.startCountdown > 0 ? this.startCountdown : '';
        }
    }

    /**
     * 检查重新开始按钮交互
     */
    checkRestartButtonInteraction(hands) {
        if (!this.restartButton) return;

        const rect = this.restartButton.getBoundingClientRect();
        const isHandOver = this.handTracking.isHandInArea(
            rect.left,
            rect.top,
            rect.width,
            rect.height
        );

        if (isHandOver) {
            if (this.gameState === 'gameover') {
                this.gameState = 'restarting';
                this.restartButton.classList.add('active');
                this.restartCountdown = 3;
                this.updateRestartCountdown();

                this.restartCountdownTimer = setInterval(() => {
                    this.restartCountdown--;
                    this.updateRestartCountdown();

                    if (this.restartCountdown <= 0) {
                        clearInterval(this.restartCountdownTimer);
                        this.restartGame();
                    }
                }, 1000);
            }
        } else {
            if (this.gameState === 'restarting') {
                this.gameState = 'gameover';
                this.restartButton.classList.remove('active');
                this.clearRestartCountdown();
                clearInterval(this.restartCountdownTimer);
            }
        }
    }

    /**
     * 更新重新开始倒计时显示
     */
    updateRestartCountdown() {
        // 在重新开始按钮上显示倒计时
        const countdownSpan = this.restartButton.querySelector('.button-countdown') ||
            (() => {
                const span = document.createElement('span');
                span.className = 'button-countdown';
                span.style.cssText = 'position: absolute; font-size: 36px; font-weight: bold; color: #fff;';
                this.restartButton.appendChild(span);
                return span;
            })();
        countdownSpan.textContent = this.restartCountdown > 0 ? this.restartCountdown : '';
    }

    /**
     * 清除重新开始倒计时显示
     */
    clearRestartCountdown() {
        const countdownSpan = this.restartButton.querySelector('.button-countdown');
        if (countdownSpan) {
            countdownSpan.textContent = '';
        }
    }

    /**
     * 开始游戏
     */
    startGame() {
        this.gameState = 'playing';
        this.startScreen.classList.add('hidden');
        this.pauseScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');

        this.scoreSystem.start();
        this.gameScene.reset();
        this.gameScene.setPaused(false);

        // 重置时间帧用于计算deltaTime
        this.lastFrameTime = null;

        // 开始游戏循环
        this.gameLoop();
    }

    /**
     * 游戏循环
     */
    gameLoop() {
        if (this.gameState !== 'playing') return;

        // 使用真实时间差计算deltaTime
        const now = performance.now();
        if (!this.lastFrameTime) {
            this.lastFrameTime = now;
        }
        const deltaTime = (now - this.lastFrameTime) / 1000; // 转换为秒
        this.lastFrameTime = now;

        // 更新计分系统（包含倒计时）
        this.scoreSystem.update(deltaTime);

        // 继续循环
        requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * 暂停/继续游戏
     */
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            this.pauseScreen.classList.remove('hidden');
            this.gameScene.setPaused(true);
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            this.pauseScreen.classList.add('hidden');
            this.gameScene.setPaused(false);
            // 重置时间帧，防止暂停期间的时间被计入
            this.lastFrameTime = null;
            this.gameLoop();
        }
    }

    /**
     * 水果切割回调
     */
    onFruitCut(fruitType) {
        this.scoreSystem.cutFruit(fruitType);
        this.audioManager.playCutSound();
    }

    /**
     * 炸弹切割回调
     */
    onBombCut() {
        this.scoreSystem.cutBomb();
        this.audioManager.playExplosionSound();

        // 屏幕震动效果
        this.shakeScreen();
    }

    /**
     * 屏幕震动效果
     */
    shakeScreen() {
        const container = document.getElementById('app');
        container.style.animation = 'shake 0.5s';

        setTimeout(() => {
            container.style.animation = '';
        }, 500);
    }

    /**
     * 显示游戏结束界面
     */
    showGameOver(data) {
        this.gameState = 'gameover';
        this.gameOverScreen.classList.remove('hidden');

        if (this.finalScoreValueEl) {
            this.finalScoreValueEl.textContent = data.score;
        }

        this.gameScene.setPaused(true);
    }

    /**
     * 重新开始游戏
     */
    restartGame() {
        this.gameState = 'idle';
        this.gameOverScreen.classList.add('hidden');
        this.startScreen.classList.remove('hidden');

        this.scoreSystem.reset();
        this.gameScene.reset();
        this.updateScoreDisplay(0);
        this.updateTimeDisplay(60);
    }

    /**
     * 更新分数显示
     */
    updateScoreDisplay(score) {
        if (this.scoreValueEl) {
            this.scoreValueEl.textContent = score;

            // 分数变化动画
            this.scoreValueEl.style.transform = 'scale(1.2)';
            setTimeout(() => {
                this.scoreValueEl.style.transform = 'scale(1)';
            }, 200);
        }
    }

    /**
     * 更新时间显示
     */
    updateTimeDisplay(time) {
        if (this.timeRemainingEl) {
            this.timeRemainingEl.textContent = Math.ceil(time);

            // 时间紧迫时变红
            if (time <= 10) {
                this.timeRemainingEl.style.color = '#FF5252';
            } else {
                this.timeRemainingEl.style.color = '#FF9800';
            }
        }
    }
}

// 添加屏幕震动动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// 启动游戏
window.addEventListener('DOMContentLoaded', () => {
    try {
        new FruitCuttingGame();
    } catch (error) {
        console.error('游戏初始化失败:', error);
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; flex-direction: column; color: white; background: #000;">
                <h1>游戏加载失败</h1>
                <p>错误信息: ${error.message}</p>
                <p>请检查浏览器控制台获取更多信息</p>
            </div>
        `;
    }
});
