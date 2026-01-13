/**
 * Modern Hand Tracker - Based on gesture-control's proven architecture
 * Uses @mediapipe/tasks-vision for better reliability on Aliyun ESA
 */
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export class ModernHandTracker {
    constructor() {
        this.handLandmarker = null;
        this.isInitialized = false;
        this.lastError = null;
        this.detectionIntervalMs = 33; // ~30fps default
        this.lastDetectionTime = 0;
        
        // Hand tracking results
        this.hands = {
            left: null,
            right: null
        };
        
        // Trails for cutting paths
        this.trails = {
            left: [],
            right: []
        };
        
        this.maxTrailLength = 25;
        this.trailRetentionTime = 350;
    }

    /**
     * Initialize MediaPipe Hand Landmarker
     */
    async initialize(videoElement) {
        console.log('🤖 ModernHandTracker: Starting initialization...');
        
        try {
            // Check secure context
            if (!window.isSecureContext && location.hostname !== 'localhost') {
                throw new Error('HTTPS required for camera access in production');
            }

            // Initialize MediaPipe
            console.log('🤖 Loading MediaPipe FilesetResolver...');
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm"
            );

            console.log('🤖 Creating HandLandmarker...');
            this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numHands: 2,
                minHandDetectionConfidence: 0.5,
                minHandPresenceConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            // Setup camera
            console.log('🤖 Setting up camera...');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280, min: 640 },
                    height: { ideal: 720, min: 480 },
                    facingMode: 'user'
                }
            });

            videoElement.srcObject = stream;
            videoElement.setAttribute('playsinline', 'true');
            
            await new Promise((resolve) => {
                videoElement.onloadedmetadata = resolve;
                setTimeout(resolve, 2000); // Timeout fallback
            });

            await videoElement.play();
            
            this.isInitialized = true;
            console.log('🤖 ModernHandTracker: Initialization complete!');
            return true;

        } catch (error) {
            console.error('🤖 ModernHandTracker initialization failed:', error);
            this.lastError = this.formatError(error);
            this.isInitialized = false;
            return false;
        }
    }

    /**
     * Format error messages for better user experience
     */
    formatError(error) {
        if (error.name === 'NotAllowedError') {
            return 'Camera access denied. Please allow camera permissions and refresh.';
        } else if (error.name === 'NotFoundError') {
            return 'No camera found. Please connect a camera device.';
        } else if (error.name === 'NotReadableError') {
            return 'Camera is being used by another application.';
        } else if (error.message.includes('HTTPS')) {
            return 'HTTPS required for camera access.';
        } else if (error.message.includes('MediaPipe') || error.message.includes('model')) {
            return 'MediaPipe model loading failed. Check network connection.';
        }
        return error.message || 'Unknown camera error';
    }

    /**
     * Set detection interval for performance optimization
     */
    setDetectionIntervalMs(intervalMs) {
        this.detectionIntervalMs = intervalMs;
    }

    /**
     * Detect hands with throttling
     */
    detectHands(currentTime) {
        if (!this.isInitialized || !this.handLandmarker) {
            return null;
        }

        // Throttle detection based on interval
        if (currentTime - this.lastDetectionTime < this.detectionIntervalMs) {
            return this.getLastResults();
        }

        this.lastDetectionTime = currentTime;

        try {
            const videoElement = document.getElementById('video-input');
            if (!videoElement || videoElement.videoWidth === 0) {
                return null;
            }

            const results = this.handLandmarker.detectForVideo(videoElement, currentTime);
            this.processResults(results);
            return this.getLastResults();

        } catch (error) {
            console.warn('🤖 Hand detection error:', error);
            return null;
        }
    }

    /**
     * Process MediaPipe results
     */
    processResults(results) {
        // Reset hands
        this.hands.left = null;
        this.hands.right = null;

        if (!results.landmarks || results.landmarks.length === 0) {
            this.updateTrails();
            return;
        }

        // Process each detected hand
        results.landmarks.forEach((landmarks, index) => {
            const handedness = results.handednesses[index];
            if (!handedness || handedness.length === 0) return;

            const handLabel = handedness[0].categoryName.toLowerCase();
            const confidence = handedness[0].score;

            // Get key points for cutting (index and middle finger tips)
            const indexFinger = landmarks[8];  // Index finger tip
            const middleFinger = landmarks[12]; // Middle finger tip
            const wrist = landmarks[0];         // Wrist

            // Calculate cutting position (midpoint of index and middle finger)
            const cuttingPosition = {
                x: (indexFinger.x + middleFinger.x) / 2,
                y: (indexFinger.y + middleFinger.y) / 2,
                z: (indexFinger.z + middleFinger.z) / 2
            };

            // Convert to screen coordinates
            const canvas = document.getElementById('hand-canvas');
            const screenX = cuttingPosition.x * canvas.width;
            const screenY = cuttingPosition.y * canvas.height;

            const handData = {
                landmarks: landmarks,
                position: {
                    x: screenX,
                    y: screenY,
                    z: cuttingPosition.z
                },
                wrist: {
                    x: wrist.x * canvas.width,
                    y: wrist.y * canvas.height
                },
                confidence: confidence
            };

            if (handLabel === 'left') {
                this.hands.left = handData;
            } else if (handLabel === 'right') {
                this.hands.right = handData;
            }
        });

        this.updateTrails();
    }

    /**
     * Update hand trails for cutting paths
     */
    updateTrails() {
        const now = Date.now();

        // Update left hand trail
        if (this.hands.left) {
            this.trails.left.push({
                x: this.hands.left.position.x,
                y: this.hands.left.position.y,
                timestamp: now
            });

            if (this.trails.left.length > this.maxTrailLength) {
                this.trails.left.shift();
            }
        }

        // Clean expired trail points
        this.trails.left = this.trails.left.filter(
            point => now - point.timestamp < this.trailRetentionTime
        );

        // Update right hand trail
        if (this.hands.right) {
            this.trails.right.push({
                x: this.hands.right.position.x,
                y: this.hands.right.position.y,
                timestamp: now
            });

            if (this.trails.right.length > this.maxTrailLength) {
                this.trails.right.shift();
            }
        }

        // Clean expired trail points
        this.trails.right = this.trails.right.filter(
            point => now - point.timestamp < this.trailRetentionTime
        );
    }

    /**
     * Get last detection results
     */
    getLastResults() {
        return {
            landmarks: this.getHandLandmarks(),
            handednesses: this.getHandedness()
        };
    }

    /**
     * Get hand landmarks in MediaPipe format
     */
    getHandLandmarks() {
        const landmarks = [];
        if (this.hands.left) landmarks.push(this.hands.left.landmarks);
        if (this.hands.right) landmarks.push(this.hands.right.landmarks);
        return landmarks;
    }

    /**
     * Get handedness information
     */
    getHandedness() {
        const handedness = [];
        if (this.hands.left) {
            handedness.push([{
                categoryName: 'Left',
                score: this.hands.left.confidence
            }]);
        }
        if (this.hands.right) {
            handedness.push([{
                categoryName: 'Right', 
                score: this.hands.right.confidence
            }]);
        }
        return handedness;
    }

    /**
     * Get cutting paths for game collision detection
     */
    getCuttingPaths() {
        const paths = [];

        if (this.trails.left.length >= 2) {
            paths.push({
                points: this.trails.left.map(p => ({ x: p.x, y: p.y })),
                hand: 'left'
            });
        }

        if (this.trails.right.length >= 2) {
            paths.push({
                points: this.trails.right.map(p => ({ x: p.x, y: p.y })),
                hand: 'right'
            });
        }

        return paths;
    }

    /**
     * Check if hand is in area (for button interactions)
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

    /**
     * Get last error message
     */
    getLastError() {
        return this.lastError;
    }

    /**
     * Stop tracking and cleanup
     */
    stop() {
        if (this.handLandmarker) {
            this.handLandmarker.close();
            this.handLandmarker = null;
        }

        const videoElement = document.getElementById('video-input');
        if (videoElement && videoElement.srcObject) {
            const tracks = videoElement.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoElement.srcObject = null;
        }

        this.isInitialized = false;
    }
}