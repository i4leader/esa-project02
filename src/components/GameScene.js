import * as THREE from 'three';

/**
 * 游戏场景组件
 * 使用 Three.js 实现 3D 场景、水果生成、运动轨迹、切割效果等
 */
export class GameScene {
    constructor(container, onFruitCut, onBombCut) {
        this.container = container;
        this.onFruitCut = onFruitCut;
        this.onBombCut = onBombCut;

        // 场景设置
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();

        // 游戏对象
        this.fruits = [];
        this.bombs = [];
        this.particles = [];

        // 游戏参数
        this.spawnRate = 0.4; // 初始每秒生成数量 (约2.5秒一个)
        this.fruitSpeed = 5.0;
        this.difficulty = 1.0;
        this.gameTime = 0;
        this.isPaused = true; // 游戏是否暂停
        this.lastSpawnTime = 0; // 上次生成时间

        // 水果类型
        this.fruitTypes = ['apple', 'watermelon', 'orange', 'banana', 'pineapple'];

        // 切割路径
        this.cuttingPaths = [];

        // 初始化
        this.init();
    }

    /**
     * 初始化 Three.js 场景
     */
    init() {
        // 创建场景
        this.scene = new THREE.Scene();
        // 透明背景，让摄像头画面可见
        this.scene.background = null;

        // 创建相机
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.set(0, 0, 10);
        this.camera.lookAt(0, 0, 0);

        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.container,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        // 添加光源
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        // 网格地面已移除 - 现在背景是摄像头画面

        // 窗口大小调整监听
        window.addEventListener('resize', () => this.onWindowResize());

        // 开始渲染循环
        this.animate();
    }

    /**
     * 渲染循环
     */
    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta();
        this.gameTime += deltaTime;

        // 更新难度
        this.updateDifficulty();

        // 生成水果和炸弹
        this.spawnObjects(deltaTime);

        // 更新游戏对象
        this.updateFruits(deltaTime);
        this.updateBombs(deltaTime);
        this.updateParticles(deltaTime);

        // 检测切割碰撞
        this.checkCuttingCollisions();

        // 清理超出屏幕的对象
        this.cleanupObjects();

        // 渲染场景
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * 更新游戏难度
     * 分阶段生成速率：
     * - 前20秒：每2-3秒一个 (spawnInterval = 2.5s)
     * - 中间20秒：每1.5秒一个 (spawnInterval = 1.5s)
     * - 后20秒：每1秒一个 (spawnInterval = 1s)
     */
    updateDifficulty() {
        // 根据游戏时间计算生成间隔
        if (this.gameTime < 20) {
            // 前20秒：2-3秒一个
            this.spawnInterval = 2.5;
        } else if (this.gameTime < 40) {
            // 中间20秒：1.5秒一个
            this.spawnInterval = 1.5;
        } else {
            // 后20秒：1秒一个
            this.spawnInterval = 1.0;
        }

        this.difficulty = 1.0 + this.gameTime * 0.05;
        this.fruitSpeed = 5.0 + this.gameTime * 0.05;
    }

    /**
     * 生成水果和炸弹
     * 基于时间间隔而非概率，使生成更加均匀
     */
    spawnObjects(deltaTime) {
        // 如果游戏暂停，不生成物体
        if (this.isPaused) return;

        // 初始化 spawnInterval
        if (!this.spawnInterval) {
            this.spawnInterval = 2.5;
        }

        // 检查是否到了生成时间
        if (this.gameTime - this.lastSpawnTime >= this.spawnInterval) {
            this.lastSpawnTime = this.gameTime;

            // 80% 概率生成水果，20% 概率生成炸弹
            if (Math.random() < 0.8) {
                this.spawnFruit();
            } else {
                this.spawnBomb();
            }
        }
    }

