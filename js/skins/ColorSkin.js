import { Scale } from '../engine/Scale.js';
import { Skin } from './Skin.js';

/**
 * Skin de couleur unie.
 * Le skin le plus simple : un carré d'une couleur donnée.
 */
export class ColorSkin extends Skin {
    /**
     * @param {string} id - Identifiant unique
     * @param {string} name - Nom d'affichage
     * @param {string} color - Couleur de remplissage (CSS)
     * @param {string} borderColor - Couleur de la bordure (CSS)
     * @param {string} flashColor - Couleur lors d'une collision (CSS)
     */
    constructor(id, name, color, borderColor = '#fff', flashColor = '#ff0000') {
        super(id, name, 'static');
        this.color = color;
        this.borderColor = borderColor;
        this.flashColor = flashColor;
    }
    
    draw(ctx, x, y, width, height, options = {}) {
        const px = Scale.toPixels(x);
        const py = Scale.toPixels(y);
        const pw = Scale.toPixels(width);
        const ph = Scale.toPixels(height);
        
        // Couleur de remplissage (flash si collision)
        const isFlashing = options.isFlashing || false;
        ctx.fillStyle = isFlashing ? this.flashColor : this.color;
        ctx.fillRect(px, py, pw, ph);
        
        // Bordure
        ctx.strokeStyle = isFlashing ? '#ff6666' : this.borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(px, py, pw, ph);
    }
    
    clone() {
        return new ColorSkin(this.id, this.name, this.color, this.borderColor, this.flashColor);
    }
}
