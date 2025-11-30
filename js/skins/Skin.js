import { Scale } from '../engine/Scale.js';

/**
 * Classe de base abstraite pour tous les skins.
 * 
 * Un Skin est responsable uniquement du rendu visuel d'une entité.
 * Il ne gère pas la physique ni les collisions.
 * 
 * Types de skins supportés :
 * - Statique : couleur unie, dégradé, forme dessinée
 * - Image : fichier image (PNG, JPG, WebP, SVG) - ratio 1:1 recommandé
 * - Dynamique : animation avec plusieurs frames (comme un GIF)
 * 
 * Pour les images :
 * - Formats acceptés : PNG, JPG, JPEG, WebP, SVG, GIF
 * - Ratio recommandé : 1:1 (carré) pour le joueur
 * - Taille recommandée : 64x64 à 256x256 pixels
 */
export class Skin {
    /**
     * @param {string} id - Identifiant unique du skin
     * @param {string} name - Nom d'affichage du skin
     * @param {string} type - Type de skin : 'static', 'image', 'dynamic'
     */
    constructor(id, name, type = 'static') {
        this.id = id;
        this.name = name;
        this.type = type;
        
        // Pour les skins dynamiques
        this.frameIndex = 0;
        this.frameTime = 0;
        this.frameDuration = 100; // ms par frame par défaut
    }
    
    /**
     * Met à jour l'état du skin (pour les animations).
     * @param {number} dt - Delta time en secondes
     */
    update(dt) {
        // À surcharger pour les skins dynamiques
    }
    
    /**
     * Dessine le skin sur le canvas.
     * @param {CanvasRenderingContext2D} ctx - Contexte de rendu
     * @param {number} x - Position X en unités logiques
     * @param {number} y - Position Y en unités logiques
     * @param {number} width - Largeur en unités logiques
     * @param {number} height - Hauteur en unités logiques
     * @param {Object} options - Options supplémentaires (ex: isFlashing pour collision)
     */
    draw(ctx, x, y, width, height, options = {}) {
        // À surcharger dans les sous-classes
        const px = Scale.toPixels(x);
        const py = Scale.toPixels(y);
        const pw = Scale.toPixels(width);
        const ph = Scale.toPixels(height);
        
        ctx.fillStyle = '#888';
        ctx.fillRect(px, py, pw, ph);
    }
    
    /**
     * Dessine la bordure du skin.
     * @param {CanvasRenderingContext2D} ctx - Contexte de rendu
     * @param {number} x - Position X en unités logiques
     * @param {number} y - Position Y en unités logiques
     * @param {number} width - Largeur en unités logiques
     * @param {number} height - Hauteur en unités logiques
     * @param {string} color - Couleur de la bordure
     * @param {number} lineWidth - Épaisseur de la bordure
     */
    drawBorder(ctx, x, y, width, height, color = '#fff', lineWidth = 2) {
        const px = Scale.toPixels(x);
        const py = Scale.toPixels(y);
        const pw = Scale.toPixels(width);
        const ph = Scale.toPixels(height);
        
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.strokeRect(px, py, pw, ph);
    }
    
    /**
     * Réinitialise l'animation (pour les skins dynamiques).
     */
    reset() {
        this.frameIndex = 0;
        this.frameTime = 0;
    }
    
    /**
     * Clone le skin (utile pour avoir des instances indépendantes).
     * @returns {Skin} Une copie du skin
     */
    clone() {
        return new Skin(this.id, this.name, this.type);
    }
}
