import { CONFIG } from '../config.js';
import { Triangle } from '../entities/Triangle.js';
import { Rectangle } from '../entities/Rectangle.js';
import { RectangleLarge } from '../entities/RectangleLarge.js';
import { PlateformeAir } from '../entities/PlateformeAir.js';
import { Finish } from '../entities/Finish.js';
import { level1 } from './level1.js';
import { level2 } from './level2.js';
import { level3 } from './level3.js';

// Conversion mètres -> unités logiques
const metersToUnits = (meters) => meters * CONFIG.UNITS_PER_METER;

export class LevelManager {
    constructor() {
        this.levels = [level1, level2, level3];
        this.currentLevelIndex = 0;
        this.currentLevel = null;
        this.obstaclesSpawned = [];
    }
    
    /**
     * Retourne la liste des niveaux disponibles avec leur nom.
     */
    getLevelsList() {
        return this.levels.map((level, index) => ({
            index,
            name: level.name
        }));
    }
    
    /**
     * Retourne le nombre total de niveaux.
     */
    getLevelsCount() {
        return this.levels.length;
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
     * Toutes les dimensions (x, width, height, relativeX) sont en mètres, converties en unités logiques ici.
     * @param {Object} entityData - { type, x, width, height, carried? } (tout en mètres)
     */
    createObstacle(entityData) {
        const { type } = entityData;
        // Convertir toutes les dimensions de mètres en unités logiques
        const xUnits = metersToUnits(entityData.x);
        const widthUnits = metersToUnits(entityData.width);
        const heightUnits = metersToUnits(entityData.height);
        
        if (type === 'triangle') {
            return new Triangle(xUnits, widthUnits, heightUnits);
        } else if (type === 'rectangle') {
            return new Rectangle(xUnits, widthUnits, heightUnits);
        } else if (type === 'rectangleLarge') {
            // Les obstacles portés sont définis dans entityData.carried
            // Format: [{ type, relativeX, width, height }, ...] (tout en mètres)
            // Convertir toutes les dimensions en unités logiques
            const carriedObstacles = (entityData.carried || []).map(c => ({
                type: c.type,
                relativeX: metersToUnits(c.relativeX),
                width: metersToUnits(c.width),
                height: metersToUnits(c.height)
            }));
            return new RectangleLarge(xUnits, widthUnits, heightUnits, carriedObstacles);
        } else if (type === 'plateformeAir') {
            // Plateforme flottante dans les airs
            // yUnits est la hauteur depuis le SOL (en mètres), on la convertit en position Y depuis le haut
            const yFromGround = metersToUnits(entityData.y || 0);
            const yUnits = CONFIG.WORLD_HEIGHT - CONFIG.GROUND_HEIGHT - yFromGround - heightUnits;
            
            // Les obstacles portés sont définis dans entityData.carried
            const carriedObstacles = (entityData.carried || []).map(c => ({
                type: c.type,
                relativeX: metersToUnits(c.relativeX),
                width: metersToUnits(c.width),
                height: metersToUnits(c.height)
            }));
            return new PlateformeAir(xUnits, yUnits, widthUnits, heightUnits, carriedObstacles);
        } else if (type === 'finish') {
            // Large ligne verticale de fin de niveau
            return new Finish(xUnits, widthUnits || 0.5);
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
