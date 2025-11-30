import { GameStates } from './GameState.js';

/**
 * Gestionnaire centralisé des entrées utilisateur.
 * 
 * Centralise tous les event listeners et dispatch les actions
 * en fonction de l'état actuel du jeu.
 * 
 * Avantages :
 * - Un seul point d'entrée pour toutes les touches
 * - Pas de conflits entre handlers
 * - Actions clairement définies par état
 */

/**
 * Actions possibles dans le jeu.
 */
export const Actions = Object.freeze({
    // Navigation
    CONFIRM: 'confirm',           // Enter, Space (contexte menu)
    CANCEL: 'cancel',             // Escape
    NAVIGATE_UP: 'navigate_up',
    NAVIGATE_DOWN: 'navigate_down',
    NAVIGATE_LEFT: 'navigate_left',
    NAVIGATE_RIGHT: 'navigate_right',
    
    // Jeu
    JUMP_START: 'jump_start',     // Space, Click (contexte jeu)
    JUMP_END: 'jump_end',
    PAUSE: 'pause',               // P, B
    RESTART: 'restart',           // N
    MAIN_MENU: 'main_menu',       // M
    
    // Debug
    DEBUG_TOGGLE: 'debug_toggle', // D
    DEBUG_FORWARD: 'debug_forward',
    DEBUG_BACKWARD: 'debug_backward'
});

/**
 * Mapping des touches vers les actions par état.
 * Utilise e.key (caractère) pour les lettres (indépendant du layout clavier)
 * et e.code pour les touches spéciales (Space, Enter, flèches).
 */
const KEY_MAPPINGS = {
    [GameStates.MAIN_MENU]: {
        'Enter': Actions.CONFIRM,
        ' ': Actions.CONFIRM,        // Space (e.key)
        'd': Actions.DEBUG_TOGGLE,
        'D': Actions.DEBUG_TOGGLE
    },
    
    [GameStates.LEVEL_SELECT]: {
        'Escape': Actions.CANCEL,
        'Enter': Actions.CONFIRM,
        'd': Actions.DEBUG_TOGGLE,
        'D': Actions.DEBUG_TOGGLE
    },
    
    [GameStates.SKIN_SELECT]: {
        'Escape': Actions.CANCEL,
        'Enter': Actions.CONFIRM,
        'ArrowUp': Actions.NAVIGATE_UP,
        'ArrowDown': Actions.NAVIGATE_DOWN,
        'ArrowLeft': Actions.NAVIGATE_LEFT,
        'ArrowRight': Actions.NAVIGATE_RIGHT,
        'd': Actions.DEBUG_TOGGLE,
        'D': Actions.DEBUG_TOGGLE
    },
    
    [GameStates.PLAYING]: {
        ' ': Actions.JUMP_START,     // Space
        'p': Actions.PAUSE,
        'P': Actions.PAUSE,
        'b': Actions.PAUSE,
        'B': Actions.PAUSE,
        'd': Actions.DEBUG_TOGGLE,
        'D': Actions.DEBUG_TOGGLE
    },
    
    [GameStates.PAUSED]: {
        'p': Actions.PAUSE,          // Resume
        'P': Actions.PAUSE,
        'b': Actions.PAUSE,
        'B': Actions.PAUSE,
        'm': Actions.MAIN_MENU,
        'M': Actions.MAIN_MENU,
        'Escape': Actions.PAUSE,     // Resume aussi
        'ArrowLeft': Actions.DEBUG_BACKWARD,
        'ArrowRight': Actions.DEBUG_FORWARD,
        'd': Actions.DEBUG_TOGGLE,
        'D': Actions.DEBUG_TOGGLE
    },
    
    [GameStates.GAME_OVER]: {
        'Enter': Actions.RESTART,
        'n': Actions.RESTART,
        'N': Actions.RESTART,
        'm': Actions.MAIN_MENU,
        'M': Actions.MAIN_MENU,
        'd': Actions.DEBUG_TOGGLE,
        'D': Actions.DEBUG_TOGGLE
    },
    
    [GameStates.LEVEL_COMPLETE]: {
        'Enter': Actions.RESTART,
        'n': Actions.RESTART,
        'N': Actions.RESTART,
        'm': Actions.MAIN_MENU,
        'M': Actions.MAIN_MENU,
        'd': Actions.DEBUG_TOGGLE,
        'D': Actions.DEBUG_TOGGLE
    }
};

