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
        
        // Drapeau à damiers vertical (alternance de carrés)
        const squareSize = pw;  // Carrés de la largeur du drapeau
        const numSquares = Math.ceil(ph / squareSize);
        
        for (let i = 0; i < numSquares; i++) {
            // Alterner entre noir et blanc
            ctx.fillStyle = (i % 2 === 0) ? '#ffffff' : '#222222';
            const squareY = py + i * squareSize;
            const squareH = Math.min(squareSize, ph - i * squareSize);
            ctx.fillRect(px, squareY, pw, squareH);
        }
        
        // Bordure
        ctx.strokeStyle = '#888888';
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
