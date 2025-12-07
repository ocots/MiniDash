import { CONFIG } from '../config.js';
import { Entity } from './Entity.js';
import { Scale } from '../engine/Scale.js';
import { Triangle } from './Triangle.js';
import { Rectangle } from './Rectangle.js';
import { checkAABBCollision } from '../utils/collision.js';

/**
 * PlateformeAir : plateforme flottante dans les airs.
 * - N'a PAS de corps meurtrier (ne tue pas le joueur).
 * - Peut porter des obstacles (Triangle, Rectangle) sur elle.
 * - Permet de créer des chemins aériens, escaliers dans le ciel, etc.
 * Toutes les coordonnées sont en UNITÉS LOGIQUES.
 */
export class PlateformeAir extends Entity {
    /**
     * @param {number} x - Position X en unités logiques
     * @param {number} y - Position Y en unités logiques (depuis le haut du monde)
     * @param {number} width - Largeur en unités logiques
     * @param {number} height - Hauteur en unités logiques
     * @param {Array} carriedObstacles - Obstacles portés [{ type, relativeX, width, height }, ...]
     */
    constructor(x, y, width, height, carriedObstacles = []) {
        super(x, y, width, height);
        this.type = 'plateformeAir';
        
        // Obstacles portés par cette plateforme
        this.carriedObstacles = [];
        
        // Initialiser les obstacles portés
        for (const obstacleData of carriedObstacles) {
            this.addCarriedObstacle(obstacleData);
        }
    }
    
    /**
     * Ajoute un obstacle porté.
     * @param {Object} obstacleData - { type, relativeX, width, height }
     *   - relativeX: position X relative au bord gauche de la plateforme
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
        }
        
        if (obstacle) {
            // Stocker la position relative pour le déplacement
            obstacle._relativeX = relativeX;
            // Positionner l'obstacle sur le dessus de la plateforme
            obstacle.y = this.y - obstacle.height;
            this.carriedObstacles.push(obstacle);
        }
    }
    
    update(dt) {
        // Déplacer la plateforme
        super.update(dt);
        
        // Mettre à jour la position des obstacles portés
        for (const obstacle of this.carriedObstacles) {
            // Garder la position relative constante
            obstacle.x = this.x + obstacle._relativeX;
            // Note: on ne met pas à jour obstacle.y car il reste sur le dessus
        }
    }
    
    draw(ctx) {
        const px = Scale.toPixels(this.x);
        const py = Scale.toPixels(this.y);
        const pw = Scale.toPixels(this.width);
        const ph = Scale.toPixels(this.height);
        
        // Couleur distincte pour la plateforme aérienne (bleu-gris)
        ctx.fillStyle = CONFIG.PLATEFORME_AIR_COLOR || '#5d6d7e';
        ctx.fillRect(px, py, pw, ph);
        
        // Bordure
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(px, py, pw, ph);
        
        // Dessiner les obstacles portés
        for (const obstacle of this.carriedObstacles) {
            obstacle.draw(ctx);
        }
    }
    
    isOffScreen() {
        // La plateforme est hors écran seulement quand elle ET tous ses obstacles portés le sont
        if (this.x + this.width >= 0) return false;
        
        for (const obstacle of this.carriedObstacles) {
            if (!obstacle.isOffScreen()) return false;
        }
        
        return true;
    }
    
    // Corps physique (égal au corps image)
    getPhysicsBody() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    // Pas de corps meurtrier (retourne null ou un corps vide)
    getHurtBody() {
        return null;
    }
    
    /**
     * Résout les collisions physiques avec le joueur.
     * La plateforme bloque le joueur (il peut marcher dessus).
     * Inclut la plateforme elle-même ET ses obstacles portés.
     */
    resolveCollision(player) {
        const playerPhys = player.getPhysicsBody();
        const platformPhys = this.getPhysicsBody();
        
        if (checkAABBCollision(playerPhys, platformPhys)) {
            const overlapLeft = (playerPhys.x + playerPhys.width) - platformPhys.x;
            const overlapRight = (platformPhys.x + platformPhys.width) - playerPhys.x;
            const overlapTop = (playerPhys.y + playerPhys.height) - platformPhys.y;
            const overlapBottom = (platformPhys.y + platformPhys.height) - playerPhys.y;
            
            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
            
            if (minOverlap === overlapTop) {
                // Le joueur atterrit sur la plateforme
                player.landOnPlatform(platformPhys.y);
            } else if (minOverlap === overlapBottom) {
                // Le joueur se cogne la tête
                player.y = platformPhys.y + platformPhys.height;
                player.velocityY = 0;
            } else if (minOverlap === overlapLeft) {
                player.x = platformPhys.x - player.width;
            } else if (minOverlap === overlapRight) {
                player.x = platformPhys.x + platformPhys.width;
            }
        }
        
        // Collision avec les obstacles portés
        for (const obstacle of this.carriedObstacles) {
            obstacle.resolveCollision(player);
        }
    }
    
    /**
     * Vérifie les collisions mortelles avec le joueur.
     * La plateforme elle-même ne tue PAS, mais ses obstacles portés peuvent tuer.
     */
    checkCollision(player) {
        // La plateforme elle-même ne tue pas
        // Mais les obstacles portés peuvent tuer
        for (const obstacle of this.carriedObstacles) {
            if (obstacle.checkCollision(player)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Retourne tous les obstacles (la plateforme + ses portés) pour debug/listing.
     */
    getAllObstacles() {
        return [this, ...this.carriedObstacles];
    }
}
