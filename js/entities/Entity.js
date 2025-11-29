import { CONFIG } from '../config.js';

/**
 * Classe de base pour toutes les entités du jeu.
 * Une Entity peut se déplacer, se dessiner et se mettre à jour.
 */
export class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    update(dt) {
        // Par défaut, les entités se déplacent vers la gauche avec le scroll
        this.x -= CONFIG.SCROLL_SPEED;
    }
    
    draw(ctx) {
        // À surcharger dans les sous-classes
    }
    
    isOffScreen() {
        return this.x + this.width < 0;
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}
