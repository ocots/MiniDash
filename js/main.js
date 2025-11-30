import { CONFIG } from './config.js';
import { GameEngine } from './engine/GameEngine.js';
import { GameStateManager, GameStates } from './engine/GameState.js';
import { InputManager, Actions } from './engine/InputManager.js';
import { Player } from './entities/Player.js';
import { LevelManager } from './levels/LevelManager.js';
import { skinManager } from './skins/index.js';

// Clés localStorage
const STORAGE_KEY = 'minidash_selected_level';
const DEBUG_STORAGE_KEY = 'minidash_debug_mode';
const SKIN_STORAGE_KEY = 'minidash_selected_skin';

/**
 * Classe principale du jeu.
 * Utilise une machine à états pour gérer les différents écrans et transitions.
 */
class Game {
    constructor() {
        // Moteur de jeu
        this.canvas = document.getElementById('gameCanvas');
        this.engine = new GameEngine(this.canvas);
        
        // Machine à états
        this.state = new GameStateManager(GameStates.MAIN_MENU);
        
        // Gestionnaire d'entrées
        this.input = new InputManager(this.state);
        this.input.setCanvas(this.canvas);
        
        // Entités
        this.player = null;
        this.obstacles = [];
        this.levelManager = new LevelManager();
        
        // Niveau sélectionné
        this.selectedLevelIndex = this.loadSelectedLevel();
        
        // Skin sélectionné
        this.loadSelectedSkin();
        
        // Mode Debug
        this.debugMode = this.loadDebugMode();
        
        // Skin selection state
        this.currentSkinCategory = 'all';
        this.skinGridColumns = 5;
        this.skinPreviewAnimationId = null;
        this.pendingSkinId = null; // Skin en cours de sélection (avant validation)
        
        // Récupérer les éléments UI
        this._initUIElements();
        
        // Configurer les callbacks d'états
        this._setupStateCallbacks();
        
        // Configurer les handlers d'actions
        this._setupActionHandlers();
        
        // Configurer les boutons UI
        this._setupUIButtons();
        
        // Initialisation
        this._init();
    }
    
    // ========== Initialisation ==========
    
    _initUIElements() {
        // Menu principal
        this.startMenuElement = document.getElementById('start-menu');
        this.startBtn = document.getElementById('start-btn');
        this.currentLevelNameElement = document.getElementById('current-level-name');
        
        // Score
        this.scoreElement = document.getElementById('score');
        
        // Game Over
        this.gameOverElement = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
        this.restartBtn = document.getElementById('restart-btn');
        this.mainMenuBtn = document.getElementById('main-menu-btn');
        
        // Level Complete
        this.levelCompleteElement = document.getElementById('level-complete');
        this.levelFinalScoreElement = document.getElementById('level-final-score');
        this.levelRestartBtn = document.getElementById('level-restart-btn');
        this.levelMainMenuBtn = document.getElementById('level-main-menu-btn');
        
        // Level Select
        this.selectLevelBtn = document.getElementById('select-level-btn');
        this.levelSelectMenu = document.getElementById('level-select-menu');
        this.levelButtonsContainer = document.getElementById('level-buttons-container');
        this.cancelLevelSelectBtn = document.getElementById('cancel-level-select-btn');
        
        // Skin Select
        this.selectSkinBtn = document.getElementById('select-skin-btn');
        this.skinSelectMenu = document.getElementById('skin-select-menu');
        this.skinGrid = document.getElementById('skin-grid');
        this.skinCategoryTabs = document.querySelectorAll('.skin-tab');
        this.skinPreviewCanvas = document.getElementById('skin-preview-canvas');
        this.skinPreviewName = document.getElementById('skin-preview-name');
        this.cancelSkinSelectBtn = document.getElementById('cancel-skin-select-btn');
        this.confirmSkinSelectBtn = document.getElementById('confirm-skin-select-btn');
        this.skinPreviewCtx = this.skinPreviewCanvas.getContext('2d');
        
        // Pause
        this.pauseMenuElement = document.getElementById('pause-menu');
        this.resumeBtn = document.getElementById('resume-btn');
        this.pauseMainMenuBtn = document.getElementById('pause-main-menu-btn');
        this.pauseMobileBtn = document.getElementById('pause-mobile-btn');
        
        // Debug
        this.debugIndicator = document.getElementById('debug-indicator');
    }
    
