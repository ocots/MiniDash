import { Scale } from '../engine/Scale.js';
import { Skin } from './Skin.js';

/**
 * Skin basé sur une image.
 * 
 * Formats acceptés : PNG, JPG, JPEG, WebP, SVG, GIF
 * Ratio recommandé : 1:1 (carré) pour le joueur
 * Taille recommandée : 64x64 à 256x256 pixels
 */
export class ImageSkin extends Skin {
    /**
     * @param {string} id - Identifiant unique
     * @param {string} name - Nom d'affichage
     * @param {string} imagePath - Chemin vers l'image
     * @param {string} borderColor - Couleur de la bordure (CSS), null pour pas de bordure
     */
    constructor(id, name, imagePath, borderColor = null) {
        super(id, name, 'image');
        this.imagePath = imagePath;
        this.borderColor = borderColor;
        this.image = null;
        this.loaded = false;
        this.loadError = false;
        
        this._loadImage();
    }
    
    _loadImage() {
        this.image = new Image();
        this.image.onload = () => {
            this.loaded = true;
        };
        this.image.onerror = () => {
            this.loadError = true;
            console.error(`Failed to load skin image: ${this.imagePath}`);
        };
        this.image.src = this.imagePath;
    }
    
    draw(ctx, x, y, width, height, options = {}) {
        const px = Scale.toPixels(x);
        const py = Scale.toPixels(y);
        const pw = Scale.toPixels(width);
        const ph = Scale.toPixels(height);
        
        if (this.loaded && this.image) {
            // Dessiner l'image
            ctx.drawImage(this.image, px, py, pw, ph);
        } else {
            // Fallback : carré gris si l'image n'est pas chargée
            ctx.fillStyle = this.loadError ? '#ff0000' : '#888';
            ctx.fillRect(px, py, pw, ph);
        }
        
        // Bordure optionnelle
        if (this.borderColor) {
            const isFlashing = options.isFlashing || false;
            ctx.strokeStyle = isFlashing ? '#ff6666' : this.borderColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(px, py, pw, ph);
        }
    }
    
    clone() {
        const clone = new ImageSkin(this.id, this.name, this.imagePath, this.borderColor);
        // Partager l'image déjà chargée
        clone.image = this.image;
        clone.loaded = this.loaded;
        clone.loadError = this.loadError;
        return clone;
    }
}
