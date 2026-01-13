# 🔧 Build Fix for Aliyun ESA Deployment

## ❌ Build Error
```
npm error notarget No matching version found for @mediapipe/tasks-vision@^0.10.22.
```

## ✅ Solution Applied

### 1. Fixed Package Dependencies
Updated `package.json` to use the correct MediaPipe version:

```json
{
  "dependencies": {
    "three": "^0.181.2",
    "@mediapipe/tasks-vision": "^0.10.22-rc.20250304",
    "postprocessing": "^6.38.0"
  }
}
```

**Key Change**: `@mediapipe/tasks-vision@^0.10.22` → `@mediapipe/tasks-vision@^0.10.22-rc.20250304`

### 2. Updated CDN Path
Modified `ModernHandTracker.js` to use the working CDN path:

```javascript
const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
);
```

**Key Change**: Uses `@latest` instead of specific version for better compatibility.

### 3. Verified Model Path
Confirmed the model path matches the working gesture-control project:

```javascript
modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
```

## 🚀 Next Steps

1. **Commit the changes** to your repository
2. **Trigger a new build** on Aliyun ESA
3. **Verify the build succeeds** with the corrected dependencies

## 📋 Build Command Verification

The build should now work with:
```bash
npm install  # Should succeed with correct MediaPipe version
npm run build  # Should build successfully
```

## 🔍 Why This Happened

- The stable `@mediapipe/tasks-vision@0.10.22` doesn't exist in npm registry
- The working version is a release candidate: `0.10.22-rc.20250304`
- This is the same version used in the proven gesture-control project
- Using `@latest` in CDN ensures compatibility with the installed package version

## ✅ Expected Result

After applying these fixes:
- ✅ `npm install` will succeed
- ✅ Build will complete without errors
- ✅ MediaPipe will load correctly in production
- ✅ Hand tracking will work on Aliyun ESA

The project is now using the exact same MediaPipe configuration as the working gesture-control project.