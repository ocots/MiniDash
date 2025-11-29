import { CONFIG } from '../config.js';
import { Entity } from './Entity.js';
import { Scale } from '../engine/Scale.js';
import { createTrianglePolygon, checkPolygonCollision } from '../utils/collision.js';

/**
 * Triangle : pic mortel.
 * Hérite de Entity (pas de Obstacle car collision polygonale spécifique).
 * Collision polygonale précise.
 * On ne peut pas marcher dessus.
 * Toutes les coordonnées sont en UNITÉS LOGIQUES.
 */
export class Triangle extends Entity {
    constructor(x, width, height) {
        const y = CONFIG.WORLD_HEIGHT - CONFIG.GROUND_HEIGHT - height;
        super(x, y, width, height);
        
        this.type = 'triangle';
        
        // Marge pour le corps meurtrier (en unités)
        this.hurtMargin = CONFIG.TRIANGLE_HURT_MARGIN;
        
        this.passed = false;
    }
    
    draw(ctx) {
        const img = this.getImagePolygon();
        
        ctx.fillStyle = CONFIG.TRIANGLE_COLOR;
        ctx.beginPath();
        ctx.moveTo(Scale.toPixels(img[0].x), Scale.toPixels(img[0].y));
        ctx.lineTo(Scale.toPixels(img[1].x), Scale.toPixels(img[1].y));
        ctx.lineTo(Scale.toPixels(img[2].x), Scale.toPixels(img[2].y));
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Debug: afficher les hitboxes (décommenter pour debug)
        // this.drawDebugHitboxes(ctx);
    }
    
    drawDebugHitboxes(ctx) {
        // Corps physique (bleu)
        const phys = this.getPhysicsPolygon();
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Scale.toPixels(phys[0].x), Scale.toPixels(phys[0].y));
        ctx.lineTo(Scale.toPixels(phys[1].x), Scale.toPixels(phys[1].y));
        ctx.lineTo(Scale.toPixels(phys[2].x), Scale.toPixels(phys[2].y));
        ctx.closePath();
        ctx.stroke();
        
        // Corps meurtrier (rouge)
        const hurt = this.getHurtPolygon();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Scale.toPixels(hurt[0].x), Scale.toPixels(hurt[0].y));
        ctx.lineTo(Scale.toPixels(hurt[1].x), Scale.toPixels(hurt[1].y));
        ctx.lineTo(Scale.toPixels(hurt[2].x), Scale.toPixels(hurt[2].y));
        ctx.closePath();
        ctx.stroke();
    }
    
    // Corps image (polygone triangulaire)
    getImagePolygon() {
        return createTrianglePolygon(this.x, this.y, this.width, this.height);
    }
    
    // Corps physique (égal au corps image)
    getPhysicsPolygon() {
        return createTrianglePolygon(this.x, this.y, this.width, this.height);
    }
    
    // Corps meurtrier (légèrement plus grand, centré)
    getHurtPolygon() {
        const margin = this.hurtMargin;
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height * 2 / 3;
        
        const scale = (this.width + margin * 2) / this.width;
        
        const basePolygon = this.getPhysicsPolygon();
        return basePolygon.map(point => ({
            x: centerX + (point.x - centerX) * scale,
            y: centerY + (point.y - centerY) * scale
        }));
    }
    
    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
    
    // Les triangles sont des pics mortels, pas de résolution physique
    resolveCollision(player) {
        // Rien à faire - la collision mortelle sera détectée par checkCollision
    }
    
    // Collision mortelle (polygone vs polygone)
    checkCollision(player) {
        const playerHurt = player.getHurtPolygon();
        const obstacleHurt = this.getHurtPolygon();
        return checkPolygonCollision(playerHurt, obstacleHurt);
    }
}
