# 🚀 Aliyun ESA Deployment Guide

This guide explains how to deploy the modernized Fruit Ninja game to Aliyun ESA (Edge Side Acceleration).

## 🔍 Why the Original Failed vs. New Version Works

### ❌ Original Issues (v1.0)
1. **Outdated MediaPipe**: Used deprecated `@mediapipe/hands` v0.4.x
2. **CDN Dependencies**: Relied on single CDN sources that could be blocked
3. **No Error Handling**: Failed silently without proper fallbacks
4. **Synchronous Loading**: Blocking initialization that failed in production
5. **No Performance Optimization**: One-size-fits-all approach

### ✅ Modern Solutions (v2.0)
1. **Latest MediaPipe**: Uses `@mediapipe/tasks-vision` v0.10.22
2. **Multiple CDN Fallbacks**: Redundant sources for reliability
3. **Graceful Degradation**: Mouse/touch fallbacks when camera fails
4. **Async Architecture**: Non-blocking initialization with proper error handling
5. **Device-Adaptive**: Automatically adjusts performance based on capabilities

## 📋 Pre-Deployment Checklist

### 1. Update Dependencies
```bash
# Ensure you have the modern dependencies
npm install
```

Verify `package.json` contains:
```json
{
  "dependencies": {
    "three": "^0.181.2",
    "@mediapipe/tasks-vision": "^0.10.22",
    "postprocessing": "^6.38.0"
  }
}
```

### 2. Build for Production
```bash
# Clean build
rm -rf dist/
npm run build
```

### 3. Test Locally
```bash
# Test production build
npm run preview
```

## 🌐 Aliyun ESA Configuration

### 1. ESA Configuration File
Ensure `esa.jsonc` is properly configured:
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

### 2. HTTPS Requirements
**Critical**: Camera access requires HTTPS in production.

- ✅ **Correct**: `https://your-domain.com`
- ❌ **Wrong**: `http://your-domain.com`

Configure your Aliyun ESA domain with SSL certificate.

### 3. CDN Optimization
The new version uses multiple CDN sources:
- Primary: `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm`
- Fallback: `https://unpkg.com/@mediapipe/tasks-vision@0.10.22/wasm`

## 🚀 Deployment Steps

### Step 1: Build the Project
```bash
# Install dependencies
npm install

# Create production build
npm run build
```

### Step 2: Upload to Aliyun ESA
1. **Login** to Aliyun ESA Console
2. **Create/Select** your application
3. **Upload** the entire `dist/` folder
4. **Configure** domain with HTTPS
5. **Deploy** the application

### Step 3: Verify Deployment
1. **Access** your HTTPS domain
2. **Allow** camera permissions
3. **Test** hand tracking functionality
4. **Check** browser console for any errors

## 🔧 Troubleshooting Deployment Issues

### Issue 1: Camera Access Denied
**Symptoms**: "Camera access denied" error
**Solutions**:
```javascript
// Check if HTTPS is properly configured
console.log('Protocol:', location.protocol); // Should be 'https:'
console.log('Secure Context:', window.isSecureContext); // Should be true
```

### Issue 2: MediaPipe Loading Failed
**Symptoms**: "MediaPipe initialization failed"
**Debug Steps**:
1. Open browser console
2. Check network tab for failed requests
3. Verify CDN accessibility
4. Test fallback mouse controls

**Common Fixes**:
```bash
# If CDN is blocked, the game will automatically fallback
# Check console for: "Falling back to simple video stream..."
```

### Issue 3: Performance Issues
**Symptoms**: Low FPS, stuttering
**Solutions**:
1. Press 'P' to view performance metrics
2. Check device capability detection:
```javascript
// In browser console
console.log(window.__FRUIT_GAME_PERFORMANCE_CONFIG);
```

### Issue 4: Build Errors
**Symptoms**: Build fails with dependency errors
**Solutions**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Force clean build
rm -rf dist/
npm run build
```

## 📊 Production Monitoring

### Performance Metrics
The deployed game includes built-in monitoring:
- Press **P** to toggle performance display
- Monitor FPS, frame times, and detection performance
- Automatic device capability detection

### Error Reporting
Check browser console for detailed error logs:
```javascript
// Enable verbose logging
localStorage.setItem('debug', 'true');
```

### Health Check Endpoints
The game provides several debug tools:
- `/debug-camera.html` - Camera testing utility
- Built-in camera test button
- Performance monitoring overlay

## 🔄 Updating the Deployment

### For Code Changes
```bash
# 1. Make your changes
# 2. Test locally
npm run dev

# 3. Build for production
npm run build

# 4. Upload new dist/ folder to Aliyun ESA
```

### For Dependency Updates
```bash
# Update dependencies
npm update

# Test compatibility
npm run build
npm run preview

# Deploy if tests pass
```

## 🎯 Best Practices

### 1. Performance Optimization
- The game auto-detects device capabilities
- Low-end devices get reduced quality automatically
- Monitor performance with built-in tools

### 2. Error Handling
- Always provide fallback controls
- Show user-friendly error messages
- Log detailed errors for debugging

### 3. User Experience
- Clear camera permission instructions
- Graceful degradation when features fail
- Responsive design for different screen sizes

### 4. Security
- Always use HTTPS in production
- Validate user inputs
- Handle camera permissions properly

## 📞 Support

If you encounter deployment issues:

1. **Check Console**: Browser developer tools for detailed errors
2. **Test Locally**: Ensure it works with `npm run preview`
3. **Verify HTTPS**: Camera requires secure context
4. **Check CDN**: Ensure MediaPipe models can load
5. **Performance**: Use built-in monitoring tools

## 🎉 Success Indicators

Your deployment is successful when:
- ✅ Game loads without errors
- ✅ Camera permission prompt appears
- ✅ Hand tracking works smoothly
- ✅ Fallback controls work if camera fails
- ✅ Performance metrics show good FPS
- ✅ No console errors related to MediaPipe

---

**🚀 Ready for production on Aliyun ESA!**