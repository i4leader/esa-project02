# 🍉 Fruit Ninja - Modern Hand Tracking Game

A gesture-controlled fruit cutting game using webcam hand tracking, built with Three.js and MediaPipe. **Now optimized for Aliyun ESA deployment!**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Three.js](https://img.shields.io/badge/Three.js-0.181.2-green.svg)
![MediaPipe](https://img.shields.io/badge/MediaPipe-0.10.22--rc.20250304-orange.svg)

## ✨ What's New - v2.0 (Aliyun ESA Ready)

### 🚀 Major Improvements
- **Modern MediaPipe**: Upgraded to `@mediapipe/tasks-vision` v0.10.22-rc.20250304 for better reliability
- **Performance Optimization**: Device-adaptive configurations for smooth gameplay
- **Enhanced Error Handling**: Better fallback mechanisms for production environments
- **Fluorescent Trail Effects**: Beautiful neon-style hand tracking visuals
- **Production-Ready**: Optimized specifically for Aliyun ESA deployment

### 🔧 Technical Upgrades
- **ModernHandTracker**: New architecture based on proven gesture-control patterns
- **Performance Monitoring**: Real-time FPS and performance metrics (Press 'P')
- **Adaptive Quality**: Automatically adjusts based on device capabilities
- **Better Fallbacks**: Mouse/touch controls when camera fails

## 🎮 Game Features

### Hand Gesture Controls
- **✋ Slice Fruits**: Move your hands to cut flying fruits
- **🚫 Avoid Bombs**: Don't touch the black bombs!
- **⏱️ Time Challenge**: 60 seconds to get the highest score
- **🎯 Progressive Difficulty**: Spawn rate increases over time

### Visual Effects
- **🌈 Neon Trails**: Fluorescent hand tracking trails
- **💥 Particle Effects**: Explosive fruit cutting animations
- **🎨 3D Graphics**: Beautiful Three.js rendered fruits and effects
- **📊 Real-time Stats**: System info and performance monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Modern browser (Chrome/Edge/Firefox recommended)
- Webcam device
- **HTTPS connection** (required for camera access)

### Installation & Development
```bash
# Clone the repository
git clone <repository-url>
cd esa-project02

# Install dependencies
npm install

# Start development server
npm run dev
# Visit http://localhost:3000
```

### Production Build
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Aliyun ESA Deployment

### Why It Now Works on Aliyun ESA
1. **Modern MediaPipe**: Uses latest `@mediapipe/tasks-vision` instead of deprecated packages
2. **CDN Reliability**: Multiple fallback CDN sources for model loading
3. **HTTPS Ready**: Proper secure context handling for production
4. **Error Recovery**: Graceful fallbacks when MediaPipe fails to load
5. **Performance Adaptive**: Automatically adjusts to server environment

### Deployment Configuration
The project includes `esa.jsonc` configuration:
```json
{
    "build": {
        "command": "npm run build"
    },
    "assets": {
        "directory": "dist"
    },
    "routes": [
        {
            "src": ".*",
            "dest": "/index.html"
        }
    ]
}
```

### Deployment Steps
1. **Build the project**: `npm run build`
2. **Upload to Aliyun ESA**: Upload the `dist/` folder
3. **Configure HTTPS**: Ensure your domain uses HTTPS
4. **Test camera access**: Use the built-in debug tools

## 🎯 How to Play

### Getting Started
1. **Allow Camera Access**: Grant permission when prompted
2. **Hand Positioning**: Hold your hands in front of the camera
3. **Start Game**: Hover hand over "START GAME" button for 3 seconds
4. **Slice Fruits**: Move your hands to cut flying fruits
5. **Avoid Bombs**: Don't touch the black spheres!

### Controls
- **Hand Gestures**: Primary control method
- **Mouse/Touch**: Fallback when camera unavailable
- **SPACE**: Pause/Resume game
- **P**: Toggle performance monitor

### Scoring
- **🍎 Fruits**: +10 points each
- **💣 Bombs**: -20 points each
- **⏱️ Time Bonus**: Higher scores for quick cuts

## 🛠️ Technical Architecture

### Modern Components
```
src/
├── components/
│   ├── ModernHandTracker.js    # New MediaPipe implementation
│   ├── TrailRenderer.js        # Fluorescent trail effects
│   ├── GameScene.js           # Three.js game logic
│   └── ScoreSystem.js         # Game scoring
├── config/
│   └── performance.js         # Device-adaptive settings
└── utils/
    ├── SystemInfo.js          # Real-time system stats
    └── AudioManager.js        # Sound effects
```

### Performance Optimization
The game automatically detects device capabilities and adjusts:

| Device Type | Detection FPS | Particles | Target FPS | Post-Processing |
|-------------|---------------|-----------|------------|-----------------|
| Low-end     | 20fps        | 15        | 30fps      | Disabled        |
| Medium      | 30fps        | 25        | 60fps      | Enabled         |
| High-end    | 60fps        | 30        | 60fps      | Full Quality    |

## 🔧 Troubleshooting

### Camera Issues
**Problem**: Camera not working on Aliyun ESA
**Solutions**:
1. Ensure HTTPS is enabled on your domain
2. Check browser permissions for camera access
3. Try different browsers (Chrome recommended)
4. Use the built-in camera debug tool
5. Check browser console for detailed errors

### Performance Issues
**Problem**: Low FPS or stuttering
**Solutions**:
1. The game auto-adjusts quality based on device
2. Press 'P' to view performance metrics
3. Close other applications using GPU
4. Try reducing browser window size

### MediaPipe Loading Issues
**Problem**: "MediaPipe initialization failed"
**Solutions**:
1. Check network connection
2. Verify CDN access (jsdelivr.net, unpkg.com)
3. Game will fallback to mouse/touch controls
4. Refresh page to retry initialization

## 🎨 Customization

### Adjusting Performance
Edit `src/config/performance.js` to modify:
- Detection frame rates
- Particle counts
- Quality presets
- Device capability thresholds

### Visual Effects
Modify `src/components/TrailRenderer.js` for:
- Trail colors and effects
- Glow intensity
- Trail length and fade

### Game Mechanics
Update `src/components/GameScene.js` for:
- Fruit spawn rates
- Difficulty progression
- Collision detection sensitivity

## 📊 Performance Monitoring

Press **P** during gameplay to view:
- Real-time FPS
- Frame time breakdown
- Gesture detection performance
- Game update timing
- Render performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- [gesture-control](../gesture-control) - The proven architecture this project is based on
- [MediaPipe](https://ai.google.dev/edge/mediapipe) - Hand tracking technology
- [Three.js](https://threejs.org/) - 3D graphics library

---

⭐ **Now production-ready for Aliyun ESA!** ⭐

If you encounter any issues with deployment, check the troubleshooting section or open an issue with your browser console logs.