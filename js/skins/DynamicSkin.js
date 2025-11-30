import { Scale } from '../engine/Scale.js';
import { Skin } from './Skin.js';

/**
 * Skin dynamique avec animation.
 * Permet de créer des animations en alternant entre plusieurs frames.
 * Chaque frame est une fonction de dessin ou une image.
 */
export class DynamicSkin extends Skin {
    /**
     * @param {string} id - Identifiant unique
     * @param {string} name - Nom d'affichage
     * @param {Array<Function>} frames - Tableau de fonctions de dessin
     *        Chaque fonction a la signature: (ctx, px, py, pw, ph, options, frameState)
     * @param {number} frameDuration - Durée de chaque frame en millisecondes
     * @param {string} borderColor - Couleur de la bordure (CSS), null pour pas de bordure
     */
    constructor(id, name, frames, frameDuration = 100, borderColor = '#fff') {
        super(id, name, 'dynamic');
        this.frames = frames;
        this.frameDuration = frameDuration;
        this.borderColor = borderColor;
        
        this.frameIndex = 0;
        this.frameTime = 0;
        
        // État personnalisé pour les animations complexes
        this.state = {};
    }
    
    update(dt) {
        // dt est en secondes, frameDuration en ms
        this.frameTime += dt * 1000;
        
        if (this.frameTime >= this.frameDuration) {
            this.frameTime -= this.frameDuration;
            this.frameIndex = (this.frameIndex + 1) % this.frames.length;
        }
    }
    
    draw(ctx, x, y, width, height, options = {}) {
        const px = Scale.toPixels(x);
        const py = Scale.toPixels(y);
        const pw = Scale.toPixels(width);
        const ph = Scale.toPixels(height);
        
        // Appeler la fonction de dessin de la frame courante
        const frameFn = this.frames[this.frameIndex];
        if (typeof frameFn === 'function') {
            frameFn(ctx, px, py, pw, ph, options, this.state);
        }
        
        // Bordure optionnelle
        if (this.borderColor) {
            const isFlashing = options.isFlashing || false;
            ctx.strokeStyle = isFlashing ? '#ff6666' : this.borderColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(px, py, pw, ph);
        }
    }
    
    reset() {
        super.reset();
        this.state = {};
    }
    
    clone() {
        const clone = new DynamicSkin(this.id, this.name, this.frames, this.frameDuration, this.borderColor);
        clone.state = { ...this.state };
        return clone;
    }
}

/**
 * Crée un skin dynamique avec une barre qui se déplace horizontalement.
 */
export function createMovingBarSkin(id, name, bgColor, barColor, barWidth = 0.2, speed = 200) {
    const frames = [];
    const steps = 10;
    
    for (let i = 0; i < steps; i++) {
        const progress = i / steps;
        frames.push((ctx, px, py, pw, ph, options) => {
            // Fond
            ctx.fillStyle = options.isFlashing ? '#ff0000' : bgColor;
            ctx.fillRect(px, py, pw, ph);
            
            // Barre qui se déplace
            const barW = pw * barWidth;
            const barX = px + (pw - barW) * progress;
            ctx.fillStyle = barColor;
            ctx.fillRect(barX, py, barW, ph);
        });
    }
    
    return new DynamicSkin(id, name, frames, speed / steps, '#fff');
}

/**
 * Crée un skin dynamique avec une matrice de pixels colorés et une onde.
 */
export function createPixelWaveSkin(id, name, colors, gridSize = 4, waveSpeed = 150) {
    const frames = [];
    const waveSteps = gridSize * 2;
    
    for (let step = 0; step < waveSteps; step++) {
        frames.push((ctx, px, py, pw, ph, options) => {
            const cellW = pw / gridSize;
            const cellH = ph / gridSize;
            
            for (let row = 0; row < gridSize; row++) {
                for (let col = 0; col < gridSize; col++) {
                    // Calculer la distance depuis le coin supérieur gauche
                    const dist = row + col;
                    // Décaler la couleur en fonction de l'onde
                    const colorIndex = (dist + step) % colors.length;
                    
                    ctx.fillStyle = options.isFlashing ? '#ff0000' : colors[colorIndex];
                    ctx.fillRect(
                        px + col * cellW,
                        py + row * cellH,
                        cellW + 0.5, // +0.5 pour éviter les gaps
                        cellH + 0.5
                    );
                }
            }
        });
    }
    
    return new DynamicSkin(id, name, frames, waveSpeed, null);
}

/**
 * Crée un skin dynamique avec un dégradé qui pulse.
 */
export function createPulsingSkin(id, name, color1, color2, pulseDuration = 500) {
    const frames = [];
    const steps = 10;
    
    for (let i = 0; i < steps; i++) {
        const t = i / steps;
        // Oscillation sinusoïdale
        const blend = (Math.sin(t * Math.PI * 2) + 1) / 2;
        
        frames.push((ctx, px, py, pw, ph, options) => {
            if (options.isFlashing) {
                ctx.fillStyle = '#ff0000';
            } else {
                // Interpoler entre les deux couleurs
                ctx.fillStyle = interpolateColor(color1, color2, blend);
            }
            ctx.fillRect(px, py, pw, ph);
        });
    }
    
    return new DynamicSkin(id, name, frames, pulseDuration / steps, '#fff');
}

/**
 * Interpole entre deux couleurs hexadécimales.
 */
function interpolateColor(color1, color2, t) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    
    const r = Math.round(c1.r + (c2.r - c1.r) * t);
    const g = Math.round(c1.g + (c2.g - c1.g) * t);
    const b = Math.round(c1.b + (c2.b - c1.b) * t);
    
    return `rgb(${r}, ${g}, ${b})`;
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 128, g: 128, b: 128 };
}
