/**
 * 系统信息管理器
 * 显示分辨率、帧率、浏览器版本、摄像头状态等信息
 */
export class SystemInfo {
    constructor() {
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.updateInterval = 1000; // 每秒更新一次

        this.updateSystemInfo();
        this.startFPSMonitoring();
    }

    /**
     * 更新系统信息
     */
    updateSystemInfo() {
        // 分辨率
        const resolutionEl = document.getElementById('resolution');
        if (resolutionEl) {
            resolutionEl.textContent = `${window.innerWidth} × ${window.innerHeight}`;
        }

        // 浏览器版本
        const browserEl = document.getElementById('browser');
        if (browserEl) {
            browserEl.textContent = this.getBrowserInfo();
        }

        // 窗口大小变化监听
        window.addEventListener('resize', () => {
            if (resolutionEl) {
                resolutionEl.textContent = `${window.innerWidth} × ${window.innerHeight}`;
            }
        });
    }

    /**
     * 获取浏览器信息
     */
    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browser = 'Unknown';

        if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) {
            browser = 'Chrome';
        } else if (ua.indexOf('Edg') > -1) {
            browser = 'Edge';
        } else if (ua.indexOf('Firefox') > -1) {
            browser = 'Firefox';
        } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
            browser = 'Safari';
        }

        return browser;
    }

    /**
     * 开始 FPS 监控
     */
    startFPSMonitoring() {
        const updateFPS = () => {
            this.frameCount++;
            const currentTime = performance.now();
            const deltaTime = currentTime - this.lastTime;

            if (deltaTime >= this.updateInterval) {
                this.fps = Math.round((this.frameCount * 1000) / deltaTime);
                this.frameCount = 0;
                this.lastTime = currentTime;

                const fpsEl = document.getElementById('fps');
                if (fpsEl) {
                    fpsEl.textContent = `${this.fps} FPS`;
                }
            }

            requestAnimationFrame(updateFPS);
        };

        updateFPS();
    }

    /**
     * Update camera status
     */
    updateCameraStatus(status) {
        const cameraStatusEl = document.getElementById('camera-status');
        if (cameraStatusEl) {
            cameraStatusEl.textContent = status;
            cameraStatusEl.style.color = status === 'Connected' ? '#4CAF50' : '#FF5252';
        }
    }

    /**
     * 获取当前 FPS
     */
    getFPS() {
        return this.fps;
    }
}
