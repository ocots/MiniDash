import { CONFIG } from '../config.js';
import { Entity } from './Entity.js';
import { rectToPolygon, checkAABBCollision } from '../utils/collision.js';

/**
 * Classe de base pour tous les obstacles.
 * Un Obstacle est une Entity qui peut bloquer et/ou tuer le joueur.
 * Gère les 3 corps : physique, meurtrier, image.
 */
export class Obstacle extends Entity {
    constructor(x, width, height) {
        const y = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - height;
        super(x, y, width, height);
        
        this.type = 'obstacle';
        
        // Marges par défaut pour le corps meurtrier (à surcharger dans les sous-classes)
        this.hurtMarginX = 0;
        this.hurtMarginY = 0;
        
        this.passed = false;
    }
    
    draw(ctx) {
        // À surcharger dans les sous-classes
        const img = this.getImageBody();
        ctx.fillStyle = '#888';
        ctx.fillRect(img.x, img.y, img.width, img.height);
    }
    
    drawDebugHitboxes(ctx) {
        // Corps physique (bleu)
        const phys = this.getPhysicsBody();
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 1;
        ctx.strokeRect(phys.x, phys.y, phys.width, phys.height);
        
        // Corps meurtrier (rouge)
        const hurt = this.getHurtBody();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.strokeRect(hurt.x, hurt.y, hurt.width, hurt.height);
    }
    
    // Corps image (pour le rendu)
    getImageBody() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    // Corps physique (égal au corps image par défaut)
    getPhysicsBody() {
        return this.getImageBody();
    }
    
    // Corps meurtrier (à surcharger si nécessaire)
    getHurtBody() {
        return {
            x: this.x - this.hurtMarginX,
            y: this.y + this.hurtMarginY,
            width: this.width + this.hurtMarginX * 2,
            height: this.height - this.hurtMarginY * 2
        };
    }
    
    // Polygone du corps physique
    getPhysicsPolygon() {
        return rectToPolygon(this.getPhysicsBody());
    }
    
    // Polygone du corps meurtrier
    getHurtPolygon() {
        return rectToPolygon(this.getHurtBody());
    }
    
    // Ancien getBounds pour compatibilité
    getBounds() {
        return this.getPhysicsBody();
    }
    
    // Résolution de collision physique (empêcher traversée)
    resolveCollision(player) {
        const playerPhys = player.getPhysicsBody();
        const obstaclePhys = this.getPhysicsBody();
        
        if (!checkAABBCollision(playerPhys, obstaclePhys)) return;
        
        const overlapLeft = (playerPhys.x + playerPhys.width) - obstaclePhys.x;
        const overlapRight = (obstaclePhys.x + obstaclePhys.width) - playerPhys.x;
        const overlapTop = (playerPhys.y + playerPhys.height) - obstaclePhys.y;
        const overlapBottom = (obstaclePhys.y + obstaclePhys.height) - playerPhys.y;
        
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
        
        if (minOverlap === overlapTop) {
            player.y = obstaclePhys.y - player.height;
            player.velocityY = 0;
            player.isOnGround = true;
        } else if (minOverlap === overlapBottom) {
            player.y = obstaclePhys.y + obstaclePhys.height;
            player.velocityY = 0;
        } else if (minOverlap === overlapLeft) {
            player.x = obstaclePhys.x - player.width;
        } else if (minOverlap === overlapRight) {
            player.x = obstaclePhys.x + obstaclePhys.width;
        }
    }
    
    // Détection de collision mortelle
    checkCollision(player) {
        const playerHurt = player.getHurtBody();
        const obstacleHurt = this.getHurtBody();
        return checkAABBCollision(playerHurt, obstacleHurt);
    }
}