    _setupStateCallbacks() {
        // Callbacks d'entrée dans les états
        this.state.onEnter(GameStates.MAIN_MENU, () => this._enterMainMenu());
        this.state.onEnter(GameStates.LEVEL_SELECT, () => this._enterLevelSelect());
        this.state.onEnter(GameStates.SKIN_SELECT, () => this._enterSkinSelect());
        this.state.onEnter(GameStates.PLAYING, () => this._enterPlaying());
        this.state.onEnter(GameStates.PAUSED, () => this._enterPaused());
        this.state.onEnter(GameStates.GAME_OVER, () => this._enterGameOver());
        this.state.onEnter(GameStates.LEVEL_COMPLETE, () => this._enterLevelComplete());
        
        // Callbacks de sortie des états
        this.state.onExit(GameStates.SKIN_SELECT, () => this._exitSkinSelect());
        this.state.onExit(GameStates.PAUSED, () => this._exitPaused());
        this.state.onExit(GameStates.PLAYING, () => this._exitPlaying());
    }
    
    _setupActionHandlers() {
        // Navigation / Confirmation
        this.input.on(Actions.CONFIRM, () => this._handleConfirm());
        this.input.on(Actions.CANCEL, () => this._handleCancel());
        this.input.on(Actions.NAVIGATE_UP, () => this._handleNavigate('up'));
        this.input.on(Actions.NAVIGATE_DOWN, () => this._handleNavigate('down'));
        this.input.on(Actions.NAVIGATE_LEFT, () => this._handleNavigate('left'));
        this.input.on(Actions.NAVIGATE_RIGHT, () => this._handleNavigate('right'));
        
        // Jeu
        this.input.on(Actions.JUMP_START, () => this._handleJumpStart());
        this.input.on(Actions.JUMP_END, () => this._handleJumpEnd());
        this.input.on(Actions.PAUSE, () => this._handlePause());
        this.input.on(Actions.RESTART, () => this._handleRestart());
        this.input.on(Actions.MAIN_MENU, () => this._handleMainMenu());
        
        // Debug
        this.input.on(Actions.DEBUG_TOGGLE, () => this.toggleDebugMode());
        this.input.on(Actions.DEBUG_FORWARD, () => this._handleDebugTeleport(1));
        this.input.on(Actions.DEBUG_BACKWARD, () => this._handleDebugTeleport(-1));
    }
    
    _setupUIButtons() {
        // Menu principal
        this.startBtn.addEventListener('click', () => {
            this.state.transitionTo(GameStates.PLAYING);
        });
        
        this.selectLevelBtn.addEventListener('click', () => {
            this.state.transitionTo(GameStates.LEVEL_SELECT);
        });
        
        this.selectSkinBtn.addEventListener('click', () => {
            this.state.transitionTo(GameStates.SKIN_SELECT);
        });
        
        // Level Select
        this.cancelLevelSelectBtn.addEventListener('click', () => {
            this.state.transitionTo(GameStates.MAIN_MENU);
        });
        
        // Skin Select
        this.cancelSkinSelectBtn.addEventListener('click', () => {
            this._cancelSkinSelection();
            this.state.transitionTo(GameStates.MAIN_MENU);
        });
        
        if (this.confirmSkinSelectBtn) {
            this.confirmSkinSelectBtn.addEventListener('click', () => {
                this._confirmSkinSelection();
                this.state.transitionTo(GameStates.MAIN_MENU);
            });
        }
        
        // Onglets de catégorie de skin
        this.skinCategoryTabs.forEach(tab => {
            tab.addEventListener('click', () => this._filterSkinsByCategory(tab.dataset.category));
        });
        
        // Game Over
        this.restartBtn.addEventListener('click', () => this._handleRestart());
        if (this.mainMenuBtn) {
            this.mainMenuBtn.addEventListener('click', () => this._handleMainMenu());
        }
        
        // Level Complete
        if (this.levelRestartBtn) {
            this.levelRestartBtn.addEventListener('click', () => this._handleRestart());
        }
        if (this.levelMainMenuBtn) {
            this.levelMainMenuBtn.addEventListener('click', () => this._handleMainMenu());
        }
        
        // Pause
        if (this.resumeBtn) {
            this.resumeBtn.addEventListener('click', () => this._handlePause());
        }
        if (this.pauseMainMenuBtn) {
            this.pauseMainMenuBtn.addEventListener('click', () => this._handleMainMenu());
        }
        if (this.pauseMobileBtn) {
            this.pauseMobileBtn.addEventListener('click', () => this._handlePause());
        }
    }
    