/**
 * Gestionnaire d'entrées.
 */
export class InputManager {
    /**
     * @param {GameStateManager} stateManager - Gestionnaire d'états
     */
    constructor(stateManager) {
        this.stateManager = stateManager;
        
        /** @type {Map<string, Function>} */
        this._actionHandlers = new Map();
        
        /** @type {Set<string>} */
        this._pressedKeys = new Set();
        
        /** @type {HTMLCanvasElement|null} */
        this._canvas = null;
        
        /** @type {boolean} */
        this._shiftPressed = false;
        
        this._setupEventListeners();
    }
    
    /**
     * Configure le canvas pour les événements souris/tactile.
     * @param {HTMLCanvasElement} canvas
     */
    setCanvas(canvas) {
        this._canvas = canvas;
        this._setupCanvasListeners();
    }
    
    /**
     * Enregistre un handler pour une action.
     * @param {string} action - Action (valeur de Actions)
     * @param {Function} handler - Fonction (action, event) => void
     */
    on(action, handler) {
        this._actionHandlers.set(action, handler);
    }
    
    /**
     * Supprime un handler pour une action.
     * @param {string} action
     */
    off(action) {
        this._actionHandlers.delete(action);
    }
    
    /**
     * Déclenche manuellement une action.
     * @param {string} action
     * @param {Event} [event]
     */
    trigger(action, event = null) {
        const handler = this._actionHandlers.get(action);
        if (handler) {
            handler(action, event);
        }
    }
    
    /**
     * Vérifie si Shift est pressé.
     * @returns {boolean}
     */
    isShiftPressed() {
        return this._shiftPressed;
    }
    
    /**
     * Configure les event listeners clavier.
     */
    _setupEventListeners() {
        document.addEventListener('keydown', (e) => this._handleKeyDown(e));
        document.addEventListener('keyup', (e) => this._handleKeyUp(e));
    }
    
    /**
     * Configure les event listeners canvas (souris/tactile).
     */
    _setupCanvasListeners() {
        if (!this._canvas) return;
        
        // Souris
        this._canvas.addEventListener('mousedown', (e) => {
            if (this.stateManager.is(GameStates.PLAYING)) {
                this.trigger(Actions.JUMP_START, e);
            }
        });
        
        this._canvas.addEventListener('mouseup', (e) => {
            this.trigger(Actions.JUMP_END, e);
        });
        
        // Tactile
        this._canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.stateManager.is(GameStates.PLAYING)) {
                this.trigger(Actions.JUMP_START, e);
            }
        });
        
        this._canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.trigger(Actions.JUMP_END, e);
        });
    }
    
    /**
     * Gère l'appui sur une touche.
     * @param {KeyboardEvent} e
     */
    _handleKeyDown(e) {
        // Éviter la répétition des touches (utiliser e.code pour la détection de répétition)
        if (this._pressedKeys.has(e.code)) return;
        this._pressedKeys.add(e.code);
        
        // Tracker Shift
        if (e.shiftKey) {
            this._shiftPressed = true;
        }
        
        const currentState = this.stateManager.current;
        const mappings = KEY_MAPPINGS[currentState];
        
        if (!mappings) return;
        
        // Chercher l'action avec e.key d'abord (pour les lettres), puis e.code (pour les touches spéciales)
        const action = mappings[e.key] || mappings[e.code];
        if (action) {
            e.preventDefault();
            this.trigger(action, e);
        }
    }
    
    /**
     * Gère le relâchement d'une touche.
     * @param {KeyboardEvent} e
     */
    _handleKeyUp(e) {
        this._pressedKeys.delete(e.code);
        
        // Tracker Shift
        if (!e.shiftKey) {
            this._shiftPressed = false;
        }
        
        // Gérer le relâchement de Space (fin de saut)
        if (e.code === 'Space') {
            this.trigger(Actions.JUMP_END, e);
        }
    }
}
