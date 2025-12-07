import { CONFIG } from '../config.js';
import { Scale } from '../engine/Scale.js';
import { rectToPolygon } from '../utils/collision.js';
import { skinManager } from '../skins/index.js';
import { PlayerStates, PlayerStateMachine } from '../engine/PlayerState.js';

/**
 * Le joueur - toutes les coordonnées sont en UNITÉS LOGIQUES.
 */
export class Player {
    constructor() {
        // Position en unités logiques
        this.x = CONFIG.PLAYER_X;
        this.width = CONFIG.PLAYER_SIZE;
        this.height = CONFIG.PLAYER_SIZE;
        this.groundY = CONFIG.WORLD_HEIGHT - CONFIG.GROUND_HEIGHT - this.height;
        this.y = this.groundY;
        
        // Marge pour le corps meurtrier (en unités)
        this.hurtMargin = CONFIG.PLAYER_HURT_MARGIN;
        
        this.velocityY = 0;
        this.isOnGround = true;
        this.isJumping = false;
        this.jumpHeld = false;
        this.state = new PlayerStateMachine(PlayerStates.GROUNDED);
        
        // Mode Debug : indicateur de collision
        this.isColliding = false;
        this.collisionFlashTimer = 0;
        
        // Référence au gestionnaire de skins
        this.skinManager = skinManager;
    }
    
    update(dt) {
        // Sauvegarder l'état précédent
        // Appliquer la gravité (en unités/s², multiplié par dt pour être indépendant du framerate)
        this.velocityY += CONFIG.GRAVITY * dt;
        this.y += this.velocityY * dt;

        if (this.state.is(PlayerStates.JUMP_RISING) && this.velocityY >= 0) {
            this.state.transitionTo(PlayerStates.FALLING);
        }
        
        // Vérifier le sol
        if (this.y >= this.groundY) {
            this.landOnGround();
        } else {
            if (this.state.is(PlayerStates.GROUNDED)) {
                this.state.transitionTo(PlayerStates.FALLING);
            }
            this.isOnGround = false;
        }
        
        // Mise à jour du timer de flash de collision
        if (this.collisionFlashTimer > 0) {
            this.collisionFlashTimer -= dt;
        }
    }
    
    draw(ctx) {
        // Obtenir le skin courant
        const skin = this.skinManager.getCurrentSkin();
        
        // Options pour le rendu du skin
        const options = {
            isFlashing: this.collisionFlashTimer > 0
        };
        
        // Dessiner le skin
        skin.draw(ctx, this.x, this.y, this.width, this.height, options);
        
        // Debug: afficher les hitboxes si demandé
        if (this.showHitboxes) {
            this.drawDebugHitboxes(ctx);
        }
    }
    
    drawDebugHitboxes(ctx) {
        // Corps physique (bleu)
        const phys = this.getPhysicsBody();
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 1;
        ctx.strokeRect(Scale.toPixels(phys.x), Scale.toPixels(phys.y), 
                       Scale.toPixels(phys.width), Scale.toPixels(phys.height));
        
        // Corps meurtrier (rouge)
        const hurt = this.getHurtBody();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.strokeRect(Scale.toPixels(hurt.x), Scale.toPixels(hurt.y), 
                       Scale.toPixels(hurt.width), Scale.toPixels(hurt.height));
    }
    
    landOnGround() {
        const wasGrounded = this.state.is(PlayerStates.GROUNDED);
        this.y = this.groundY;
        this.velocityY = 0;
        this.state.transitionTo(PlayerStates.GROUNDED);
        this.isOnGround = true;
        if (!wasGrounded && this.jumpHeld &&
            !this.state.is(PlayerStates.DYING) &&
            !this.state.is(PlayerStates.DISABLED)) {
            this._doJump();
        }
    }
    
    landOnPlatform(surfaceY) {
        const wasGrounded = this.state.is(PlayerStates.GROUNDED);
        this.y = surfaceY - this.height;
        this.velocityY = 0;
        this.state.transitionTo(PlayerStates.GROUNDED);
        this.isOnGround = true;
        if (!wasGrounded && this.jumpHeld &&
            !this.state.is(PlayerStates.DYING) &&
            !this.state.is(PlayerStates.DISABLED)) {
            this._doJump();
        }
    }
    
    jump() {
        if (!this.state.is(PlayerStates.GROUNDED)) {
            return;
        }
        if (this.state.is(PlayerStates.DYING) || this.state.is(PlayerStates.DISABLED)) {
            return;
        }
        this._doJump();
    }
    
    _doJump() {
        this.velocityY = CONFIG.JUMP_FORCE;
        this.state.transitionTo(PlayerStates.JUMP_RISING);
        this.isOnGround = false;
    }
    
    startJump() {
        this.isJumping = true;
        this.jumpHeld = true;
        if (!this.state.is(PlayerStates.DYING) && !this.state.is(PlayerStates.DISABLED)) {
            this.jump();
        }
    }
    
    stopJump() {
        this.isJumping = false;
        this.jumpHeld = false;
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
