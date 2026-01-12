import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { HAND_CONNECTIONS } from '@mediapipe/hands';

// Version: 2.0.0 - Camera fixes for ESA deployment (2026-01-13)

/**
 * Hand Tracking Component
 * Real-time hand tracking using Mediapipe
 */
export class HandTracking {
    constructor(videoElement, canvasElement, onHandsDetected) {
        if (!videoElement || !canvasElement) {
            throw new Error('HandTracking: videoElement 和 canvasElement 不能为空');
        }

        this.videoElement = videoElement;
        this.canvasElement = canvasElement;
        this.onHandsDetected = onHandsDetected;
        this.ctx = canvasElement.getContext('2d');

        if (!this.ctx) {
            throw new Error('HandTracking: 无法获取 canvas 2D 上下文');
        }

        // 手部检测结果
        this.hands = {
            left: null,
            right: null
        };

        // 手势轨迹（用于切割路径）
        this.trails = {
            left: [],
            right: []
        };

        // 轨迹最大长度
        this.maxTrailLength = 25;

        // 轨迹保留时间（毫秒）
        this.trailRetentionTime = 350;

        // 初始化 Mediapipe Hands
        this.handsSolution = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.handsSolution.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.handsSolution.onResults(this.onResults.bind(this));

        console.log('HandTracking: Hands solution initialized');

        // Initialize camera placeholder
        this.camera = null;
        this.isInitialized = false;

        // Window resize listener
        window.addEventListener('resize', () => this.onWindowResize());
    }

    /**
     * 窗口大小调整
     */
    onWindowResize() {
        this.canvasElement.width = this.canvasElement.clientWidth;
        this.canvasElement.height = this.canvasElement.clientHeight;
    }

