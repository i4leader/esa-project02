/**
 * Performance Configuration System
 * Adaptive performance settings based on device capabilities
 */

// Device capability levels
const DEVICE_CAPABILITY = {
    LOW: 'low',
    MEDIUM: 'medium', 
    HIGH: 'high'
};

// Performance presets for different device capabilities
const PERFORMANCE_PRESETS = {
    [DEVICE_CAPABILITY.LOW]: {
        gestureDetectionFps: 20,
        particleCount: 15,
        targetFps: 30,
        enablePostProcessing: false,
        fruitSpawnRate: 0.3,
        maxTrailLength: 15
    },
    [DEVICE_CAPABILITY.MEDIUM]: {
        gestureDetectionFps: 30,
        particleCount: 25,
        targetFps: 60,
        enablePostProcessing: true,
        fruitSpawnRate: 0.4,
        maxTrailLength: 20
    },
    [DEVICE_CAPABILITY.HIGH]: {
        gestureDetectionFps: 60,
        particleCount: 30,
        targetFps: 60,
        enablePostProcessing: true,
        fruitSpawnRate: 0.5,
        maxTrailLength: 25
    }
};

/**
 * Detect device capability based on hardware and browser
 */
function getDeviceCapability() {
    // Check for mobile devices
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // Check hardware concurrency (CPU cores)
    const cores = navigator.hardwareConcurrency || 2;
    
    // Check memory (if available)
    const memory = navigator.deviceMemory || 4;
    
    // Check WebGL capabilities
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const hasWebGL2 = !!canvas.getContext('webgl2');
    
    let capability = DEVICE_CAPABILITY.MEDIUM;
    
    if (isMobile) {
        // Mobile devices default to low, but high-end mobiles can be medium
        capability = (cores >= 6 && memory >= 4) ? DEVICE_CAPABILITY.MEDIUM : DEVICE_CAPABILITY.LOW;
    } else {
        // Desktop devices
        if (cores >= 8 && memory >= 8 && hasWebGL2) {
            capability = DEVICE_CAPABILITY.HIGH;
        } else if (cores >= 4 && memory >= 4) {
            capability = DEVICE_CAPABILITY.MEDIUM;
        } else {
            capability = DEVICE_CAPABILITY.LOW;
        }
    }
    
    console.log(`[Performance] Device Analysis:`, {
        isMobile,
        cores,
        memory,
        hasWebGL2,
        userAgent: navigator.userAgent,
        detectedCapability: capability
    });
    
    return capability;
}

/**
 * Get optimal performance configuration for current device
 */
export function getOptimalPerformanceConfig() {
    const capability = getDeviceCapability();
    const config = PERFORMANCE_PRESETS[capability];
    
    console.log(`[Performance] Using ${capability} preset:`, config);
    
    return {
        ...config,
        deviceCapability: capability
    };
}

/**
 * Apply performance configuration globally
 */
export function applyPerformanceConfig(config) {
    // Store globally for access by other modules
    window.__FRUIT_GAME_PERFORMANCE_CONFIG = config;
    
    // Apply CSS optimizations for low-end devices
    if (config.targetFps <= 30) {
        document.documentElement.style.setProperty('--animation-duration', '0.5s');
        document.documentElement.style.setProperty('--transition-duration', '0.3s');
    }
    
    console.log('[Performance] Configuration applied:', config);
}

/**
 * Get current performance configuration
 */
export function getCurrentPerformanceConfig() {
    return window.__FRUIT_GAME_PERFORMANCE_CONFIG || getOptimalPerformanceConfig();
}

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: 0,
            frameTime: 0,
            gestureDetectionTime: 0,
            gameUpdateTime: 0,
            renderTime: 0
        };
        
        this.frameCount = 0;
        this.lastFpsUpdate = 0;
        this.isVisible = false;
        this.displayElement = null;
    }
    
    startFrame() {
        return performance.now();
    }
    
    endFrame(startTime) {
        const frameTime = performance.now() - startTime;
        this.metrics.frameTime = frameTime;
        
        this.frameCount++;
        const now = performance.now();
        
        if (now - this.lastFpsUpdate >= 1000) {
            this.metrics.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = now;
            
            if (this.isVisible) {
                this.updateDisplay();
            }
        }
    }
    
    recordGestureDetection(time) {
        this.metrics.gestureDetectionTime = time;
    }
    
    recordGameUpdate(time) {
        this.metrics.gameUpdateTime = time;
    }
    
    recordRender(time) {
        this.metrics.renderTime = time;
    }
    
    toggle() {
        this.isVisible = !this.isVisible;
        
        if (this.isVisible) {
            this.createDisplay();
        } else if (this.displayElement) {
            this.displayElement.remove();
            this.displayElement = null;
        }
    }
    
    createDisplay() {
        if (this.displayElement) return;
        
        this.displayElement = document.createElement('div');
        this.displayElement.style.cssText = `
            position: fixed;
            top: 120px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            font-family: monospace;
            font-size: 12px;
            padding: 10px;
            border-radius: 5px;
            z-index: 1000;
            min-width: 200px;
        `;
        
        document.body.appendChild(this.displayElement);
        this.updateDisplay();
    }
    
    updateDisplay() {
        if (!this.displayElement) return;
        
        this.displayElement.innerHTML = `
            <div style="color: #ffff00; font-weight: bold;">⚡ Performance Monitor</div>
            <div>FPS: ${this.metrics.fps}</div>
            <div>Frame: ${this.metrics.frameTime.toFixed(1)}ms</div>
            <div>Gesture: ${this.metrics.gestureDetectionTime.toFixed(1)}ms</div>
            <div>Game: ${this.metrics.gameUpdateTime.toFixed(1)}ms</div>
            <div>Render: ${this.metrics.renderTime.toFixed(1)}ms</div>
        `;
    }
    
    getMetrics() {
        return { ...this.metrics };
    }
}