import { CONFIG } from '../config.js';
import { ColorSkin } from './ColorSkin.js';
import { ImageSkin } from './ImageSkin.js';
import { 
    DynamicSkin, 
    createMovingBarSkin, 
    createPixelWaveSkin, 
    createPulsingSkin 
} from './DynamicSkin.js';

/**
 * Gestionnaire de skins.
 * Gère le catalogue de skins disponibles et le skin actuellement sélectionné.
 */
export class SkinManager {
    constructor() {
        /** @type {Map<string, Skin>} */
        this.skins = new Map();
        
        /** @type {string} */
        this.currentSkinId = 'default';
        
        // Charger le catalogue de skins par défaut
        this._loadDefaultSkins();
    }
    
    /**
     * Charge les skins par défaut.
     */
    _loadDefaultSkins() {
        // === SKINS DE COULEUR UNIE ===
        
        // Skin par défaut (couleur originale du joueur)
        this.register(new ColorSkin(
            'default',
            'Classique',
            CONFIG.PLAYER_COLOR,
            '#fff',
            CONFIG.DEBUG.COLLISION_FLASH_COLOR
        ));
        
        // Collection de couleurs
        this.register(new ColorSkin('red', 'Rouge', '#e74c3c', '#fff'));
        this.register(new ColorSkin('blue', 'Bleu', '#3498db', '#fff'));
        this.register(new ColorSkin('green', 'Vert', '#2ecc71', '#fff'));
        this.register(new ColorSkin('purple', 'Violet', '#9b59b6', '#fff'));
        this.register(new ColorSkin('orange', 'Orange', '#e67e22', '#fff'));
        this.register(new ColorSkin('yellow', 'Jaune', '#f1c40f', '#333'));
        this.register(new ColorSkin('pink', 'Rose', '#e91e63', '#fff'));
        this.register(new ColorSkin('cyan', 'Cyan', '#00bcd4', '#fff'));
        this.register(new ColorSkin('lime', 'Lime', '#cddc39', '#333'));
        this.register(new ColorSkin('indigo', 'Indigo', '#3f51b5', '#fff'));
        this.register(new ColorSkin('teal', 'Sarcelle', '#009688', '#fff'));
        this.register(new ColorSkin('amber', 'Ambre', '#ffc107', '#333'));
        this.register(new ColorSkin('black', 'Noir', '#1a1a1a', '#fff'));
        this.register(new ColorSkin('white', 'Blanc', '#ffffff', '#333'));
        
        // === SKINS DYNAMIQUES ===
        
        // Barre qui se déplace
        this.register(createMovingBarSkin(
            'moving-bar',
            'Barre Mobile',
            '#2c3e50',
            '#3498db',
            0.25,
            300
        ));
        
        // Onde de pixels
        this.register(createPixelWaveSkin(
            'pixel-wave',
            'Onde Pixel',
            ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'],
            4,
            120
        ));
        
        // Pulsation
        this.register(createPulsingSkin(
            'pulse-cyan',
            'Pulse Cyan',
            '#00bcd4',
            '#006064',
            600
        ));
        
        this.register(createPulsingSkin(
            'pulse-fire',
            'Pulse Feu',
            '#ff5722',
            '#b71c1c',
            400
        ));
        
        // Matrice style "Matrix"
        this.register(createPixelWaveSkin(
            'matrix',
            'Matrix',
            ['#001100', '#003300', '#005500', '#007700', '#00aa00', '#00ff00'],
            5,
            80
        ));
        
        // Arc-en-ciel
        this.register(createPixelWaveSkin(
            'rainbow',
            'Arc-en-ciel',
            ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'],
            3,
            100
        ));
    }
    
    /**
     * Enregistre un nouveau skin dans le catalogue.
     * @param {Skin} skin - Le skin à enregistrer
     */
    register(skin) {
        this.skins.set(skin.id, skin);
    }
    
    /**
     * Récupère un skin par son ID.
     * @param {string} id - L'ID du skin
     * @returns {Skin|null} Le skin ou null si non trouvé
     */
    get(id) {
        return this.skins.get(id) || null;
    }
    
    /**
     * Récupère le skin actuellement sélectionné.
     * @returns {Skin} Le skin courant (ou le skin par défaut si non trouvé)
     */
    getCurrentSkin() {
        return this.skins.get(this.currentSkinId) || this.skins.get('default');
    }
    
    /**
     * Change le skin courant.
     * @param {string} id - L'ID du nouveau skin
     * @returns {boolean} True si le changement a réussi
     */
    setCurrentSkin(id) {
        if (this.skins.has(id)) {
            this.currentSkinId = id;
            // Réinitialiser l'animation du nouveau skin
            const skin = this.getCurrentSkin();
            if (skin) {
                skin.reset();
            }
            return true;
        }
        return false;
    }
    
    /**
     * Récupère la liste de tous les skins disponibles.
     * @returns {Array<{id: string, name: string, type: string}>}
     */
    getAvailableSkins() {
        return Array.from(this.skins.values()).map(skin => ({
            id: skin.id,
            name: skin.name,
            type: skin.type
        }));
    }
    
    /**
     * Récupère les skins par type.
     * @param {string} type - Le type de skin ('static', 'image', 'dynamic')
     * @returns {Array<Skin>}
     */
    getSkinsByType(type) {
        return Array.from(this.skins.values()).filter(skin => skin.type === type);
    }
    
    /**
     * Passe au skin suivant dans le catalogue.
     * @returns {string} L'ID du nouveau skin
     */
    nextSkin() {
        const ids = Array.from(this.skins.keys());
        const currentIndex = ids.indexOf(this.currentSkinId);
        const nextIndex = (currentIndex + 1) % ids.length;
        this.setCurrentSkin(ids[nextIndex]);
        return this.currentSkinId;
    }
    
    /**
     * Passe au skin précédent dans le catalogue.
     * @returns {string} L'ID du nouveau skin
     */
    previousSkin() {
        const ids = Array.from(this.skins.keys());
        const currentIndex = ids.indexOf(this.currentSkinId);
        const prevIndex = (currentIndex - 1 + ids.length) % ids.length;
        this.setCurrentSkin(ids[prevIndex]);
        return this.currentSkinId;
    }
    
    /**
     * Met à jour tous les skins dynamiques.
     * @param {number} dt - Delta time en secondes
     */
    update(dt) {
        // Mettre à jour uniquement le skin courant
        const skin = this.getCurrentSkin();
        if (skin && skin.type === 'dynamic') {
            skin.update(dt);
        }
    }
}

// Instance singleton pour un accès global
export const skinManager = new SkinManager();