    /**
     * 生成水果
     * 从顶部或左上/右上角生成，以直线或抛物线方式掉落
     */
    spawnFruit() {
        const fruitType = this.fruitTypes[Math.floor(Math.random() * this.fruitTypes.length)];
        const geometry = this.createFruitGeometry(fruitType);
        const material = this.createFruitMaterial(fruitType);
        const mesh = new THREE.Mesh(geometry, material);

        // 随机选择生成位置类型：0-顶部中间，1-左上角，2-右上角
        const spawnType = Math.floor(Math.random() * 3);
        const speed = this.fruitSpeed * (0.8 + Math.random() * 0.4);

        let velocity;

        if (spawnType === 0) {
            // 从顶部中间区域直线下落
            mesh.position.set(
                (Math.random() - 0.5) * 8, // X: -4 到 4
                8,                          // Y: 顶部
                (Math.random() - 0.5) * 2   // Z: 略微随机
            );
            // 主要向下的速度，略微水平偏移
            velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 1.5, // 小幅水平偏移
                -speed * 0.6,                 // 向下
                0
            );
        } else if (spawnType === 1) {
            // 从左上角以抛物线方式掉落
            mesh.position.set(
                -7,                          // X: 左边
                6 + Math.random() * 2,       // Y: 顶部附近
                (Math.random() - 0.5) * 2
            );
            // 向右下方的抛物线初始速度
            velocity = new THREE.Vector3(
                speed * 0.4 + Math.random() * 0.3, // 向右
                speed * 0.2,                        // 初始向上（抛物线顶点）
                0
            );
        } else {
            // 从右上角以抛物线方式掉落
            mesh.position.set(
                7,                           // X: 右边
                6 + Math.random() * 2,       // Y: 顶部附近
                (Math.random() - 0.5) * 2
            );
            // 向左下方的抛物线初始速度
            velocity = new THREE.Vector3(
                -(speed * 0.4 + Math.random() * 0.3), // 向左
                speed * 0.2,                           // 初始向上（抛物线顶点）
                0
            );
        }

        mesh.userData = {
            type: 'fruit',
            fruitType: fruitType,
            velocity: velocity,
            angularVelocity: new THREE.Vector3(
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3
            ),
            isCut: false,
            radius: 0.6,
            gravity: 4.0 // 重力加速度
        };

