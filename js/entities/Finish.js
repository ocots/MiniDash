import { CONFIG } from '../config.js';
import { Entity } from './Entity.js';
import { Scale } from '../engine/Scale.js';

/**
 * Finish est une Entity (pas un Obstacle).
 * Elle marque la fin du niveau sans bloquer ni tuer le joueur.
 * Toutes les coordonnées sont en UNITÉS LOGIQUES.
 */
export class Finish extends Entity {
    constructor(x, width = 0.5) {
        // Hauteur = toute la hauteur du monde
        super(x, 0, width, CONFIG.WORLD_HEIGHT);
        this.type = 'finish';
        this.passed = false;
    }
    
    draw(ctx) {
        const px = Scale.toPixels(this.x);
        const py = Scale.toPixels(this.y);
        const pw = Scale.toPixels(this.width);
        const ph = Scale.toPixels(this.height);
        
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(px, py, pw, ph);
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(px, py, pw, ph);
    }
    
    // Finish n'est pas un obstacle, ces méthodes ne font rien
    resolveCollision(player) {
        // aucun effet
    }
    
    checkCollision(player) {
        return false;
    }
    
    // Retourne true la première fois que le joueur a complètement dépassé la ligne
    hasPlayerPassed(player) {
        if (this.passed) return false;
        const body = player.getPhysicsBody();
        if (body.x > this.x + this.width) {
            this.passed = true;
            return true;
        }
        return false;
    }
}
