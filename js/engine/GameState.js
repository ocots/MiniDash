/**
 * Machine à états pour gérer les différents états du jeu.
 * 
 * Chaque état définit :
 * - Les transitions possibles vers d'autres états
 * - Les actions d'entrée (onEnter) et de sortie (onExit)
 * 
 * Cela garantit que le jeu est toujours dans un état cohérent
 * et que les transitions sont explicitement définies.
 */

/**
 * Énumération des états possibles du jeu.
 */
export const GameStates = Object.freeze({
    MAIN_MENU: 'main_menu',
    LEVEL_SELECT: 'level_select',
    SKIN_SELECT: 'skin_select',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over',
    LEVEL_COMPLETE: 'level_complete'
});

/**
 * Définition des transitions valides entre états.
 * Format: { [étatSource]: [étatsDestinationPossibles] }
 */
const VALID_TRANSITIONS = Object.freeze({
    [GameStates.MAIN_MENU]: [
        GameStates.PLAYING,
        GameStates.LEVEL_SELECT,
        GameStates.SKIN_SELECT
    ],
    [GameStates.LEVEL_SELECT]: [
        GameStates.MAIN_MENU
    ],
    [GameStates.SKIN_SELECT]: [
        GameStates.MAIN_MENU
    ],
    [GameStates.PLAYING]: [
        GameStates.PAUSED,
        GameStates.GAME_OVER,
        GameStates.LEVEL_COMPLETE
    ],
    [GameStates.PAUSED]: [
        GameStates.PLAYING,
        GameStates.MAIN_MENU
    ],
    [GameStates.GAME_OVER]: [
        GameStates.PLAYING,  // restart
        GameStates.MAIN_MENU
    ],
    [GameStates.LEVEL_COMPLETE]: [
        GameStates.PLAYING,  // restart
        GameStates.MAIN_MENU
    ]
});

/**
 * Gestionnaire de la machine à états.
 */
export class GameStateManager {
    /**
     * @param {string} initialState - État initial (doit être une valeur de GameStates)
     */
    constructor(initialState = GameStates.MAIN_MENU) {
        if (!Object.values(GameStates).includes(initialState)) {
            throw new Error(`État initial invalide: ${initialState}`);
        }
        
        /** @type {string} */
        this._currentState = initialState;
        
        /** @type {string|null} */
        this._previousState = null;
        
        /** @type {Map<string, Function>} */
        this._onEnterCallbacks = new Map();
        
        /** @type {Map<string, Function>} */
        this._onExitCallbacks = new Map();
        
        /** @type {Array<Function>} */
        this._onChangeCallbacks = [];
    }
    
    /**
     * Retourne l'état actuel.
     * @returns {string}
     */
    get current() {
        return this._currentState;
    }
    
    /**
     * Retourne l'état précédent.
     * @returns {string|null}
     */
    get previous() {
        return this._previousState;
    }
    
    /**
     * Vérifie si on est dans un état donné.
     * @param {string} state - État à vérifier
     * @returns {boolean}
     */
    is(state) {
        return this._currentState === state;
    }
    
    /**
     * Vérifie si on est dans l'un des états donnés.
     * @param {...string} states - États à vérifier
     * @returns {boolean}
     */
    isAnyOf(...states) {
        return states.includes(this._currentState);
    }
    
    /**
     * Vérifie si une transition vers un état est valide.
     * @param {string} targetState - État cible
     * @returns {boolean}
     */
    canTransitionTo(targetState) {
        const validTargets = VALID_TRANSITIONS[this._currentState];
        return validTargets && validTargets.includes(targetState);
    }
    
    /**
     * Effectue une transition vers un nouvel état.
     * @param {string} newState - Nouvel état
     * @returns {boolean} True si la transition a réussi
     */
    transitionTo(newState) {
        if (!Object.values(GameStates).includes(newState)) {
            console.error(`État invalide: ${newState}`);
            return false;
        }
        
        if (!this.canTransitionTo(newState)) {
            console.warn(`Transition invalide: ${this._currentState} → ${newState}`);
            return false;
        }
        
        const oldState = this._currentState;
        
        // Callback de sortie de l'ancien état
        const onExit = this._onExitCallbacks.get(oldState);
        if (onExit) {
            onExit(oldState, newState);
        }
        
        // Effectuer la transition
        this._previousState = oldState;
        this._currentState = newState;
        
        // Callback d'entrée dans le nouvel état
        const onEnter = this._onEnterCallbacks.get(newState);
        if (onEnter) {
            onEnter(newState, oldState);
        }
        
        // Callbacks généraux de changement d'état
        for (const callback of this._onChangeCallbacks) {
            callback(newState, oldState);
        }
        
        console.log(`État: ${oldState} → ${newState}`);
        return true;
    }
    
    /**
     * Force un état sans vérifier les transitions (à utiliser avec précaution).
     * Utile pour l'initialisation ou le reset.
     * @param {string} state - État à forcer
     */
    forceState(state) {
        if (!Object.values(GameStates).includes(state)) {
            throw new Error(`État invalide: ${state}`);
        }
        
        const oldState = this._currentState;
        this._previousState = oldState;
        this._currentState = state;
        
        console.log(`État forcé: ${oldState} → ${state}`);
    }
    
    /**
     * Enregistre un callback appelé à l'entrée dans un état.
     * @param {string} state - État concerné
     * @param {Function} callback - Fonction (newState, oldState) => void
     */
    onEnter(state, callback) {
        this._onEnterCallbacks.set(state, callback);
    }
    
    /**
     * Enregistre un callback appelé à la sortie d'un état.
     * @param {string} state - État concerné
     * @param {Function} callback - Fonction (oldState, newState) => void
     */
    onExit(state, callback) {
        this._onExitCallbacks.set(state, callback);
    }
    
    /**
     * Enregistre un callback appelé à chaque changement d'état.
     * @param {Function} callback - Fonction (newState, oldState) => void
     */
    onChange(callback) {
        this._onChangeCallbacks.push(callback);
    }
}
