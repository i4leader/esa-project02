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
        console.log('🎮 FruitCuttingGame: Starting camera initialization...');
        
        try {
            const success = await this.handTracking.initialize();
            console.log('🎮 FruitCuttingGame: HandTracking.initialize() returned:', success);

            if (success) {
                this.systemInfo.updateCameraStatus('Connected');
                console.log('🎮 FruitCuttingGame: Camera initialization SUCCESS');
            } else {
                throw new Error('HandTracking initialization returned false');
            }
        } catch (initError) {
            console.error('🎮 FruitCuttingGame: Camera initialization FAILED:', initError);
            
            const errorMsg = this.handTracking.getLastError ? this.handTracking.getLastError() : initError.message;
            this.systemInfo.updateCameraStatus('Failed');

            console.error('Camera initialization failed on Aliyun ESA:', errorMsg);

            // Show debug link
            const debugLink = document.getElementById('debug-link');
            if (debugLink) {
                debugLink.style.display = 'block';
            }

            // Show quick test button
            const testBtn = document.getElementById('test-camera-btn');
            if (testBtn) {
                testBtn.style.display = 'inline-block';
            }

            // Enhanced error handling for Aliyun ESA deployment
            let userMessage = 'Unable to access camera. ';
            
            if (errorMsg.includes('denied')) {
                userMessage += 'Please allow camera access when prompted and refresh the page.';
            } else if (errorMsg.includes('NotFoundError')) {
                userMessage += 'No camera device detected. Please ensure a camera is connected.';
            } else if (errorMsg.includes('NotReadableError')) {
                userMessage += 'Camera is being used by another application. Please close other apps using the camera.';
            } else if (errorMsg.includes('HTTPS')) {
                userMessage += 'This site requires HTTPS for camera access.';
            } else if (errorMsg.includes('MediaPipe')) {
                userMessage += `MediaPipe initialization failed. This might be a CDN or network issue.\n\n` +
                    'The game will work with mouse/touch controls instead.';
            } else {
                userMessage += `Error: ${errorMsg}\n\n` +
                    'Troubleshooting:\n' +
                    '1. Refresh the page and allow camera access\n' +
                    '2. Check if camera is being used by other apps\n' +
                    '3. Try a different browser (Chrome/Edge recommended)\n' +
                    '4. Check browser console for detailed error logs\n' +
                    '5. Use the Debug Camera tool for more information';
            }

            // Show user-friendly error message
            this.showCameraError(userMessage);
        }
    }

    /**
     * Show camera error message to user
     */
    showCameraError(message) {
        // Create error overlay
        const errorOverlay = document.createElement('div');
        errorOverlay.id = 'camera-error-overlay';
        errorOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 20px;
        `;

        errorOverlay.innerHTML = `
            <div style="max-width: 600px;">
                <h2 style="color: #FF5252; margin-bottom: 20px;">📷 Camera Access Required</h2>
                <p style="font-size: 18px; line-height: 1.6; margin-bottom: 30px;">${message}</p>
                <button id="retry-camera" style="
                    background: #4CAF50;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    font-size: 16px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-right: 10px;
                ">Try Again</button>
                <button id="close-error" style="
                    background: #666;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    font-size: 16px;
                    border-radius: 5px;
                    cursor: pointer;
                ">Continue Without Camera</button>
                <button onclick="window.open('/debug-camera.html', '_blank')" style="
                    background: #FF9800;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    font-size: 16px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-left: 10px;
                ">🔍 Debug Camera</button>
            </div>
        `;

        document.body.appendChild(errorOverlay);

        // Add event listeners
        document.getElementById('retry-camera').addEventListener('click', () => {
            document.body.removeChild(errorOverlay);
            this.initializeCamera();
        });

        document.getElementById('close-error').addEventListener('click', () => {
            document.body.removeChild(errorOverlay);
            // Continue with game but show warning and enable fallback controls
            this.systemInfo.updateCameraStatus('Mouse/Touch Mode');
            this.setupFallbackControls();
            
            // Show instruction for fallback mode
            setTimeout(() => {
                const instruction = document.createElement('div');
                instruction.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(76, 175, 80, 0.9);
                    color: white;
                    padding: 20px;
                    border-radius: 10px;
                    z-index: 999;
                    text-align: center;
                    font-size: 16px;
                `;
                instruction.innerHTML = `
                    <p><strong>🖱️ Mouse/Touch Mode Enabled</strong></p>
                    <p>Click and drag to slice fruits!</p>
                `;
                document.body.appendChild(instruction);
                
                setTimeout(() => {
                    if (document.body.contains(instruction)) {
                        document.body.removeChild(instruction);
                    }
                }, 3000);
            }, 500);
        });
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
     * Setup fallback mouse/touch controls when camera is not available
     */
    setupFallbackControls() {
        let isMouseDown = false;
        let mouseTrail = [];
        const maxTrailLength = 25;

        const addMousePoint = (x, y) => {
            mouseTrail.push({ x, y, timestamp: Date.now() });
            if (mouseTrail.length > maxTrailLength) {
                mouseTrail.shift();
            }

            // Update cutting paths for game scene
            if (mouseTrail.length >= 2) {
                this.gameScene.updateCuttingPaths([{
                    points: mouseTrail.map(p => ({ x: p.x, y: p.y })),
                    hand: 'mouse'
                }]);
            }
        };

        const clearMouseTrail = () => {
            mouseTrail = [];
            this.gameScene.updateCuttingPaths([]);
        };

        // Mouse events
        this.canvasElement.addEventListener('mousedown', (e) => {
            isMouseDown = true;
            const rect = this.canvasElement.getBoundingClientRect();
            addMousePoint(e.clientX - rect.left, e.clientY - rect.top);
        });

        this.canvasElement.addEventListener('mousemove', (e) => {
            if (isMouseDown) {
                const rect = this.canvasElement.getBoundingClientRect();
                addMousePoint(e.clientX - rect.left, e.clientY - rect.top);
            }
        });

        this.canvasElement.addEventListener('mouseup', () => {
            isMouseDown = false;
            setTimeout(clearMouseTrail, 300); // Clear trail after 300ms
        });

        // Touch events for mobile
        this.canvasElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = this.canvasElement.getBoundingClientRect();
            const touch = e.touches[0];
            addMousePoint(touch.clientX - rect.left, touch.clientY - rect.top);
        });

        this.canvasElement.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvasElement.getBoundingClientRect();
            const touch = e.touches[0];
            addMousePoint(touch.clientX - rect.left, touch.clientY - rect.top);
        });

        this.canvasElement.addEventListener('touchend', (e) => {
            e.preventDefault();
            setTimeout(clearMouseTrail, 300);
        });

        console.log('Fallback mouse/touch controls enabled');
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

// Quick camera test function (global)
window.testCameraQuick = async function() {
    const statusEl = document.getElementById('camera-status');
    const testBtn = document.getElementById('test-camera-btn');
    
    statusEl.textContent = 'Testing...';
    testBtn.disabled = true;
    
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' }
        });
        
        statusEl.textContent = 'Test OK';
        statusEl.style.color = '#4CAF50';
        
        // Stop the test stream
        stream.getTracks().forEach(track => track.stop());
        
        setTimeout(() => {
            statusEl.textContent = 'Failed';
            statusEl.style.color = '#FF5252';
            testBtn.disabled = false;
        }, 2000);
        
    } catch (error) {
        statusEl.textContent = `Test Failed: ${error.name}`;
        statusEl.style.color = '#FF5252';
        testBtn.disabled = false;
        console.error('Quick camera test failed:', error);
    }
};
