import { CONFIG } from '../config.js';
import { Obstacle } from './Obstacle.js';
import { Scale } from '../engine/Scale.js';

/**
 * Rectangle : obstacle sur lequel on peut marcher.
 * Mortel uniquement sur les côtés (pas dessus/dessous).
 */
export class Rectangle extends Obstacle {
    constructor(x, width, height) {
        super(x, width, height);
        this.type = 'rectangle';
        
        // Marges pour le corps meurtrier (en unités)
        this.hurtMarginX = CONFIG.RECTANGLE_HURT_MARGIN_X;
        this.hurtMarginY = CONFIG.RECTANGLE_HURT_MARGIN_Y;
    }
    
    draw(ctx) {
        const img = this.getImageBody();
        const px = Scale.toPixels(img.x);
        const py = Scale.toPixels(img.y);
        const pw = Scale.toPixels(img.width);
        const ph = Scale.toPixels(img.height);
        
        ctx.fillStyle = CONFIG.RECTANGLE_COLOR;
        ctx.fillRect(px, py, pw, ph);
        
        // Bordure
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(px, py, pw, ph);
        
        // Debug: afficher les hitboxes (décommenter pour debug)
        // this.drawDebugHitboxes(ctx);
    }
}
