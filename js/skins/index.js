/**
 * Module de gestion des skins.
 * 
 * Exporte toutes les classes et utilitaires liés aux skins.
 */

export { Skin } from './Skin.js';
export { ColorSkin } from './ColorSkin.js';
export { ImageSkin } from './ImageSkin.js';
export { 
    DynamicSkin, 
    createMovingBarSkin, 
    createPixelWaveSkin, 
    createPulsingSkin 
} from './DynamicSkin.js';
export { SkinManager, skinManager } from './SkinManager.js';
