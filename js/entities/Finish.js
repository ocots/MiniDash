import { CONFIG } from '../config.js';
import { Entity } from './Entity.js';

/**
 * Finish est une Entity (pas un Obstacle).
 * Elle marque la fin du niveau sans bloquer ni tuer le joueur.
 */
export class Finish extends Entity {
    constructor(x, width = 20) {
        super(x, 0, width, CONFIG.CANVAS_HEIGHT);
        this.type = 'finish';
        this.passed = false;
    }
    
    draw(ctx) {
        ctx.fillStyle = '#00ff88';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
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
