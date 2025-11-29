import { CONFIG } from '../config.js';
import { Obstacle } from './Obstacle.js';
import { Triangle } from './Triangle.js';
import { Rectangle } from './Rectangle.js';

/**
 * RectangleLarge : grande plateforme qui peut porter d'autres obstacles.
 * 10 à 20 fois plus large qu'un Rectangle normal.
 * Les obstacles portés se déplacent avec le RectangleLarge.
 */
export class RectangleLarge extends Obstacle {
    constructor(x, width, height, carriedObstacles = []) {
        super(x, width, height);
        this.type = 'rectangleLarge';
        
        // Marges pour le corps meurtrier (comme Rectangle)
        this.hurtMarginX = CONFIG.RECTANGLE_HURT_MARGIN_X || 4;
        this.hurtMarginY = CONFIG.RECTANGLE_HURT_MARGIN_Y || 8;
        
        // Obstacles portés par ce RectangleLarge
        // Chaque obstacle porté a une position relative au RectangleLarge
        this.carriedObstacles = [];
        
        // Initialiser les obstacles portés
        for (const obstacleData of carriedObstacles) {
            this.addCarriedObstacle(obstacleData);
        }
    }
    
    /**
     * Ajoute un obstacle porté.
     * @param {Object} obstacleData - { type, relativeX, width, height }
     *   - relativeX: position X relative au bord gauche du RectangleLarge
     */
    addCarriedObstacle(obstacleData) {
        const { type, relativeX, width, height } = obstacleData;
        
        // Calculer la position absolue initiale
        const absoluteX = this.x + relativeX;
        
        let obstacle;
        if (type === 'triangle') {
            obstacle = new Triangle(absoluteX, width, height);
        } else if (type === 'rectangle') {
            obstacle = new Rectangle(absoluteX, width, height);
        } else if (type === 'rectangleLarge') {
            // RectangleLarge imbriqué (sans ses propres obstacles portés pour simplifier)
            obstacle = new RectangleLarge(absoluteX, width, height, []);
        }
        
        if (obstacle) {
            // Stocker la position relative pour le déplacement
            obstacle._relativeX = relativeX;
            // Positionner l'obstacle sur le dessus du RectangleLarge
            obstacle.y = this.y - obstacle.height;
            this.carriedObstacles.push(obstacle);
        }
    }
    
    update(dt) {
        // Déplacer le RectangleLarge
        super.update(dt);
        
        // Mettre à jour la position des obstacles portés
        for (const obstacle of this.carriedObstacles) {
            // Garder la position relative constante
            obstacle.x = this.x + obstacle._relativeX;
            // Note: on ne met pas à jour obstacle.y car il reste sur le dessus
        }
    }
    
    draw(ctx) {
        const img = this.getImageBody();
        
        // Couleur légèrement différente pour distinguer du Rectangle normal
        ctx.fillStyle = CONFIG.RECTANGLE_LARGE_COLOR || CONFIG.RECTANGLE_COLOR;
        ctx.fillRect(img.x, img.y, img.width, img.height);
        
        // Bordure
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(img.x, img.y, img.width, img.height);
        
        // Dessiner les obstacles portés
        for (const obstacle of this.carriedObstacles) {
            obstacle.draw(ctx);
        }
        
        // Debug: afficher les hitboxes (décommenter pour debug)
        // this.drawDebugHitboxes(ctx);
    }
    
    isOffScreen() {
        // Le RectangleLarge est hors écran seulement quand lui ET tous ses obstacles portés le sont
        if (this.x + this.width >= 0) return false;
        
        for (const obstacle of this.carriedObstacles) {
            if (!obstacle.isOffScreen()) return false;
        }
        
        return true;
    }
    
    /**
     * Résout les collisions physiques avec le joueur.
     * Inclut le RectangleLarge lui-même ET ses obstacles portés.
     */
    resolveCollision(player) {
        // Collision avec le RectangleLarge lui-même
        super.resolveCollision(player);
        
        // Collision avec les obstacles portés
        for (const obstacle of this.carriedObstacles) {
            obstacle.resolveCollision(player);
        }
    }
    
    /**
     * Vérifie les collisions mortelles avec le joueur.
     * Inclut le RectangleLarge lui-même ET ses obstacles portés.
     */
    checkCollision(player) {
        // Collision mortelle avec le RectangleLarge lui-même
        if (super.checkCollision(player)) {
            return true;
        }
        
        // Collision mortelle avec les obstacles portés
        for (const obstacle of this.carriedObstacles) {
            if (obstacle.checkCollision(player)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Retourne tous les obstacles (le RectangleLarge + ses portés) pour debug/listing.
     */
    getAllObstacles() {
        return [this, ...this.carriedObstacles];
    }
}
