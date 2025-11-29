import { CONFIG } from '../config.js';
import { Triangle } from '../entities/Triangle.js';
import { Rectangle } from '../entities/Rectangle.js';
import { RectangleLarge } from '../entities/RectangleLarge.js';
import { Finish } from '../entities/Finish.js';
import { level1 } from './level1.js';

// Conversion mètres -> pixels
const metersToPixels = (meters) => meters * CONFIG.PIXELS_PER_METER;

export class LevelManager {
    constructor() {
        this.levels = [level1];
        this.currentLevelIndex = 0;
        this.currentLevel = null;
        this.obstaclesSpawned = [];
    }
    
    loadLevel(levelIndex = 0) {
        if (levelIndex < 0 || levelIndex >= this.levels.length) {
            console.error('Niveau invalide');
            return null;
        }
        
        this.currentLevelIndex = levelIndex;
        this.currentLevel = this.levels[levelIndex];
        this.obstaclesSpawned = [];
        
        return this.currentLevel;
    }
    
    getCurrentLevel() {
        return this.currentLevel;
    }
    
    /**
     * Crée les entités de niveau (obstacles + éléments spéciaux comme Finish).
     * Supporte: triangle, rectangle, rectangleLarge (avec obstacles portés), finish.
     */
    createObstaclesForLevel() {
        if (!this.currentLevel) return [];
        
        const obstacles = [];
        
        for (const obstacleData of this.currentLevel.obstacles) {
            const obstacle = this.createObstacle(obstacleData);
            if (obstacle) {
                obstacles.push(obstacle);
            }
        }
        
        return obstacles;
    }
    
    /**
     * Crée une entité de niveau à partir de ses données.
     * Toutes les dimensions (x, width, height, relativeX) sont en mètres, converties en pixels ici.
     * @param {Object} entityData - { type, x, width, height, carried? } (tout en mètres)
     */
    createObstacle(entityData) {
        const { type } = entityData;
        // Convertir toutes les dimensions de mètres en pixels
        const xPixels = metersToPixels(entityData.x);
        const widthPixels = metersToPixels(entityData.width);
        const heightPixels = metersToPixels(entityData.height);
        
        if (type === 'triangle') {
            return new Triangle(xPixels, widthPixels, heightPixels);
        } else if (type === 'rectangle') {
            return new Rectangle(xPixels, widthPixels, heightPixels);
        } else if (type === 'rectangleLarge') {
            // Les obstacles portés sont définis dans entityData.carried
            // Format: [{ type, relativeX, width, height }, ...] (tout en mètres)
            // Convertir toutes les dimensions en pixels
            const carriedObstacles = (entityData.carried || []).map(c => ({
                type: c.type,
                relativeX: metersToPixels(c.relativeX),
                width: metersToPixels(c.width),
                height: metersToPixels(c.height)
            }));
            return new RectangleLarge(xPixels, widthPixels, heightPixels, carriedObstacles);
        } else if (type === 'finish') {
            // Large ligne verticale de fin de niveau
            return new Finish(xPixels, widthPixels || 20);
        }
        
        return null;
    }
    
    getLevelName() {
        return this.currentLevel ? this.currentLevel.name : 'Aucun niveau';
    }
    
    getTotalObstacles() {
        return this.currentLevel ? this.currentLevel.obstacles.length : 0;
    }
    
    hasNextLevel() {
        return this.currentLevelIndex < this.levels.length - 1;
    }
    
    loadNextLevel() {
        if (this.hasNextLevel()) {
            return this.loadLevel(this.currentLevelIndex + 1);
        }
        return null;
    }
}
