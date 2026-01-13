/**
 * Trail Renderer - Modern canvas-based trail rendering with fluorescent effects
 * Based on gesture-control's visual effects system
 */

export class TrailRenderer {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
        
        if (!this.ctx) {
            throw new Error('TrailRenderer: Unable to get 2D context');
        }
        
        // Fluorescent colors matching gesture-control
        this.colors = {
            left: '#00FFFF',   // Neon Blue
            right: '#00FF00',  // Neon Green
            mouse: '#FF1493'   // Hot Pink
        };
        
        this.setupCanvas();
    }
    
    /**
     * Setup canvas for optimal rendering
     */
    setupCanvas() {
        // Set canvas size to match client size
        this.resizeCanvas();
        
        // Listen for window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    /**
     * Resize canvas to match container
     */
    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        
        // Set canvas CSS size
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }
    
    /**
     * Clear the canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Draw hand trails with fluorescent effects
     */
    drawTrails(trails) {
        this.clear();
        
        // Draw left hand trail
        if (trails.left && trails.left.length > 1) {
            this.drawTrail(trails.left, this.colors.left, 'left');
        }
        
        // Draw right hand trail
        if (trails.right && trails.right.length > 1) {
            this.drawTrail(trails.right, this.colors.right, 'right');
        }
    }
    
    /**
     * Draw a single trail with fluorescent glow effect
     */
    drawTrail(trail, color, hand) {
        if (trail.length < 2) return;
        
        this.ctx.save();
        
        // Set up glow effect
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = color;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Draw multiple layers for enhanced glow
        const layers = [
            { width: 8, alpha: 0.3 },
            { width: 5, alpha: 0.6 },
            { width: 3, alpha: 1.0 }
        ];
        
        layers.forEach(layer => {
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = layer.width;
            this.ctx.globalAlpha = layer.alpha;
            
            this.ctx.beginPath();
            
            // Draw trail with fade effect
            trail.forEach((point, index) => {
                const progress = index / (trail.length - 1);
                const fadeAlpha = progress * layer.alpha;
                
                this.ctx.globalAlpha = fadeAlpha;
                
                if (index === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    // Smooth curve using quadratic bezier
                    const prevPoint = trail[index - 1];
                    const midX = (prevPoint.x + point.x) / 2;
                    const midY = (prevPoint.y + point.y) / 2;
                    
                    if (index === 1) {
                        this.ctx.lineTo(midX, midY);
                    } else {
                        this.ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, midX, midY);
                    }
                }
            });
            
            // Final point
            if (trail.length > 1) {
                const lastPoint = trail[trail.length - 1];
                this.ctx.lineTo(lastPoint.x, lastPoint.y);
            }
            
            this.ctx.stroke();
        });
        
        this.ctx.restore();
    }
    
    /**
     * Draw cutting paths for debugging
     */
    drawCuttingPaths(paths) {
        if (!paths || paths.length === 0) return;
        
        this.ctx.save();
        
        paths.forEach(path => {
            if (path.points.length < 2) return;
            
            const color = this.colors[path.hand] || this.colors.mouse;
            
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.globalAlpha = 0.5;
            
            this.ctx.beginPath();
            path.points.forEach((point, index) => {
                if (index === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    this.ctx.lineTo(point.x, point.y);
                }
            });
            this.ctx.stroke();
        });
        
        this.ctx.restore();
    }
    
    /**
     * Draw hand landmarks for debugging
     */
    drawHandLandmarks(hands) {
        if (!hands) return;
        
        this.ctx.save();
        
        [hands.left, hands.right].forEach((hand, handIndex) => {
            if (!hand || !hand.landmarks) return;
            
            const color = handIndex === 0 ? this.colors.left : this.colors.right;
            
            // Draw landmarks
            this.ctx.fillStyle = color;
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 2;
            
            hand.landmarks.forEach((landmark, index) => {
                const x = landmark.x * this.canvas.clientWidth;
                const y = landmark.y * this.canvas.clientHeight;
                
                // Draw landmark point
                this.ctx.beginPath();
                this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
                this.ctx.fill();
                
                // Draw landmark number
                this.ctx.fillText(index.toString(), x + 5, y - 5);
            });
            
            // Draw connections (simplified)
            const connections = [
                [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
                [0, 5], [5, 6], [6, 7], [7, 8], // Index
                [0, 9], [9, 10], [10, 11], [11, 12], // Middle
                [0, 13], [13, 14], [14, 15], [15, 16], // Ring
                [0, 17], [17, 18], [18, 19], [19, 20] // Pinky
            ];
            
            connections.forEach(([start, end]) => {
                const startPoint = hand.landmarks[start];
                const endPoint = hand.landmarks[end];
                
                if (startPoint && endPoint) {
                    const x1 = startPoint.x * this.canvas.clientWidth;
                    const y1 = startPoint.y * this.canvas.clientHeight;
                    const x2 = endPoint.x * this.canvas.clientWidth;
                    const y2 = endPoint.y * this.canvas.clientHeight;
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, y1);
                    this.ctx.lineTo(x2, y2);
                    this.ctx.stroke();
                }
            });
        });
        
        this.ctx.restore();
    }
    
    /**
     * Update canvas size when container changes
     */
    onWindowResize() {
        this.resizeCanvas();
    }
    
    /**
     * Cleanup resources
     */
    dispose() {
        window.removeEventListener('resize', () => this.resizeCanvas());
    }
}