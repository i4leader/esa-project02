/**
 * 计分系统
 * 管理游戏分数、时间、难度等
 */
export class ScoreSystem {
    constructor() {
        this.score = 0;
        this.gameTime = 60; // 游戏时长（秒）
        this.timeRemaining = 60;
        this.isGameOver = false;
        
        // 计分规则
        this.rules = {
            fruitCut: 10,      // 切割水果得分
            bombCut: -20       // 切割炸弹扣分
        };
        
        // 回调函数
        this.onScoreChange = null;
        this.onTimeChange = null;
        this.onGameOver = null;
    }
    
    /**
     * 初始化游戏
     */
    start() {
        this.score = 0;
        this.timeRemaining = this.gameTime;
        this.isGameOver = false;
        this.notifyScoreChange();
        this.notifyTimeChange();
    }
    
    /**
     * 更新游戏时间
     */
    update(deltaTime) {
        if (this.isGameOver) return;
        
        this.timeRemaining -= deltaTime;
        
        if (this.timeRemaining <= 0) {
            this.timeRemaining = 0;
            this.endGame();
        }
        
        this.notifyTimeChange();
    }
    
    /**
     * 切割水果得分
     */
    cutFruit(fruitType) {
        if (this.isGameOver) return;
        
        this.score += this.rules.fruitCut;
        this.notifyScoreChange();
        
        // 检查游戏结束条件（分数低于0）
        if (this.score < 0) {
            this.endGame();
        }
    }
    
    /**
     * 切割炸弹扣分
     */
    cutBomb() {
        if (this.isGameOver) return;
        
        this.score += this.rules.bombCut;
        this.notifyScoreChange();
        
        // 检查游戏结束条件（分数低于0）
        if (this.score < 0) {
            this.endGame();
        }
    }
    
    /**
     * 结束游戏
     */
    endGame() {
        if (this.isGameOver) return;
        
        this.isGameOver = true;
        
        if (this.onGameOver) {
            this.onGameOver({
                score: this.score,
                timeRemaining: this.timeRemaining
            });
        }
    }
    
    /**
     * 重置游戏
     */
    reset() {
        this.score = 0;
        this.timeRemaining = this.gameTime;
        this.isGameOver = false;
        this.notifyScoreChange();
        this.notifyTimeChange();
    }
    
    /**
     * 通知分数变化
     */
    notifyScoreChange() {
        if (this.onScoreChange) {
            this.onScoreChange(this.score);
        }
    }
    
    /**
     * 通知时间变化
     */
    notifyTimeChange() {
        if (this.onTimeChange) {
            this.onTimeChange(this.timeRemaining);
        }
    }
    
    /**
     * 获取当前分数
     */
    getScore() {
        return this.score;
    }
    
    /**
     * 获取剩余时间
     */
    getTimeRemaining() {
        return this.timeRemaining;
    }
    
    /**
     * 检查游戏是否结束
     */
    getIsGameOver() {
        return this.isGameOver;
    }
}
