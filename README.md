# Fruit Ninja - Camera Gesture Controlled Game with Three.js + Mediapipe

[🇨🇳 中文版](#中文版) | [🇬🇧 English](#english-version)

---

# English Version

## Project Overview

This is a gesture-controlled fruit cutting game developed using Three.js and Mediapipe. Players use webcam-captured hand gestures to slice flying fruits on screen and earn points while avoiding bombs. The project runs in modern browsers and is deployed on Alibaba Cloud ESA platform for high availability and elastic scaling.

## Features

### 1. Core Game Features

#### Camera Gesture Recognition
- Uses Mediapipe to capture player hand movements in real-time, detecting both left and right hands
- Both hands act as lightsabers, generating cutting paths through gesture trails to slice fruits or bombs

#### Fruit & Bomb Logic
- Randomly generates fruits (apples, watermelons, oranges, bananas, pineapples, etc.) and bombs
- Fruits and bombs fly in from the top or sides with parabolic or linear trajectories
- Slicing fruits creates particle explosion effects and adds points; slicing bombs triggers explosion effects and deducts points

#### Scoring System
- **Score Rules**:
  - Slice fruit: +10 points
  - Slice bomb: -20 points
- **Real-time score display**: Score shown in top-right corner
- **Dynamic difficulty**: Spawn rate and speed increase over time
- **Game over conditions**: Score drops below 0, or 60 seconds elapsed

### 2. Interface & Interaction

#### Main Interface
- **Top-left**: System info (resolution, FPS, browser, camera status)
- **Top-right**: Real-time score and timer
- **Center**: Game scene (fruits, bombs, hand trails)

#### Start/Pause/End Screens
- Game shows "Start Game" button - hold hand over button for 3 seconds to begin
- Press SPACE to pause/resume during gameplay
- Game over screen shows final score and "Play Again" button

#### Gesture Trail Visualization
- Hand gesture trails displayed as glowing lightsaber effects for enhanced feedback

#### Sound Effects & Visual Effects
- Cutting sound and particle explosion when slicing fruits
- Explosion sound and screen shake when slicing bombs
- Background music toggle support

### 3. Tech Stack & Platform

#### Core Technologies
- **Three.js**: 3D scene rendering, animations, and particle systems
- **Mediapipe**: Hand gesture recognition and tracking
- **JavaScript/ES6+**: Game logic and interactions
- **HTML5 + CSS3**: Game interface
- **Vite**: Build tool and dev server

#### Deployment
- Deployed on Alibaba Cloud ESA (Edge Serverless Application) platform

#### Browser Support
- Modern browsers (Chrome, Edge, Firefox, Safari) latest versions
- Optimized for 60FPS at 1080p resolution

### 4. System Requirements

#### Performance
- Smooth gameplay at 60FPS
- Hand tracking latency under 100ms

#### Compatibility
- Desktop and mobile devices supported
- Touch gestures as fallback on mobile

#### Security
- Camera permission requires explicit user consent
- HTTPS protocol for data transmission

## Quick Start

### 1. Prerequisites
- Node.js >= 16.x installed

### 2. Clone Repository
```bash
git clone https://github.com/i4leader/esa-project02
cd esa-project02
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Locally
```bash
npm run dev
```

Open browser and visit `http://localhost:3000`

**Note**: First run requires camera permission.

### 5. Build for Production
```bash
npm run build
```

Output will be in `dist` directory.

## How to Play

1. **Start Game**: Hold your hand over the "Start Game" button for 3 seconds
2. **Slice Fruits**: Move your hand across the screen to slice flying fruits
3. **Avoid Bombs**: Stay away from black bombs - slicing them costs points!
4. **Pause Game**: Press SPACE to pause/resume
5. **Audio Control**: Click the audio button in bottom-right to toggle music

## License

This project is open source under the MIT License.

## Contributing

Issues and Pull Requests are welcome!

---

# 中文版

## 项目简介

这是一个使用 Three.js 和 Mediapipe 技术栈开发的基于摄像头手势交互的切水果游戏。玩家通过摄像头捕捉手势动作，在屏幕中切割飞出的水果以获得分数，同时避免切到炸弹。项目支持现代浏览器运行，并部署在阿里云 ESA 平台，确保高可用性和弹性扩展。

## 功能概述

### 1. 游戏核心功能

#### 摄像头手势识别
- 使用 Mediapipe 捕捉玩家的手部动作，实时识别左手和右手
- 左手和右手均模拟为光剑，玩家通过手势轨迹生成切割路径，用于切割屏幕中的水果或炸弹

#### 水果与炸弹逻辑
- 随机生成水果（如苹果、西瓜、橙子、香蕉、菠萝等）和炸弹
- 水果和炸弹以抛物线或直线轨迹从屏幕顶部或侧边飞入，未被切割时从屏幕下方飞出
- 切割水果时，水果分裂为粒子效果并加分；切割炸弹时，触发爆炸特效并扣分

#### 游戏计分系统
- **得分规则**：
  - 切割水果：+10 分
  - 切割炸弹：-20 分
- **实时分数显示**：分数信息显示在屏幕右上角
- **游戏难度动态调整**：随游戏时间增加，水果和炸弹的生成速度、数量，以及飞行速度逐渐提升
- **游戏结束条件**：玩家分数低于 0 时，或 60 秒时间结束，游戏结束

### 2. 界面与交互

#### 主界面
- **左上角**：系统信息（分辨率、帧率、浏览器版本、摄像头状态）
- **右上角**：实时分数
- **中心区域**：游戏场景（水果、炸弹、手势轨迹等）

#### 开始/暂停/结束界面
- 游戏启动时显示"开始游戏"按钮，玩家的手在开始按钮上停顿 3 秒代表游戏开始
- 游戏过程中按下空格键可暂停/继续游戏
- 游戏结束后显示得分统计和"重新开始"按钮

#### 手势轨迹可视化
- 玩家手势轨迹在屏幕上以荧光轨迹线形式可视化，增强交互反馈

#### 音效与特效
- 切割水果时，播放切割音效并触发粒子爆炸特效
- 切割炸弹时，播放爆炸音效并触发屏幕震动效果
- 游戏背景音乐支持开关功能

### 3. 技术栈与平台

#### 核心技术栈
- **Three.js**：实现 3D 场景渲染、动画效果和粒子系统
- **Mediapipe**：实现手势识别和手部动作捕捉
- **JavaScript/ES6+**：实现游戏逻辑和交互
- **HTML5 + CSS3**：构建游戏界面
- **Vite**：构建工具和开发服务器

#### 部署平台
- 部署到阿里云 ESA（Elastic Serverless Application）平台，支持高可用性和弹性扩展

#### 浏览器支持
- 支持现代主流浏览器（Chrome、Edge、Firefox、Safari）最新版本
- 优化性能以确保在 1080p 分辨率下达到 60FPS

### 4. 系统需求

#### 性能要求
- 游戏运行流畅，帧率稳定在 60FPS
- 摄像头手势识别延迟低于 100ms，确保实时响应

#### 兼容性要求
- 支持桌面端和移动端设备，优先优化桌面端体验
- 在移动端设备上，支持触摸屏手势操作作为备用交互方式

#### 安全性要求
- 确保摄像头权限使用安全，用户需明确授权后方可启用摄像头
- 数据传输使用 HTTPS 协议，防止信息泄露

#### 可扩展性
- 游戏代码结构清晰，支持后续新增功能（如新水果类型、新玩法模式等）
- 游戏资源（如水果模型、音效）支持动态加载，便于更新

## 项目结构

```
├── src
│   ├── components            # 游戏核心组件
│   │   ├── GameScene.js      # 游戏场景逻辑
│   │   ├── HandTracking.js   # 手势识别逻辑
│   │   └── ScoreSystem.js    # 计分系统
│   ├── utils                 # 工具函数
│   │   ├── AudioManager.js   # 音效管理器
│   │   └── SystemInfo.js     # 系统信息管理器
│   └── index.js              # 项目入口文件
├── public
│   ├── index.html            # HTML 文件
│   ├── styles                # 样式文件
│   │   └── main.css          # 主样式文件
│   └── favicon.ico           # 网站图标
├── README.md                 # 项目说明文档
├── package.json              # 项目依赖配置
├── vite.config.js            # Vite 配置文件
└── .gitignore                # Git 忽略文件
```

## 快速开始

### 1. 环境准备

- 安装 Node.js（推荐版本 >= 16.x）
- 注册阿里云账号，并开通 ESA 服务（可选，用于部署）

### 2. 克隆项目

```bash
git clone https://github.com/i4leader/esa-project02
cd esa-project02
```

### 3. 安装依赖

```bash
npm install
```

### 4. 本地运行

```bash
npm run dev
```

打开浏览器，访问 `http://localhost:3000` 查看效果。

**注意**：首次运行需要允许浏览器访问摄像头权限。

### 5. 构建生产版本

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

### 6. 部署到阿里云 ESA

配置 `.env` 文件中的阿里云 ESA 部署信息，然后执行：

```bash
npm run deploy
```

## 游戏操作说明

1. **开始游戏**：将手放在"开始游戏"按钮上停留 3 秒
2. **切割水果**：使用手势在屏幕上移动，切割飞出的水果
3. **避免炸弹**：注意避开黑色的炸弹，切割炸弹会扣分
4. **暂停游戏**：按空格键暂停/继续游戏
5. **音效控制**：点击右下角的音效按钮切换背景音乐

## 项目开发计划

### 阶段 1：需求分析与环境搭建 ✅
- 明确功能需求与技术方案
- 搭建阿里云 ESA 环境，配置部署流程

### 阶段 2：功能开发 ✅
- **基础功能**
  - 集成 Mediapipe 实现手势识别
  - 使用 Three.js 构建 3D 场景，加载水果模型和粒子效果
  - 实现水果和炸弹的随机生成与运动轨迹
  - 实现手势切割逻辑与分数计算
- **界面与交互**
  - 开发主界面、系统信息显示、分数显示
  - 添加手势轨迹可视化和音效特效

### 阶段 3：功能优化与扩展（计划中）
- 引入更多水果类型、特殊道具和关卡模式
- 支持 VR 设备，提升沉浸式游戏体验
- 添加排行榜功能，显示玩家分数排名

## 技术实现细节

### 手势识别
- 使用 Mediapipe Hands 模型进行实时手部追踪
- 识别食指和中指指尖位置，计算光剑位置
- 生成手势轨迹用于碰撞检测

### 3D 场景渲染
- 使用 Three.js 创建 3D 场景和相机
- 实现水果和炸弹的物理运动（抛物线轨迹）
- 使用粒子系统实现切割和爆炸特效

### 碰撞检测
- 将 3D 世界坐标转换为屏幕坐标
- 使用点到线段距离算法检测切割碰撞
- 实时更新切割路径进行碰撞检测

## 许可证

本项目基于 MIT License 开源，允许自由使用、修改和分发。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题或建议，请通过 GitHub Issues 联系。
