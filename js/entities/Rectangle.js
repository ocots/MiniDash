import { CONFIG } from '../config.js';
import { Obstacle } from './Obstacle.js';

/**
 * Rectangle : obstacle sur lequel on peut marcher.
 * Mortel uniquement sur les côtés (pas dessus/dessous).
 */
export class Rectangle extends Obstacle {
    constructor(x, width, height) {
        super(x, width, height);
        this.type = 'rectangle';
        
        // Marges pour le corps meurtrier
        // Plus large sur les côtés, moins haut (pas mortel dessus/dessous)
        this.hurtMarginX = CONFIG.RECTANGLE_HURT_MARGIN_X || 4;
        this.hurtMarginY = CONFIG.RECTANGLE_HURT_MARGIN_Y || 8;
    }
    
    draw(ctx) {
        const img = this.getImageBody();
        ctx.fillStyle = CONFIG.RECTANGLE_COLOR;
        ctx.fillRect(img.x, img.y, img.width, img.height);
        
        // Bordure
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(img.x, img.y, img.width, img.height);
        
        // Debug: afficher les hitboxes (décommenter pour debug)
        // this.drawDebugHitboxes(ctx);
    }
}
