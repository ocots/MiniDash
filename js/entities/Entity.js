import { CONFIG } from '../config.js';
import { Scale } from '../engine/Scale.js';

/**
 * Classe de base pour toutes les entités du jeu.
 * Toutes les coordonnées sont en UNITÉS LOGIQUES.
 * La conversion en pixels se fait au moment du rendu via Scale.
 */
export class Entity {
    constructor(x, y, width, height) {
        // Coordonnées en unités logiques
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    
    update(dt) {
        // Par défaut, les entités se déplacent vers la gauche avec le scroll (en unités/s)
        this.x -= CONFIG.SCROLL_SPEED * dt;
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
    
    // Convertit les coordonnées en pixels pour le rendu
    toPixelBounds() {
        return {
            x: Scale.toPixels(this.x),
            y: Scale.toPixels(this.y),
            width: Scale.toPixels(this.width),
            height: Scale.toPixels(this.height)
        };
    }
}