    /**
     * Initialize camera and start tracking
     */
    async initialize() {
        console.log('HandTracking: initialize() called');

        try {
            // Enhanced secure context check
            const isSecure = window.isSecureContext || 
                location.protocol === 'https:' ||
                location.hostname === 'localhost' ||
                location.hostname === '127.0.0.1';

            console.log(`HandTracking: Secure Context Check: ${isSecure} (Protocol: ${location.protocol}, Host: ${location.hostname})`);

            // More specific error for production HTTPS requirement
            if (!isSecure) {
                const errorMsg = 'Camera access requires HTTPS in production. Please ensure your Aliyun ESA deployment uses HTTPS.';
                console.error('HandTracking:', errorMsg);
                throw new Error('HTTPS_REQUIRED');
            }

            // Check if getUserMedia is supported
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.error('HandTracking: getUserMedia is not supported in this browser');
                throw new Error('NOT_SUPPORTED');
            }

            console.log('HandTracking: Requesting camera access...');

            // Add debug information for Aliyun ESA
            console.log('Debug info for Aliyun ESA:', {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine,
                language: navigator.language,
                mediaDevices: !!navigator.mediaDevices,
                getUserMedia: !!navigator.mediaDevices?.getUserMedia,
                secureContext: window.isSecureContext,
                location: {
                    protocol: location.protocol,
                    hostname: location.hostname,
                    port: location.port
                }
            });

            // Enhanced camera constraints with fallback options
            const constraints = {
                video: {
                    width: { ideal: 1280, min: 640 },
                    height: { ideal: 720, min: 480 },
                    facingMode: 'user',
                    frameRate: { ideal: 30, min: 15 }
                }
            };

            console.log('Requesting camera with constraints:', constraints);
            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            console.log('HandTracking: Camera access granted, stream ID:', stream.id);

            this.videoElement.srcObject = stream;
            // Ensure video plays (important for some mobile/safari scenarios)
            this.videoElement.setAttribute('playsinline', 'true');

            // Wait for video metadata to load to ensure dimensions are correct
            await new Promise((resolve) => {
                this.videoElement.onloadedmetadata = () => {
                    console.log(`HandTracking: Video metadata loaded. Size: ${this.videoElement.videoWidth}x${this.videoElement.videoHeight}`);
                    resolve();
                };
                // Timeout in case metadata never loads
                setTimeout(resolve, 2000);
            });

            try {
                await this.videoElement.play();
                console.log('HandTracking: Video element playing');
            } catch (e) {
                console.warn('HandTracking: Video play() failed (might be handled by Camera utils):', e);
            }

            // Set canvas dimensions
            this.canvasElement.width = this.canvasElement.clientWidth;
            this.canvasElement.height = this.canvasElement.clientHeight;
            console.log(`HandTracking: Canvas dimensions set to ${this.canvasElement.width}x${this.canvasElement.height}`);

            console.log('HandTracking: Initializing MediaPipe Camera utility...');
            this.camera = new Camera(this.videoElement, {
                onFrame: async () => {
                    await this.handsSolution.send({ image: this.videoElement });
                },
                width: 1280,
                height: 720
            });

            console.log('HandTracking: Starting MediaPipe Camera...');
            await this.camera.start();
            console.log('HandTracking: MediaPipe Camera started successfully');

            this.isInitialized = true;

            return true;
        } catch (error) {
            console.error('Camera initialization failed:', error);
            this.isInitialized = false;
            
            // Enhanced error reporting for production debugging
            let errorMessage = 'Unknown error';
            if (error.name === 'NotAllowedError') {
                errorMessage = 'Camera access denied by user or browser policy';
            } else if (error.name === 'NotFoundError') {
                errorMessage = 'No camera device found';
            } else if (error.name === 'NotReadableError') {
                errorMessage = 'Camera is already in use by another application';
            } else if (error.name === 'OverconstrainedError') {
                errorMessage = 'Camera constraints cannot be satisfied';
            } else if (error.name === 'SecurityError') {
                errorMessage = 'Security error - check HTTPS and permissions';
            } else if (error.message === 'HTTPS_REQUIRED') {
                errorMessage = 'HTTPS required for camera access';
            } else {
                errorMessage = error.message || error.name || 'Unknown camera error';
            }
            
            console.error('Detailed error info:', {
                name: error.name,
                message: error.message,
                constraint: error.constraint,
                stack: error.stack
            });
            
            this.lastError = errorMessage;
            return false;
        }
    }

    /**
     * Get the last error message
     */
    getLastError() {
        return this.lastError;
    }

    /**
     * Mediapipe 检测结果回调
     */
    onResults(results) {
        // 确保 canvas 尺寸正确
        if (this.canvasElement.width !== this.canvasElement.clientWidth ||
            this.canvasElement.height !== this.canvasElement.clientHeight) {
            this.canvasElement.width = this.canvasElement.clientWidth;
            this.canvasElement.height = this.canvasElement.clientHeight;
        }

        // 清空画布
        this.ctx.save();
        this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        // 更新手部检测结果
        this.updateHands(results.multiHandLandmarks, results.multiHandedness);

        // 绘制手部关键点（可选，用于调试）
        // this.drawHands(results.multiHandLandmarks);

        // 更新轨迹
        this.updateTrails();

        // 绘制轨迹
        this.drawTrails();

        this.ctx.restore();

        // 通知外部手部检测结果
        if (this.onHandsDetected) {
            this.onHandsDetected(this.hands, this.trails);
        }
    }

    /**
     * 更新手部检测结果
     */
    updateHands(landmarks, handedness) {
        // 重置
        this.hands.left = null;
        this.hands.right = null;

        if (!landmarks || landmarks.length === 0) {
            return;
        }

        // 根据 handedness 分类左右手
        landmarks.forEach((landmark, index) => {
            const handInfo = handedness[index];
            const handLabel = handInfo.label.toLowerCase();

            // 获取关键点（使用食指和中指的指尖）
            const indexFinger = landmark[8];  // 食指指尖
            const middleFinger = landmark[12]; // 中指指尖
            const wrist = landmark[0];         // 手腕

            // 计算光剑位置（食指和中指的中点）
            const saberPosition = {
                x: (indexFinger.x + middleFinger.x) / 2,
                y: (indexFinger.y + middleFinger.y) / 2,
                z: (indexFinger.z + middleFinger.z) / 2
            };

            // 转换为屏幕坐标
            const screenX = saberPosition.x * this.canvasElement.width;
            const screenY = saberPosition.y * this.canvasElement.height;

            const handData = {
                landmarks: landmark,
                position: {
                    x: screenX,
                    y: screenY,
                    z: saberPosition.z
                },
                wrist: {
                    x: wrist.x * this.canvasElement.width,
                    y: wrist.y * this.canvasElement.height
                },
                confidence: handInfo.score
            };

            if (handLabel === 'left') {
                this.hands.left = handData;
            } else if (handLabel === 'right') {
                this.hands.right = handData;
            }
        });
    }

    /**
     * 更新手势轨迹
     */
    updateTrails() {
        const now = Date.now();

        // 更新左手轨迹
        if (this.hands.left) {
            this.trails.left.push({
                x: this.hands.left.position.x,
                y: this.hands.left.position.y,
                timestamp: now
            });

            // 限制轨迹长度
            if (this.trails.left.length > this.maxTrailLength) {
                this.trails.left.shift();
            }
        } else {
            // 如果手部消失，逐渐淡出轨迹
            this.trails.left = this.trails.left.filter(
                point => now - point.timestamp < this.trailRetentionTime
            );
        }

        // 即使手部存在，也清理过期的轨迹点
        this.trails.left = this.trails.left.filter(
            point => now - point.timestamp < this.trailRetentionTime
        );

        // 更新右手轨迹
        if (this.hands.right) {
            this.trails.right.push({
                x: this.hands.right.position.x,
                y: this.hands.right.position.y,
                timestamp: now
            });

            if (this.trails.right.length > this.maxTrailLength) {
                this.trails.right.shift();
            }
        } else {
            this.trails.right = this.trails.right.filter(
                point => now - point.timestamp < this.trailRetentionTime
            );
        }

        // 即使手部存在，也清理过期的轨迹点
        this.trails.right = this.trails.right.filter(
            point => now - point.timestamp < this.trailRetentionTime
        );
    }

    /**
     * 绘制手势轨迹（荧光效果）
     */
    drawTrails() {
        // 绘制左手轨迹（蓝色）
        if (this.trails.left.length > 1) {
            this.drawTrail(this.trails.left, '#00FFFF');
        }

        // 绘制右手轨迹（绿色）
        if (this.trails.right.length > 1) {
            this.drawTrail(this.trails.right, '#00FF00');
        }
    }

    /**
     * 绘制单条轨迹
     */
    drawTrail(trail, color) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // 添加发光效果
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = color;

        this.ctx.beginPath();

        trail.forEach((point, index) => {
            const alpha = index / trail.length;
            this.ctx.globalAlpha = alpha;

            if (index === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        });

        this.ctx.stroke();
        this.ctx.globalAlpha = 1.0;
        this.ctx.shadowBlur = 0;
    }

    /**
     * 绘制手部关键点（调试用）
     */
    drawHands(landmarks) {
        landmarks.forEach(landmark => {
            drawConnectors(this.ctx, landmark, HAND_CONNECTIONS, {
                color: '#00FF00',
                lineWidth: 2
            });
            drawLandmarks(this.ctx, landmark, {
                color: '#FF0000',
                lineWidth: 1,
                radius: 3
            });
        });
    }

    /**
     * 获取切割路径（用于碰撞检测）
     */
    getCuttingPaths() {
        const paths = [];

        // 左手路径
        if (this.trails.left.length >= 2) {
            paths.push({
                points: this.trails.left.map(p => ({ x: p.x, y: p.y })),
                hand: 'left'
            });
        }

        // 右手路径
        if (this.trails.right.length >= 2) {
            paths.push({
                points: this.trails.right.map(p => ({ x: p.x, y: p.y })),
                hand: 'right'
            });
        }

        return paths;
    }

    /**
     * 停止追踪
     */
    stop() {
        if (this.camera) {
            this.camera.stop();
        }

        if (this.videoElement.srcObject) {
            const tracks = this.videoElement.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            this.videoElement.srcObject = null;
        }

        this.isInitialized = false;
    }

    /**
     * 检查手部是否在指定区域
     */
    isHandInArea(x, y, width, height) {
        const hands = [this.hands.left, this.hands.right].filter(h => h !== null);

        return hands.some(hand => {
            return hand.position.x >= x &&
                hand.position.x <= x + width &&
                hand.position.y >= y &&
                hand.position.y <= y + height;
        });
    }
}