    _init() {
        this.updateDebugIndicator();
        this._generateLevelButtons();
        this._updateLevelNameDisplay();
        this._prepareLevel();
        this.engine.render();
    }
    
    // ========== Handlers d'actions ==========
    
    _handleConfirm() {
        switch (this.state.current) {
            case GameStates.MAIN_MENU:
                this.state.transitionTo(GameStates.PLAYING);
                break;
            case GameStates.LEVEL_SELECT:
                // La sélection se fait au clic sur un niveau
                this.state.transitionTo(GameStates.MAIN_MENU);
                break;
            case GameStates.SKIN_SELECT:
                this._confirmSkinSelection();
                this.state.transitionTo(GameStates.MAIN_MENU);
                break;
        }
    }
    
    _handleCancel() {
        switch (this.state.current) {
            case GameStates.LEVEL_SELECT:
                this.state.transitionTo(GameStates.MAIN_MENU);
                break;
            case GameStates.SKIN_SELECT:
                this._cancelSkinSelection();
                this.state.transitionTo(GameStates.MAIN_MENU);
                break;
        }
    }
    
    _handleNavigate(direction) {
        if (this.state.is(GameStates.SKIN_SELECT)) {
            this._navigateSkinGrid(direction);
        }
    }
    
    _handleJumpStart() {
        if (this.state.is(GameStates.PLAYING) && this.player) {
            this.player.startJump();
        }
    }
    
    _handleJumpEnd() {
        if (this.player) {
            this.player.stopJump();
        }
    }
    
    _handlePause() {
        if (this.state.is(GameStates.PLAYING)) {
            this.state.transitionTo(GameStates.PAUSED);
        } else if (this.state.is(GameStates.PAUSED)) {
            this.state.transitionTo(GameStates.PLAYING);
        }
    }
    
    _handleRestart() {
        if (this.state.isAnyOf(GameStates.GAME_OVER, GameStates.LEVEL_COMPLETE)) {
            this._restart();
            this.state.forceState(GameStates.PLAYING);
            this._enterPlaying();
        }
    }
    
    _handleMainMenu() {
        if (this.state.isAnyOf(GameStates.PAUSED, GameStates.GAME_OVER, GameStates.LEVEL_COMPLETE)) {
            this._resetGame();
            this.state.forceState(GameStates.MAIN_MENU);
            this._enterMainMenu();
        }
    }
    
    _handleDebugTeleport(direction) {
        if (!this.debugMode || !this.state.is(GameStates.PAUSED)) return;
        
        const speed = this.input.isShiftPressed() 
            ? CONFIG.DEBUG.TELEPORT_SPEED_FAST 
            : CONFIG.DEBUG.TELEPORT_SPEED;
        
        this._debugTeleport(direction * speed);
    }
    
    // ========== Callbacks d'entrée/sortie d'états ==========
    
    _enterMainMenu() {
        // Cacher tous les autres menus
        this._hideAllMenus();
        
        // Afficher le menu principal
        this.startMenuElement.classList.remove('hidden');
        this.scoreElement.classList.add('hidden');
        
        // Cacher le bouton pause mobile
        if (this.pauseMobileBtn) {
            this.pauseMobileBtn.classList.add('hidden');
        }
        
        // Préparer le niveau pour l'aperçu
        this._prepareLevel();
        this.engine.render();
    }
    
