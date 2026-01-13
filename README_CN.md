# 🍉 水果忍者 - 现代手势追踪游戏

一款使用摄像头手势控制的水果切割游戏，基于 Three.js 和 MediaPipe 构建。**现已针对阿里云 ESA 部署进行优化！**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Three.js](https://img.shields.io/badge/Three.js-0.181.2-green.svg)
![MediaPipe](https://img.shields.io/badge/MediaPipe-0.10.22--rc.20250304-orange.svg)

**🌐 Language / 语言**: [English](README.md) | **中文**

## ✨ 最新更新 - v2.0 (阿里云 ESA 就绪)

### 🚀 重大改进
- **现代化 MediaPipe**: 升级到 `@mediapipe/tasks-vision` v0.10.22-rc.20250304，提升可靠性
- **性能优化**: 设备自适应配置，确保流畅游戏体验
- **增强错误处理**: 为生产环境提供更好的回退机制
- **荧光轨迹特效**: 美丽的霓虹风格手势追踪视觉效果
- **生产就绪**: 专门针对阿里云 ESA 部署进行优化

### 🔧 技术升级
- **ModernHandTracker**: 基于经过验证的 gesture-control 模式的新架构
- **性能监控**: 实时 FPS 和性能指标（按 'P' 键）
- **自适应质量**: 根据设备性能自动调整
- **更好的回退**: 摄像头失败时的鼠标/触摸控制

## 🎮 游戏特色

### 手势控制
- **✋ 切割水果**: 移动双手切割飞来的水果
- **🚫 避开炸弹**: 不要碰到黑色炸弹！
- **⏱️ 时间挑战**: 60秒内获得最高分数
- **🎯 渐进难度**: 生成速度随时间增加

### 视觉效果
- **🌈 霓虹轨迹**: 荧光手势追踪轨迹
- **💥 粒子特效**: 爆炸式水果切割动画
- **🎨 3D 图形**: 美丽的 Three.js 渲染水果和特效
- **📊 实时统计**: 系统信息和性能监控

## 🚀 快速开始

### 前置要求
- Node.js 16+
- 现代浏览器（推荐 Chrome/Edge/Firefox）
- 摄像头设备
- **HTTPS 连接**（摄像头访问必需）

### 安装和开发
```bash
# 克隆仓库
git clone <repository-url>
cd esa-project02

# 安装依赖
npm install

# 启动开发服务器
npm run dev
# 访问 http://localhost:3000
```

### 生产构建
```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 🌐 阿里云 ESA 部署

### 为什么现在能在阿里云 ESA 上运行
1. **现代化 MediaPipe**: 使用最新的 `@mediapipe/tasks-vision` 而非已弃用的包
2. **CDN 可靠性**: 模型加载的多个回退 CDN 源
3. **HTTPS 就绪**: 为生产环境正确处理安全上下文
4. **错误恢复**: MediaPipe 加载失败时的优雅回退
5. **性能自适应**: 自动适应服务器环境

### 部署配置
项目包含 `esa.jsonc` 配置：
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

### 部署步骤
1. **构建项目**: `npm run build`
2. **上传到阿里云 ESA**: 上传 `dist/` 文件夹
3. **配置 HTTPS**: 确保域名使用 HTTPS
4. **测试摄像头访问**: 使用内置调试工具

## 🎯 游戏玩法

### 开始游戏
1. **允许摄像头访问**: 在提示时授予权限
2. **手部定位**: 将双手放在摄像头前
3. **开始游戏**: 将手悬停在"START GAME"按钮上3秒
4. **切割水果**: 移动双手切割飞来的水果
5. **避开炸弹**: 不要碰到黑色球体！

### 控制方式
- **手势**: 主要控制方式
- **鼠标/触摸**: 摄像头不可用时的回退方式
- **空格键**: 暂停/继续游戏
- **P键**: 切换性能监控

### 计分规则
- **🍎 水果**: 每个 +10 分
- **💣 炸弹**: 每个 -20 分
- **⏱️ 时间奖励**: 快速切割获得更高分数

## 🛠️ 技术架构

### 现代化组件
```
src/
├── components/
│   ├── ModernHandTracker.js    # 新的 MediaPipe 实现
│   ├── TrailRenderer.js        # 荧光轨迹特效
│   ├── GameScene.js           # Three.js 游戏逻辑
│   └── ScoreSystem.js         # 游戏计分
├── config/
│   └── performance.js         # 设备自适应设置
└── utils/
    ├── SystemInfo.js          # 实时系统统计
    └── AudioManager.js        # 音效管理
```

### 性能优化
游戏自动检测设备性能并调整：

| 设备类型 | 检测帧率 | 粒子数 | 目标帧率 | 后处理 |
|----------|----------|--------|----------|--------|
| 低端     | 20fps    | 15     | 30fps    | 禁用   |
| 中端     | 30fps    | 25     | 60fps    | 启用   |
| 高端     | 60fps    | 30     | 60fps    | 全质量 |

## 🔧 故障排除

### 摄像头问题
**问题**: 摄像头在阿里云 ESA 上不工作
**解决方案**:
1. 确保域名启用了 HTTPS
2. 检查浏览器摄像头访问权限
3. 尝试不同浏览器（推荐 Chrome）
4. 使用内置摄像头调试工具
5. 检查浏览器控制台的详细错误

### 性能问题
**问题**: 低帧率或卡顿
**解决方案**:
1. 游戏会根据设备自动调整质量
2. 按 'P' 查看性能指标
3. 关闭其他使用 GPU 的应用程序
4. 尝试减小浏览器窗口大小

### MediaPipe 加载问题
**问题**: "MediaPipe 初始化失败"
**解决方案**:
1. 检查网络连接
2. 验证 CDN 访问（jsdelivr.net, unpkg.com）
3. 游戏将回退到鼠标/触摸控制
4. 刷新页面重试初始化

## 🎨 自定义设置

### 调整性能
编辑 `src/config/performance.js` 来修改：
- 检测帧率
- 粒子数量
- 质量预设
- 设备性能阈值

### 视觉效果
修改 `src/components/TrailRenderer.js` 来调整：
- 轨迹颜色和特效
- 发光强度
- 轨迹长度和淡化

### 游戏机制
更新 `src/components/GameScene.js` 来调整：
- 水果生成速率
- 难度递增
- 碰撞检测灵敏度

## 📊 性能监控

游戏过程中按 **P** 键查看：
- 实时 FPS
- 帧时间分解
- 手势检测性能
- 游戏更新时间
- 渲染性能

## 🤝 贡献

1. Fork 仓库
2. 创建功能分支: `git checkout -b feature/amazing-feature`
3. 提交更改: `git commit -m 'Add amazing feature'`
4. 推送到分支: `git push origin feature/amazing-feature`
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关项目

- [gesture-control](../gesture-control) - 本项目基于的经过验证的架构
- [MediaPipe](https://ai.google.dev/edge/mediapipe) - 手势追踪技术
- [Three.js](https://threejs.org/) - 3D 图形库

---

### 声明
“本项目由阿里云ESA提供加速、计算和保护”
![Aliyun ESA Pages](/public/aliyun.png)