        this.scene.add(mesh);
        this.fruits.push(mesh);
    }

    /**
     * 生成炸弹
     * 与水果相同的生成逻辑，从顶部或左上/右上角生成
     */
    spawnBomb() {
        const geometry = new THREE.SphereGeometry(0.8, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x000000,
            emissive: 0x333333
        });
        const mesh = new THREE.Mesh(geometry, material);

        // 随机选择生成位置类型：0-顶部中间，1-左上角，2-右上角
        const spawnType = Math.floor(Math.random() * 3);
        const speed = this.fruitSpeed * (0.8 + Math.random() * 0.4);

        let velocity;

        if (spawnType === 0) {
            // 从顶部中间区域直线下落
            mesh.position.set(
                (Math.random() - 0.5) * 8,
                8,
                (Math.random() - 0.5) * 2
            );
            velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 1.5,
                -speed * 0.6,
                0
            );
        } else if (spawnType === 1) {
            // 从左上角以抛物线方式掉落
            mesh.position.set(
                -7,
                6 + Math.random() * 2,
                (Math.random() - 0.5) * 2
            );
            velocity = new THREE.Vector3(
                speed * 0.4 + Math.random() * 0.3,
                speed * 0.2,
                0
            );
        } else {
            // 从右上角以抛物线方式掉落
            mesh.position.set(
                7,
                6 + Math.random() * 2,
                (Math.random() - 0.5) * 2
            );
            velocity = new THREE.Vector3(
                -(speed * 0.4 + Math.random() * 0.3),
                speed * 0.2,
                0
            );
        }

        mesh.userData = {
            type: 'bomb',
            velocity: velocity,
            angularVelocity: new THREE.Vector3(
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3
            ),
            isCut: false,
            radius: 0.8,
            gravity: 4.0
        };

        this.scene.add(mesh);
        this.bombs.push(mesh);
    }

    /**
     * 创建水果几何体
     * 水果放大2倍，使特征更明显
     */
    createFruitGeometry(fruitType) {
        switch (fruitType) {
            case 'apple':
                return new THREE.SphereGeometry(0.6, 32, 32); // 原0.3，放大2倍
            case 'watermelon':
                return new THREE.SphereGeometry(0.8, 32, 32); // 原0.4，放大2倍
            case 'orange':
                return new THREE.SphereGeometry(0.5, 32, 32); // 原0.25，放大2倍
            case 'banana':
                return new THREE.ConeGeometry(0.4, 1.2, 16); // 放大2倍
            case 'pineapple':
                return new THREE.CylinderGeometry(0.5, 0.6, 1.0, 16); // 放大2倍
            default:
                return new THREE.SphereGeometry(0.6, 32, 32);
        }
    }

    /**
     * 创建水果材质
     */
    createFruitMaterial(fruitType) {
        const colors = {
            apple: 0xFF0000,
            watermelon: 0x90EE90,
            orange: 0xFFA500,
            banana: 0xFFFF00,
            pineapple: 0xFFD700
        };

        return new THREE.MeshPhongMaterial({
            color: colors[fruitType] || 0xFF0000,
            shininess: 100
        });
    }

    /**
     * 更新水果位置
     * 添加重力效果，使抛物线运动更自然
     */
    updateFruits(deltaTime) {
        this.fruits.forEach((fruit, index) => {
            if (fruit.userData.isCut) return;

            // 应用重力到速度（Y轴向下）
            if (fruit.userData.gravity) {
                fruit.userData.velocity.y -= fruit.userData.gravity * deltaTime;
            }

            // 更新位置
            fruit.position.add(
                fruit.userData.velocity.clone().multiplyScalar(deltaTime)
            );

            // 更新旋转
            fruit.rotation.x += fruit.userData.angularVelocity.x * deltaTime;
            fruit.rotation.y += fruit.userData.angularVelocity.y * deltaTime;
            fruit.rotation.z += fruit.userData.angularVelocity.z * deltaTime;
        });
    }

    /**
     * 更新炸弹位置
     * 添加重力效果
     */
    updateBombs(deltaTime) {
        this.bombs.forEach((bomb, index) => {
            if (bomb.userData.isCut) return;

            // 应用重力到速度（Y轴向下）
            if (bomb.userData.gravity) {
                bomb.userData.velocity.y -= bomb.userData.gravity * deltaTime;
            }

            bomb.position.add(
                bomb.userData.velocity.clone().multiplyScalar(deltaTime)
            );

            bomb.rotation.x += bomb.userData.angularVelocity.x * deltaTime;
            bomb.rotation.y += bomb.userData.angularVelocity.y * deltaTime;
            bomb.rotation.z += bomb.userData.angularVelocity.z * deltaTime;

            // 炸弹闪烁效果
            const time = this.gameTime * 5;
            bomb.material.emissive.setHex(
                Math.sin(time + index) > 0 ? 0x666666 : 0x000000
            );
        });
    }

    /**
     * 更新粒子效果
     */
    updateParticles(deltaTime) {
        this.particles.forEach((particle, index) => {
            particle.position.add(
                particle.userData.velocity.clone().multiplyScalar(deltaTime)
            );
            particle.userData.life -= deltaTime;
            particle.material.opacity = particle.userData.life / particle.userData.maxLife;

            if (particle.userData.life <= 0) {
                this.scene.remove(particle);
                this.particles.splice(index, 1);
            }
        });
    }

    /**
     * 检测切割碰撞
     */
    checkCuttingCollisions() {
        if (this.cuttingPaths.length === 0) return;

        // 检查水果碰撞
        this.fruits.forEach(fruit => {
            if (fruit.userData.isCut) return;

            const worldPos = fruit.position.clone();
            const screenPos = this.worldToScreen(worldPos);

            if (this.isPointOnPath(screenPos, this.cuttingPaths)) {
                this.cutFruit(fruit);
            }
        });

        // 检查炸弹碰撞
        this.bombs.forEach(bomb => {
            if (bomb.userData.isCut) return;

            const worldPos = bomb.position.clone();
            const screenPos = this.worldToScreen(worldPos);

            if (this.isPointOnPath(screenPos, this.cuttingPaths)) {
                this.cutBomb(bomb);
            }
        });
    }

    /**
     * 世界坐标转屏幕坐标
     */
    worldToScreen(worldPos) {
        const vector = worldPos.clone();
        vector.project(this.camera);

        const width = this.renderer.domElement.clientWidth;
        const height = this.renderer.domElement.clientHeight;

        return {
            x: (vector.x + 1) * width / 2,
            y: (-vector.y + 1) * height / 2
        };
    }

    /**
     * 检查点是否在切割路径上
     * 优化：只检测最近的手势位置，避免拖影误切
     */
    isPointOnPath(point, paths) {
        for (const path of paths) {
            // 只检测路径的最后几个点（最近的手势位置），而不是整个拖影
            const recentPointsCount = Math.min(5, path.points.length); // 只检测最近5个点
            const startIndex = Math.max(0, path.points.length - recentPointsCount);
            
            for (let i = startIndex; i < path.points.length - 1; i++) {
                const p1 = path.points[i];
                const p2 = path.points[i + 1];

                const distance = this.pointToLineDistance(
                    point,
                    p1,
                    p2
                );

                // 缩小检测阈值，让切割更精确
                if (distance < 20) { // 从30减少到20像素
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 计算点到线段的距离
     */
    pointToLineDistance(point, lineStart, lineEnd) {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;

        if (lenSq !== 0) {
            param = dot / lenSq;
        }

        let xx, yy;

        if (param < 0) {
            xx = lineStart.x;
            yy = lineStart.y;
        } else if (param > 1) {
            xx = lineEnd.x;
            yy = lineEnd.y;
        } else {
            xx = lineStart.x + param * C;
            yy = lineStart.y + param * D;
        }

        const dx = point.x - xx;
        const dy = point.y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * 切割水果
     */
    cutFruit(fruit) {
        if (fruit.userData.isCut) return;

        fruit.userData.isCut = true;

        // 创建粒子爆炸效果
        this.createParticleExplosion(fruit.position, fruit.material.color);

        // 移除水果
        this.scene.remove(fruit);
        const index = this.fruits.indexOf(fruit);
        if (index > -1) {
            this.fruits.splice(index, 1);
        }

        // 通知外部
        if (this.onFruitCut) {
            this.onFruitCut(fruit.userData.fruitType);
        }
    }

    /**
     * 切割炸弹
     */
    cutBomb(bomb) {
        if (bomb.userData.isCut) return;

        bomb.userData.isCut = true;

        // 创建爆炸效果
        this.createBombExplosion(bomb.position);

        // 移除炸弹
        this.scene.remove(bomb);
        const index = this.bombs.indexOf(bomb);
        if (index > -1) {
            this.bombs.splice(index, 1);
        }

        // 通知外部
        if (this.onBombCut) {
            this.onBombCut();
        }
    }

    /**
     * 创建粒子爆炸效果
     */
    createParticleExplosion(position, color) {
        const particleCount = 20;

        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.05, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 1
            });
            const particle = new THREE.Mesh(geometry, material);

            particle.position.copy(position);

            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 2 + Math.random() * 3;
            particle.userData.velocity = new THREE.Vector3(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed + Math.random() * 2,
                (Math.random() - 0.5) * speed
            );

            particle.userData.life = 1.0;
            particle.userData.maxLife = 1.0;

            this.scene.add(particle);
            this.particles.push(particle);
        }
    }

    /**
     * 创建炸弹爆炸效果
     */
    createBombExplosion(position) {
        const particleCount = 30;

        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.08, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: 0xFF4500,
                transparent: true,
                opacity: 1
            });
            const particle = new THREE.Mesh(geometry, material);

            particle.position.copy(position);

            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 3 + Math.random() * 4;
            particle.userData.velocity = new THREE.Vector3(
                Math.cos(angle) * speed,
                Math.sin(angle) * speed + Math.random() * 2,
                (Math.random() - 0.5) * speed
            );

            particle.userData.life = 1.5;
            particle.userData.maxLife = 1.5;

            this.scene.add(particle);
            this.particles.push(particle);
        }
    }

    /**
     * 清理超出屏幕的对象
     */
    cleanupObjects() {
        // 清理水果
        this.fruits = this.fruits.filter(fruit => {
            if (fruit.position.y < -10) {
                this.scene.remove(fruit);
                return false;
            }
            return true;
        });

        // 清理炸弹
        this.bombs = this.bombs.filter(bomb => {
            if (bomb.position.y < -10) {
                this.scene.remove(bomb);
                return false;
            }
            return true;
        });
    }

    /**
     * 更新切割路径
     */
    updateCuttingPaths(paths) {
        this.cuttingPaths = paths;
    }

    /**
     * 窗口大小调整
     */
    onWindowResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    /**
     * 重置游戏
     */
    reset() {
        // 清理所有对象
        this.fruits.forEach(fruit => this.scene.remove(fruit));
        this.bombs.forEach(bomb => this.scene.remove(bomb));
        this.particles.forEach(particle => this.scene.remove(particle));

        this.fruits = [];
        this.bombs = [];
        this.particles = [];

        this.gameTime = 0;
        this.difficulty = 1.0;
        this.spawnRate = 0.4;
        this.spawnInterval = 2.5;
        this.fruitSpeed = 5.0;
        this.lastSpawnTime = 0;
        this.isPaused = true; // 重置时暂停，等待开始按钮
    }

    /**
     * 暂停/继续
     */
    setPaused(paused) {
        this.isPaused = paused;
        if (paused) {
            this.clock.stop();
        } else {
            this.clock.start();
            // 重置生成时间，防止暂停后立即生成
            this.lastSpawnTime = this.gameTime;
        }
    }
}