    _enterLevelSelect() {
        this.startMenuElement.classList.add('hidden');
        this.levelSelectMenu.classList.remove('hidden');
        
        // Mettre à jour le bouton "current"
        const buttons = this.levelButtonsContainer.querySelectorAll('.level-select-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('current', parseInt(btn.dataset.levelIndex) === this.selectedLevelIndex);
        });
    }
    
    _enterSkinSelect() {
        this.startMenuElement.classList.add('hidden');
        this.skinSelectMenu.classList.remove('hidden');
        
        // Sauvegarder le skin actuel au cas où on annule
        this.pendingSkinId = skinManager.currentSkinId;
        
        // Générer la grille et démarrer l'animation
        this._generateSkinGrid();
        this._startSkinPreviewAnimation();
    }
    
    _exitSkinSelect() {
        this._stopSkinPreviewAnimation();
        this.skinSelectMenu.classList.add('hidden');
    }
    
    _enterPlaying() {
        this._hideAllMenus();
        this.scoreElement.classList.remove('hidden');
        
        // Afficher le bouton pause mobile
        if (this.pauseMobileBtn) {
            this.pauseMobileBtn.classList.remove('hidden');
        }
        
        // Démarrer le moteur si nécessaire
        if (!this.engine.isRunning) {
            this.engine.start();
        }
        
        // Démarrer la boucle de jeu
        this._gameLoop();
    }
    
    _exitPlaying() {
        this.engine.stop();
        if (this.player) {
            this.player.stopJump();
        }
    }
    
    _enterPaused() {
        this.engine.stop();
        
        // En mode Debug, pas de menu ni de flou
        if (!this.debugMode) {
            this.canvas.classList.add('paused');
            if (this.pauseMenuElement) {
                this.pauseMenuElement.classList.remove('hidden');
            }
            if (this.pauseMobileBtn) {
                this.pauseMobileBtn.classList.add('hidden');
            }
        }
    }
    
    _exitPaused() {
        this.canvas.classList.remove('paused');
        if (this.pauseMenuElement) {
            this.pauseMenuElement.classList.add('hidden');
        }
        if (this.pauseMobileBtn) {
            this.pauseMobileBtn.classList.remove('hidden');
        }
    }
    
    _enterGameOver() {
        this.engine.stop();
        if (this.player) {
            this.player.stopJump();
        }
        
        if (this.pauseMobileBtn) {
            this.pauseMobileBtn.classList.add('hidden');
        }
        
        const distance = this.engine.getDistance();
        this.finalScoreElement.textContent = distance;
        this.gameOverElement.classList.remove('hidden');
    }
    
    _enterLevelComplete() {
        this.engine.stop();
        if (this.player) {
            this.player.stopJump();
        }
        
        if (this.pauseMobileBtn) {
            this.pauseMobileBtn.classList.add('hidden');
        }
        
        const distance = this.engine.getDistance();
        if (this.levelFinalScoreElement && this.levelCompleteElement) {
            this.levelFinalScoreElement.textContent = distance;
            this.levelCompleteElement.classList.remove('hidden');
        }
    }
    
    _hideAllMenus() {
        this.startMenuElement.classList.add('hidden');
        this.levelSelectMenu.classList.add('hidden');
        this.skinSelectMenu.classList.add('hidden');
        this.gameOverElement.classList.add('hidden');
        if (this.levelCompleteElement) {
            this.levelCompleteElement.classList.add('hidden');
        }
        if (this.pauseMenuElement) {
            this.pauseMenuElement.classList.add('hidden');
        }
        this.canvas.classList.remove('paused');
    }
    
    // ========== Gestion du niveau ==========
    
    _prepareLevel() {
        this.engine.entities = [];
        this.engine.distance = 0;
        
        // Créer le joueur
        this.player = new Player();
        this.engine.addEntity(this.player);
        
        // Charger le niveau
        this.levelManager.loadLevel(this.selectedLevelIndex);
        this.obstacles = this.levelManager.createObstaclesForLevel();
        
        for (const obstacle of this.obstacles) {
            this.engine.addEntity(obstacle);
        }
        
        console.log(`Niveau chargé: ${this.levelManager.getLevelName()}`);
    }
    
    _restart() {
        this._hideAllMenus();
        this._prepareLevel();
        this.scoreElement.classList.remove('hidden');
        
        if (this.pauseMobileBtn) {
            this.pauseMobileBtn.classList.remove('hidden');
        }
    }
    
    _resetGame() {
        this.engine.stop();
        this.engine.entities = [];
        this.engine.distance = 0;
    }
    
    _generateLevelButtons() {
        const levels = this.levelManager.getLevelsList();
        this.levelButtonsContainer.innerHTML = '';
        
        for (const level of levels) {
            const btn = document.createElement('button');
            btn.className = 'level-select-btn';
            btn.textContent = level.name;
            btn.dataset.levelIndex = level.index;
            
            if (level.index === this.selectedLevelIndex) {
                btn.classList.add('current');
            }
            
            btn.addEventListener('click', () => this._selectLevel(level.index));
            this.levelButtonsContainer.appendChild(btn);
        }
    }
    
    _selectLevel(index) {
        this.selectedLevelIndex = index;
        this._saveSelectedLevel(index);
        this._updateLevelNameDisplay();
        
        // Recharger le niveau
        this._prepareLevel();
        this.engine.render();
        
        this.state.transitionTo(GameStates.MAIN_MENU);
    }
    
    _updateLevelNameDisplay() {
        this.levelManager.loadLevel(this.selectedLevelIndex);
        this.currentLevelNameElement.textContent = this.levelManager.getLevelName();
    }
    
    // ========== Gestion des skins ==========
    
    _generateSkinGrid() {
        this.skinGrid.innerHTML = '';
        
        const skins = Array.from(skinManager.skins.values());
        const filteredSkins = this.currentSkinCategory === 'all'
            ? skins
            : skins.filter(skin => skin.type === this.currentSkinCategory);
        
        for (const skin of filteredSkins) {
            const item = document.createElement('div');
            item.className = 'skin-item';
            item.dataset.skinId = skin.id;
            
            if (skin.type === 'dynamic') {
                item.classList.add('animated');
            }
            
            if (skin.id === skinManager.currentSkinId) {
                item.classList.add('selected');
            }
            
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            item.appendChild(canvas);
            
            this._drawSkinPreviewOnCanvas(skin, canvas);
            item.addEventListener('click', () => this._selectSkinInGrid(skin.id));
            
            this.skinGrid.appendChild(item);
        }
    }
    
    _selectSkinInGrid(skinId) {
        skinManager.setCurrentSkin(skinId);
        
        // Mettre à jour la sélection visuelle
        const items = this.skinGrid.querySelectorAll('.skin-item');
        items.forEach(item => {
            item.classList.toggle('selected', item.dataset.skinId === skinId);
        });
        
        // Mettre à jour le nom
        const skin = skinManager.getCurrentSkin();
        this.skinPreviewName.textContent = skin.name;
    }
    
    _confirmSkinSelection() {
        // Sauvegarder le skin sélectionné
        this._saveSelectedSkin(skinManager.currentSkinId);
        this.pendingSkinId = null;
    }
    
    _cancelSkinSelection() {
        // Restaurer le skin précédent
        if (this.pendingSkinId) {
            skinManager.setCurrentSkin(this.pendingSkinId);
        }
        this.pendingSkinId = null;
    }
    
    _navigateSkinGrid(direction) {
        const items = Array.from(this.skinGrid.querySelectorAll('.skin-item'));
        if (items.length === 0) return;
        
        const currentIndex = items.findIndex(item => item.dataset.skinId === skinManager.currentSkinId);
        const cols = this.skinGridColumns;
        const rows = Math.ceil(items.length / cols);
        
        let row = Math.floor(currentIndex / cols);
        let col = currentIndex % cols;
        
        // Comportement tore
        switch (direction) {
            case 'up':
                row = (row - 1 + rows) % rows;
                break;
            case 'down':
                row = (row + 1) % rows;
                break;
            case 'left':
                col = (col - 1 + cols) % cols;
                break;
            case 'right':
                col = (col + 1) % cols;
                break;
        }
        
        let newIndex = row * cols + col;
        
        // Gérer la dernière ligne incomplète
        if (newIndex >= items.length) {
            if (direction === 'down') {
                newIndex = col;
            } else if (direction === 'right') {
                newIndex = ((row + 1) % rows) * cols;
                if (newIndex >= items.length) newIndex = 0;
            } else if (direction === 'up') {
                const lastRowForCol = Math.floor((items.length - 1) / cols);
                const lastIndexInCol = lastRowForCol * cols + col;
                newIndex = lastIndexInCol < items.length ? lastIndexInCol : items.length - 1;
            }
        }
        
        if (newIndex >= 0 && newIndex < items.length) {
            const newSkinId = items[newIndex].dataset.skinId;
            this._selectSkinInGrid(newSkinId);
            items[newIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    
    _filterSkinsByCategory(category) {
        this.currentSkinCategory = category;
        
        this.skinCategoryTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === category);
        });
        
        this._generateSkinGrid();
    }
    
    _drawSkinPreviewOnCanvas(skin, canvas) {
        const ctx = canvas.getContext('2d');
        const size = canvas.width;
        
        ctx.clearRect(0, 0, size, size);
        
        if (skin.type === 'static' || skin.type === 'image') {
            this._drawSkinDirectly(ctx, skin, 0, 0, size, size);
        } else if (skin.type === 'dynamic') {
            const frameFn = skin.frames[0];
            if (typeof frameFn === 'function') {
                frameFn(ctx, 0, 0, size, size, {}, skin.state);
            }
            if (skin.borderColor) {
                ctx.strokeStyle = skin.borderColor;
                ctx.lineWidth = 2;
                ctx.strokeRect(0, 0, size, size);
            }
        }
    }
    
    _drawSkinDirectly(ctx, skin, x, y, w, h) {
        if (skin.color) {
            ctx.fillStyle = skin.color;
            ctx.fillRect(x, y, w, h);
            if (skin.borderColor) {
                ctx.strokeStyle = skin.borderColor;
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, w, h);
            }
        } else if (skin.loaded && skin.image) {
            ctx.drawImage(skin.image, x, y, w, h);
        } else {
            ctx.fillStyle = '#888';
            ctx.fillRect(x, y, w, h);
        }
    }
    
    _startSkinPreviewAnimation() {
        const skin = skinManager.getCurrentSkin();
        this.skinPreviewName.textContent = skin.name;
        
        const animate = () => {
            const dt = 1 / 60;
            
            // Mettre à jour tous les skins dynamiques
            for (const skin of skinManager.skins.values()) {
                if (skin.type === 'dynamic') {
                    skin.update(dt);
                }
            }
            
            // Dessiner la prévisualisation principale
            const ctx = this.skinPreviewCtx;
            const size = this.skinPreviewCanvas.width;
            
            ctx.clearRect(0, 0, size, size);
            
            const currentSkin = skinManager.getCurrentSkin();
            if (currentSkin.type === 'dynamic') {
                const frameFn = currentSkin.frames[currentSkin.frameIndex];
                if (typeof frameFn === 'function') {
                    frameFn(ctx, 0, 0, size, size, {}, currentSkin.state);
                }
                if (currentSkin.borderColor) {
                    ctx.strokeStyle = currentSkin.borderColor;
                    ctx.lineWidth = 2;
                    ctx.strokeRect(0, 0, size, size);
                }
            } else {
                this._drawSkinDirectly(ctx, currentSkin, 0, 0, size, size);
            }
            
            // Mettre à jour les miniatures animées
            const animatedItems = this.skinGrid.querySelectorAll('.skin-item.animated');
            animatedItems.forEach(item => {
                const skinId = item.dataset.skinId;
                const skin = skinManager.get(skinId);
                if (skin && skin.type === 'dynamic') {
                    const canvas = item.querySelector('canvas');
                    if (canvas) {
                        const miniCtx = canvas.getContext('2d');
                        miniCtx.clearRect(0, 0, 64, 64);
                        const frameFn = skin.frames[skin.frameIndex];
                        if (typeof frameFn === 'function') {
                            frameFn(miniCtx, 0, 0, 64, 64, {}, skin.state);
                        }
                        if (skin.borderColor) {
                            miniCtx.strokeStyle = skin.borderColor;
                            miniCtx.lineWidth = 2;
                            miniCtx.strokeRect(0, 0, 64, 64);
                        }
                    }
                }
            });
            
            this.skinPreviewAnimationId = requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    _stopSkinPreviewAnimation() {
        if (this.skinPreviewAnimationId) {
            cancelAnimationFrame(this.skinPreviewAnimationId);
            this.skinPreviewAnimationId = null;
        }
    }
    
    // ========== Boucle de jeu ==========
    
    _gameLoop = () => {
        if (!this.state.is(GameStates.PLAYING)) return;
        
        // Nettoyer les obstacles hors écran (sauf en mode Debug)
        if (!this.debugMode) {
            this.obstacles = this.obstacles.filter(obstacle => {
                if (obstacle.isOffScreen()) {
                    this.engine.removeEntity(obstacle);
                    return false;
                }
                return true;
            });
        }
        
        // Résoudre les collisions physiques
        for (const obstacle of this.obstacles) {
            obstacle.resolveCollision(this.player);
        }
        
        const distance = this.engine.getDistance();
        
        // Vérifier les collisions mortelles
        for (const obstacle of this.obstacles) {
            if (obstacle.checkCollision(this.player)) {
                if (this.debugMode) {
                    this.player.collisionFlashTimer = CONFIG.DEBUG.COLLISION_FLASH_DURATION;
                } else {
                    this.scoreElement.textContent = `Distance: ${distance}m`;
                    this.state.transitionTo(GameStates.GAME_OVER);
                    return;
                }
            }
        }
        
        // Vérifier la ligne d'arrivée
        for (const obstacle of this.obstacles) {
            if (obstacle.type === 'finish' && typeof obstacle.hasPlayerPassed === 'function') {
                if (obstacle.hasPlayerPassed(this.player)) {
                    this.scoreElement.textContent = `Distance: ${distance}m`;
                    this.state.transitionTo(GameStates.LEVEL_COMPLETE);
                    return;
                }
            }
        }
        
        // Mettre à jour le score
        this.scoreElement.textContent = `Distance: ${distance}m`;
        
        requestAnimationFrame(this._gameLoop);
    }
    
    // ========== Debug ==========
    
    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        this._saveDebugMode(this.debugMode);
        this.updateDebugIndicator();
        console.log(`Mode Debug: ${this.debugMode ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`);
    }
    
    updateDebugIndicator() {
        if (this.debugIndicator) {
            this.debugIndicator.classList.toggle('hidden', !this.debugMode);
        }
    }
    
    _debugTeleport(deltaMeters) {
        const deltaUnits = deltaMeters * CONFIG.UNITS_PER_METER;
        
        for (const obstacle of this.obstacles) {
            obstacle.x -= deltaUnits;
            
            if (obstacle.carriedObstacles) {
                for (const carried of obstacle.carriedObstacles) {
                    carried.x = obstacle.x + carried._relativeX;
                }
            }
        }
        
        this.engine.distance += deltaMeters;
        if (this.engine.distance < 0) this.engine.distance = 0;
        
        // Vérifier les collisions pour le flash visuel
        for (const obstacle of this.obstacles) {
            if (obstacle.checkCollision && obstacle.checkCollision(this.player)) {
                this.player.collisionFlashTimer = CONFIG.DEBUG.COLLISION_FLASH_DURATION;
                break;
            }
        }
        
        this.scoreElement.textContent = `Distance: ${this.engine.getDistance()}m`;
        this.engine.render();
    }
    
    // ========== LocalStorage ==========
    
    loadSelectedLevel() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved !== null) {
                const index = parseInt(saved, 10);
                if (!isNaN(index) && index >= 0) {
                    return index;
                }
            }
        } catch (e) {
            console.warn('Impossible de lire localStorage:', e);
        }
        return 0;
    }
    
    _saveSelectedLevel(index) {
        try {
            localStorage.setItem(STORAGE_KEY, index.toString());
        } catch (e) {
            console.warn('Impossible d\'écrire dans localStorage:', e);
        }
    }
    
    loadSelectedSkin() {
        try {
            const saved = localStorage.getItem(SKIN_STORAGE_KEY);
            if (saved && skinManager.get(saved)) {
                skinManager.setCurrentSkin(saved);
            }
        } catch (e) {
            console.warn('Impossible de lire le skin depuis localStorage:', e);
        }
    }
    
    _saveSelectedSkin(skinId) {
        try {
            localStorage.setItem(SKIN_STORAGE_KEY, skinId);
        } catch (e) {
            console.warn('Impossible d\'enregistrer le skin:', e);
        }
    }
    
    loadDebugMode() {
        try {
            const saved = localStorage.getItem(DEBUG_STORAGE_KEY);
            return saved === 'true';
        } catch (e) {
            return false;
        }
    }
    
    _saveDebugMode(enabled) {
        try {
            localStorage.setItem(DEBUG_STORAGE_KEY, enabled.toString());
        } catch (e) {
            console.warn('Impossible d\'enregistrer le mode debug:', e);
        }
    }
}

// Démarrer le jeu
new Game();
