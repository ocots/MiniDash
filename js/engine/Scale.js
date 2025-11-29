import { CONFIG } from '../config.js';

/**
 * Gestionnaire de scale pour le rendu responsive.
 * Convertit les unités logiques en pixels selon la taille de l'écran.
 */
class ScaleManager {
    constructor() {
        this.pixelsPerUnit = 1;
        this.canvasWidth = 0;
        this.canvasHeight = 0;
        this.worldWidth = 0;  // Largeur du monde en unités
    }
    
    /**
     * Initialise le scale manager avec un canvas.
     * Calcule la taille optimale pour l'écran.
     */
    init(canvas) {
        this.canvas = canvas;
        this.resize();
        
        // Écouter les changements de taille de fenêtre
        window.addEventListener('resize', () => this.resize());
    }
    
    /**
     * Recalcule les dimensions du canvas selon la taille de l'écran.
     */
    resize() {
        const container = this.canvas.parentElement;
        const maxWidth = window.innerWidth * 0.95;  // 95% de la largeur de l'écran
        const maxHeight = window.innerHeight * 0.9; // 90% de la hauteur de l'écran
        
        // Calculer la taille en respectant le ratio
        let width, height;
        
        if (maxWidth / maxHeight > CONFIG.ASPECT_RATIO) {
            // Limité par la hauteur
            height = maxHeight;
            width = height * CONFIG.ASPECT_RATIO;
        } else {
            // Limité par la largeur
            width = maxWidth;
            height = width / CONFIG.ASPECT_RATIO;
        }
        
        // Appliquer les dimensions au canvas
        this.canvasWidth = Math.floor(width);
        this.canvasHeight = Math.floor(height);
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        
        // Calculer le nombre de pixels par unité
        this.pixelsPerUnit = this.canvasHeight / CONFIG.WORLD_HEIGHT;
        
        // Calculer la largeur du monde en unités
        this.worldWidth = this.canvasWidth / this.pixelsPerUnit;
    }
    
    /**
     * Convertit des unités logiques en pixels.
     */
    toPixels(units) {
        return units * this.pixelsPerUnit;
    }
    
    /**
     * Convertit des pixels en unités logiques.
     */
    toUnits(pixels) {
        return pixels / this.pixelsPerUnit;
    }
    
    /**
     * Retourne la hauteur du canvas en pixels.
     */
    getCanvasHeight() {
        return this.canvasHeight;
    }
    
    /**
     * Retourne la largeur du canvas en pixels.
     */
    getCanvasWidth() {
        return this.canvasWidth;
    }
    
    /**
     * Retourne la hauteur du monde en unités.
     */
    getWorldHeight() {
        return CONFIG.WORLD_HEIGHT;
    }
    
    /**
     * Retourne la largeur du monde en unités.
     */
    getWorldWidth() {
        return this.worldWidth;
    }
}

// Singleton exporté
export const Scale = new ScaleManager();
