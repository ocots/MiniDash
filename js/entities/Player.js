import { CONFIG } from '../config.js';
import { rectToPolygon } from '../utils/Collision.js';

export class Player {
    constructor() {
        this.x = CONFIG.PLAYER_X;
        this.y = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - CONFIG.PLAYER_SIZE;
        this.width = CONFIG.PLAYER_SIZE;
        this.height = CONFIG.PLAYER_SIZE;
        
        // Marge pour le corps meurtrier (légèrement plus grand)
        this.hurtMargin = CONFIG.PLAYER_HURT_MARGIN || 4;
        
        this.velocityY = 0;
        this.isOnGround = true;
        this.isJumping = false;
        
        this.groundY = CONFIG.CANVAS_HEIGHT - CONFIG.GROUND_HEIGHT - this.height;
    }
    
    update(dt) {
        // Sauvegarder l'état précédent
        const wasOnGround = this.isOnGround;
        
        // Appliquer la gravité
        this.velocityY += CONFIG.GRAVITY;
        this.y += this.velocityY;
        
        // Vérifier le sol
        if (this.y >= this.groundY) {
            this.y = this.groundY;
            this.velocityY = 0;
            this.isOnGround = true;
        } else {
            this.isOnGround = false;
        }
        
        // Rebond automatique si la touche est maintenue et qu'on vient d'atterrir
        if (this.isJumping && this.isOnGround && !wasOnGround) {
            this.jump();
        }
    }
    
    draw(ctx) {
        // Corps image (visuel)
        ctx.fillStyle = CONFIG.PLAYER_COLOR;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Bordure
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Debug: afficher les hitboxes (décommenter pour debug)
        // this.drawDebugHitboxes(ctx);
    }
    
    drawDebugHitboxes(ctx) {
        // Corps physique (bleu)
        const phys = this.getPhysicsBody();
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 1;
        ctx.strokeRect(phys.x, phys.y, phys.width, phys.height);
        
        // Corps meurtrier (rouge)
        const hurt = this.getHurtBody();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.strokeRect(hurt.x, hurt.y, hurt.width, hurt.height);
    }
    
    jump() {
        if (this.isOnGround) {
            this.velocityY = CONFIG.JUMP_FORCE;
            this.isOnGround = false;
        }
    }
    
    startJump() {
        this.isJumping = true;
        this.jump();
    }
    
    stopJump() {
        this.isJumping = false;
    }
    
    // Corps image (pour le rendu, égal aux dimensions de base)
    getImageBody() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    // Corps physique (égal au corps image pour le joueur)
    getPhysicsBody() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
    
    // Corps meurtrier (légèrement plus grand, centré)
    getHurtBody() {
        return {
            x: this.x - this.hurtMargin,
            y: this.y - this.hurtMargin,
            width: this.width + this.hurtMargin * 2,
            height: this.height + this.hurtMargin * 2
        };
    }
    
    // Polygone du corps physique
    getPhysicsPolygon() {
        return rectToPolygon(this.getPhysicsBody());
    }
    
    // Polygone du corps meurtrier
    getHurtPolygon() {
        return rectToPolygon(this.getHurtBody());
    }
    
    // Ancien getBounds pour compatibilité (retourne le corps physique)
    getBounds() {
        return this.getPhysicsBody();
    }
}
