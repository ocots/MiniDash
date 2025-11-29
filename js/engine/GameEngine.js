import { CONFIG } from '../config.js';
import { Scale } from './Scale.js';

export class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Initialiser le système de scale responsive
        Scale.init(canvas);
        
        this.isRunning = false;
        this.lastTime = 0;
        this.deltaTime = 0;
        
        this.entities = [];
        this.distance = 0;
    }
    
    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame(this.gameLoop);
    }
    
    stop() {
        this.isRunning = false;
    }
    
    gameLoop = (currentTime) => {
        if (!this.isRunning) return;
        
        // Calcul du delta time
        this.deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Limiter le deltaTime pour éviter les sauts trop importants
        if (this.deltaTime > 0.1 || this.deltaTime < 0) {
            this.deltaTime = 0.016; // ~60 FPS
        }
        
        // Mise à jour
        this.update(this.deltaTime);
        
        // Rendu
        this.render();
        
        // Boucle suivante
        requestAnimationFrame(this.gameLoop);
    }
    
    update(dt) {
        // Vérifier que dt est valide
        if (isNaN(dt) || dt <= 0) {
            dt = 0.016; // Valeur par défaut ~60 FPS
        }
        
        // Mise à jour de la distance (en mètres)
        // SCROLL_SPEED est en unités/seconde, on convertit en mètres
        this.distance += (CONFIG.SCROLL_SPEED / CONFIG.UNITS_PER_METER) * dt;
        
        // Mise à jour des entités
        for (const entity of this.entities) {
            if (entity.update) {
                entity.update(dt);
            }
        }
    }
    
    render() {
        // Effacer le canvas
        this.ctx.fillStyle = CONFIG.SKY_COLOR;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dessiner le sol (converti en pixels)
        const groundHeight = Scale.toPixels(CONFIG.GROUND_HEIGHT);
        this.ctx.fillStyle = CONFIG.GROUND_COLOR;
        this.ctx.fillRect(
            0, 
            this.canvas.height - groundHeight, 
            this.canvas.width, 
            groundHeight
        );
        
        // Dessiner les entités
        for (const entity of this.entities) {
            if (entity.draw) {
                entity.draw(this.ctx);
            }
        }
    }
    
    addEntity(entity) {
        this.entities.push(entity);
    }
    
    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
        }
    }
    
    getDistance() {
        return Math.floor(this.distance);
    }
}
