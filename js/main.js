import { CONFIG } from './config.js';
import { GameEngine } from './engine/GameEngine.js';
import { Player } from './entities/Player.js';
import { LevelManager } from './levels/LevelManager.js';
import { skinManager } from './skins/index.js';

// Clés localStorage
const STORAGE_KEY = 'minidash_selected_level';
const DEBUG_STORAGE_KEY = 'minidash_debug_mode';
const SKIN_STORAGE_KEY = 'minidash_selected_skin';

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.engine = new GameEngine(this.canvas);
        this.player = null;
        this.obstacles = [];
        this.levelManager = new LevelManager();
        this.gameOver = false;
        this.paused = false;
        this.started = false;  // Le jeu n'a pas encore commencé
        this.levelSelectOpen = false;  // Menu de sélection de niveau ouvert
        this.skinSelectOpen = false;    // Menu de sélection de skin ouvert
        
        // Niveau sélectionné (récupéré depuis localStorage ou 0 par défaut)
        this.selectedLevelIndex = this.loadSelectedLevel();
        
        // Skin sélectionné (récupéré depuis localStorage)
        this.loadSelectedSkin();
        
        // Mode Debug
        this.debugMode = this.loadDebugMode();
        
        // Éléments UI
        this.startMenuElement = document.getElementById('start-menu');
        this.startBtn = document.getElementById('start-btn');
        this.scoreElement = document.getElementById('score');
        this.gameOverElement = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
        this.restartBtn = document.getElementById('restart-btn');
        
        this.levelCompleteElement = document.getElementById('level-complete');
        this.levelFinalScoreElement = document.getElementById('level-final-score');
        this.levelRestartBtn = document.getElementById('level-restart-btn');
        
        // Éléments UI pour la sélection de niveau
        this.selectLevelBtn = document.getElementById('select-level-btn');
        this.levelSelectMenu = document.getElementById('level-select-menu');
        this.levelButtonsContainer = document.getElementById('level-buttons-container');
        this.cancelLevelSelectBtn = document.getElementById('cancel-level-select-btn');
        this.currentLevelNameElement = document.getElementById('current-level-name');
        
        // Boutons retour au menu principal
        this.mainMenuBtn = document.getElementById('main-menu-btn');
        this.levelMainMenuBtn = document.getElementById('level-main-menu-btn');
        
        // Éléments UI pour la sélection de skin
        this.selectSkinBtn = document.getElementById('select-skin-btn');
        this.skinSelectMenu = document.getElementById('skin-select-menu');
        this.skinGrid = document.getElementById('skin-grid');
        this.skinCategoryTabs = document.querySelectorAll('.skin-tab');
        this.skinPreviewCanvas = document.getElementById('skin-preview-canvas');
        this.skinPreviewName = document.getElementById('skin-preview-name');
        this.cancelSkinSelectBtn = document.getElementById('cancel-skin-select-btn');
        this.skinPreviewCtx = this.skinPreviewCanvas.getContext('2d');
        this.skinPreviewAnimationId = null;
        this.currentSkinCategory = 'all';
        this.skinGridColumns = 5; // Nombre de colonnes dans la grille
        
        // Éléments UI pour le menu pause
        this.pauseMenuElement = document.getElementById('pause-menu');
        this.resumeBtn = document.getElementById('resume-btn');
        this.pauseMainMenuBtn = document.getElementById('pause-main-menu-btn');
        this.pauseMobileBtn = document.getElementById('pause-mobile-btn');
        
        // Élément UI pour le mode Debug
        this.debugIndicator = document.getElementById('debug-indicator');
        
        this.init();
    }
    
    init() {
        // Initialiser l'indicateur de debug
        this.updateDebugIndicator();
        
        // Générer les boutons de sélection de niveau
        this.generateLevelButtons();
        
        // Mettre à jour l'affichage du nom du niveau
        this.updateLevelNameDisplay();
        
        // Préparer le niveau (mais ne pas démarrer)
        this.prepareLevel();
        
        // Contrôles
        this.setupControls();
        
        // Bouton start
        this.startBtn.addEventListener('click', () => this.startGame());
        
        // Bouton restart (game over)
        this.restartBtn.addEventListener('click', () => this.restart());
        // Bouton restart (fin de niveau)
        if (this.levelRestartBtn) {
            this.levelRestartBtn.addEventListener('click', () => this.restart());
        }
        
        // Boutons de sélection de niveau
        this.selectLevelBtn.addEventListener('click', () => this.openLevelSelect());
        this.cancelLevelSelectBtn.addEventListener('click', () => this.closeLevelSelect());
        
        // Boutons de sélection de skin
        this.selectSkinBtn.addEventListener('click', () => this.openSkinSelect());
        this.cancelSkinSelectBtn.addEventListener('click', () => this.closeSkinSelect());
        
        // Onglets de catégorie de skin
        this.skinCategoryTabs.forEach(tab => {
            tab.addEventListener('click', () => this.filterSkinsByCategory(tab.dataset.category));
        });
        
        // Navigation clavier dans le menu skin
        document.addEventListener('keydown', (e) => this.handleSkinNavigation(e));
        
        // Boutons retour au menu principal
        if (this.mainMenuBtn) {
            this.mainMenuBtn.addEventListener('click', () => this.goToMainMenu());
        }
        if (this.levelMainMenuBtn) {
            this.levelMainMenuBtn.addEventListener('click', () => this.goToMainMenu());
        }
        
        // Boutons du menu pause
        if (this.resumeBtn) {
            this.resumeBtn.addEventListener('click', () => this.togglePause());
        }
        if (this.pauseMainMenuBtn) {
            this.pauseMainMenuBtn.addEventListener('click', () => this.goToMainMenuFromPause());
        }
        if (this.pauseMobileBtn) {
            this.pauseMobileBtn.addEventListener('click', () => this.togglePause());
        }
        
        // Afficher le menu et faire un premier rendu statique
        this.engine.render();
    }
    
    // ========== Gestion du mode Debug ==========
    
    loadDebugMode() {
        try {
            const saved = localStorage.getItem(DEBUG_STORAGE_KEY);
            return saved === 'true';
        } catch (e) {
            return false;
        }
    }
    
    saveDebugMode(enabled) {
        try {
            localStorage.setItem(DEBUG_STORAGE_KEY, enabled.toString());
        } catch (e) {
            console.warn('Impossible d\'enregistrer le mode debug:', e);
        }
    }
    
    toggleDebugMode() {
        this.debugMode = !this.debugMode;
        this.saveDebugMode(this.debugMode);
        this.updateDebugIndicator();
        console.log(`Mode Debug: ${this.debugMode ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`);
    }
    
    updateDebugIndicator() {
        if (this.debugIndicator) {
            if (this.debugMode) {
                this.debugIndicator.classList.remove('hidden');
            } else {
                this.debugIndicator.classList.add('hidden');
            }
        }
    }
    
    /**
     * Téléporte le niveau (déplace tous les obstacles) en mode Debug + Pause.
     * @param {number} deltaMeters - Distance en mètres (>0 = avancer, <0 = reculer)
     */
    debugTeleport(deltaMeters) {
        if (!this.debugMode || !this.paused) return;
        
        const deltaUnits = deltaMeters * CONFIG.UNITS_PER_METER;
        
        // Déplacer tous les obstacles
        for (const obstacle of this.obstacles) {
            obstacle.x -= deltaUnits;
            
            // Mettre à jour les obstacles portés (PlateformeAir, RectangleLarge)
            if (obstacle.carriedObstacles) {
                for (const carried of obstacle.carriedObstacles) {
                    carried.x = obstacle.x + carried._relativeX;
                }
            }
        }
        
        // Mettre à jour la distance affichée
        this.engine.distance += deltaMeters;
        if (this.engine.distance < 0) this.engine.distance = 0;
        
        // Vérifier les collisions pour l'indicateur visuel
        this.checkDebugCollisions();
        
        // Mettre à jour l'affichage
        this.scoreElement.textContent = `Distance: ${this.engine.getDistance()}m`;
        this.engine.render();
    }
    
    /**
     * Vérifie les collisions en mode Debug et déclenche le flash visuel.
     */
    checkDebugCollisions() {
        if (!this.debugMode) return;
        
        for (const obstacle of this.obstacles) {
            if (obstacle.checkCollision && obstacle.checkCollision(this.player)) {
                // Déclencher le flash de collision
                this.player.collisionFlashTimer = CONFIG.DEBUG.COLLISION_FLASH_DURATION;
                return;
            }
        }
    }
    
    // ========== Gestion de la sélection de niveau ==========
    
    loadSelectedLevel() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved !== null) {
                const index = parseInt(saved, 10);
                // Vérifier que l'index est valide
                if (!isNaN(index) && index >= 0) {
                    return index;
                }
            }
        } catch (e) {
            console.warn('Impossible de lire localStorage:', e);
        }
        return 0;
    }
    
    saveSelectedLevel(index) {
        try {
            localStorage.setItem(STORAGE_KEY, index.toString());
        } catch (e) {
            console.warn('Impossible d\'écrire dans localStorage:', e);
        }
    }
    
    generateLevelButtons() {
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
            
            btn.addEventListener('click', () => this.selectLevel(level.index));
            this.levelButtonsContainer.appendChild(btn);
        }
    }
    
    updateLevelNameDisplay() {
        // Charger temporairement le niveau pour obtenir son nom
        this.levelManager.loadLevel(this.selectedLevelIndex);
        const levelName = this.levelManager.getLevelName();
        this.currentLevelNameElement.textContent = levelName;
    }
    
    openLevelSelect() {
        this.levelSelectOpen = true;
        this.startMenuElement.classList.add('hidden');
        this.levelSelectMenu.classList.remove('hidden');
        
        // Mettre à jour le bouton "current"
        const buttons = this.levelButtonsContainer.querySelectorAll('.level-select-btn');
        buttons.forEach(btn => {
            btn.classList.toggle('current', parseInt(btn.dataset.levelIndex) === this.selectedLevelIndex);
        });
    }
    
    closeLevelSelect() {
        this.levelSelectOpen = false;
        this.levelSelectMenu.classList.add('hidden');
        this.startMenuElement.classList.remove('hidden');
    }
    
    selectLevel(index) {
        this.selectedLevelIndex = index;
        this.saveSelectedLevel(index);
        this.updateLevelNameDisplay();
        
        // Recharger le niveau dans le moteur
        this.engine.entities = [];
        this.engine.distance = 0;
        this.prepareLevel();
        this.engine.render();
        
        this.closeLevelSelect();
    }
    
    // ========== Gestion de la sélection de skin ==========
    
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
    
    saveSelectedSkin(skinId) {
        try {
            localStorage.setItem(SKIN_STORAGE_KEY, skinId);
        } catch (e) {
            console.warn('Impossible d\'enregistrer le skin:', e);
        }
    }
    
    openSkinSelect() {
        this.skinSelectOpen = true;
        this.startMenuElement.classList.add('hidden');
        this.skinSelectMenu.classList.remove('hidden');
        
        // Générer la grille de skins
        this.generateSkinGrid();
        
        // Démarrer l'animation de prévisualisation
        this.startSkinPreviewAnimation();
    }
    
    closeSkinSelect() {
        this.skinSelectOpen = false;
        this.skinSelectMenu.classList.add('hidden');
        this.startMenuElement.classList.remove('hidden');
        
        // Arrêter l'animation de prévisualisation
        this.stopSkinPreviewAnimation();
        
        // Mettre à jour le rendu du joueur avec le nouveau skin
        this.engine.render();
    }
    
    generateSkinGrid() {
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
            
            // Créer un mini canvas pour l'aperçu
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            item.appendChild(canvas);
            
            // Dessiner le skin sur le mini canvas
            this.drawSkinPreviewOnCanvas(skin, canvas);
            
            // Événement de sélection
            item.addEventListener('click', () => this.selectSkin(skin.id));
            
            this.skinGrid.appendChild(item);
        }
    }
    
    drawSkinPreviewOnCanvas(skin, canvas) {
        const ctx = canvas.getContext('2d');
        const size = canvas.width;
        
        // Effacer
        ctx.clearRect(0, 0, size, size);
        
        // Dessiner le skin (en pixels directs, pas en unités logiques)
        if (skin.type === 'static' || skin.type === 'image') {
            // Pour les skins statiques, dessiner directement
            this.drawSkinDirectly(ctx, skin, 0, 0, size, size);
        } else if (skin.type === 'dynamic') {
            // Pour les skins dynamiques, dessiner la première frame
            const frameFn = skin.frames[0];
            if (typeof frameFn === 'function') {
                frameFn(ctx, 0, 0, size, size, {}, skin.state);
            }
            // Bordure
            if (skin.borderColor) {
                ctx.strokeStyle = skin.borderColor;
                ctx.lineWidth = 2;
                ctx.strokeRect(0, 0, size, size);
            }
        }
    }
    
    drawSkinDirectly(ctx, skin, x, y, w, h) {
        // Dessiner un skin sans passer par Scale (pour les previews)
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
    
    selectSkin(skinId) {
        skinManager.setCurrentSkin(skinId);
        this.saveSelectedSkin(skinId);
        
        // Mettre à jour la sélection visuelle
        const items = this.skinGrid.querySelectorAll('.skin-item');
        items.forEach(item => {
            item.classList.toggle('selected', item.dataset.skinId === skinId);
        });
        
        // Mettre à jour le nom dans la prévisualisation
        const skin = skinManager.getCurrentSkin();
        this.skinPreviewName.textContent = skin.name;
    }
    
    filterSkinsByCategory(category) {
        this.currentSkinCategory = category;
        
        // Mettre à jour les onglets
        this.skinCategoryTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === category);
        });
        
        // Regénérer la grille
        this.generateSkinGrid();
    }
    
    startSkinPreviewAnimation() {
        const skin = skinManager.getCurrentSkin();
        this.skinPreviewName.textContent = skin.name;
        
        const animate = () => {
            const dt = 1/60;
            
            // Mettre à jour TOUS les skins dynamiques (pour les miniatures)
            for (const skin of skinManager.skins.values()) {
                if (skin.type === 'dynamic') {
                    skin.update(dt);
                }
            }
            
            // Dessiner sur le canvas de prévisualisation
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
                this.drawSkinDirectly(ctx, currentSkin, 0, 0, size, size);
            }
            
            // Mettre à jour aussi les miniatures des skins dynamiques
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
    
    stopSkinPreviewAnimation() {
        if (this.skinPreviewAnimationId) {
            cancelAnimationFrame(this.skinPreviewAnimationId);
            this.skinPreviewAnimationId = null;
        }
    }
    
    handleSkinNavigation(e) {
        if (!this.skinSelectOpen) return;
        
        const arrows = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        if (!arrows.includes(e.code) && e.code !== 'Enter' && e.code !== 'Space') return;
        
        e.preventDefault();
        
        // Entrée ou Espace = confirmer et fermer
        if (e.code === 'Enter' || e.code === 'Space') {
            this.closeSkinSelect();
            return;
        }
        
        const items = Array.from(this.skinGrid.querySelectorAll('.skin-item'));
        if (items.length === 0) return;
        
        // Trouver l'index actuel
        const currentIndex = items.findIndex(item => item.dataset.skinId === skinManager.currentSkinId);
        const cols = this.skinGridColumns;
        const rows = Math.ceil(items.length / cols);
        
        // Position actuelle dans la grille
        let row = Math.floor(currentIndex / cols);
        let col = currentIndex % cols;
        
        // Calculer la nouvelle position (comportement tore)
        switch (e.code) {
            case 'ArrowUp':
                row = (row - 1 + rows) % rows;
                break;
            case 'ArrowDown':
                row = (row + 1) % rows;
                break;
            case 'ArrowLeft':
                col = (col - 1 + cols) % cols;
                break;
            case 'ArrowRight':
                col = (col + 1) % cols;
                break;
        }
        
        // Calculer le nouvel index
        let newIndex = row * cols + col;
        
        // Gérer le cas où on dépasse le nombre d'items (dernière ligne incomplète)
        if (newIndex >= items.length) {
            if (e.code === 'ArrowDown') {
                // Si on descend et qu'on dépasse, revenir en haut de la même colonne
                newIndex = col;
            } else if (e.code === 'ArrowRight') {
                // Si on va à droite et qu'on dépasse, aller au premier de la ligne suivante
                newIndex = ((row + 1) % rows) * cols;
                if (newIndex >= items.length) newIndex = 0;
            } else if (e.code === 'ArrowUp') {
                // Si on monte depuis la première ligne vers une colonne qui n'existe pas en bas
                // Trouver le dernier élément de cette colonne
                const lastRowForCol = Math.floor((items.length - 1) / cols);
                const lastIndexInCol = lastRowForCol * cols + col;
                newIndex = lastIndexInCol < items.length ? lastIndexInCol : items.length - 1;
            }
        }
        
        // Sélectionner le nouveau skin
        if (newIndex >= 0 && newIndex < items.length) {
            const newSkinId = items[newIndex].dataset.skinId;
            this.selectSkin(newSkinId);
            
            // Scroll pour rendre visible si nécessaire
            items[newIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    
    goToMainMenu() {
        // Réinitialiser l'état du jeu
        this.gameOver = false;
        this.paused = false;
        this.started = false;
        this.engine.stop();
        this.engine.entities = [];
        this.engine.distance = 0;
        
        // Cacher les écrans de fin
        this.gameOverElement.classList.add('hidden');
        if (this.levelCompleteElement) {
            this.levelCompleteElement.classList.add('hidden');
        }
        this.scoreElement.classList.add('hidden');
        
        // Cacher le bouton pause mobile
        if (this.pauseMobileBtn) {
            this.pauseMobileBtn.classList.add('hidden');
        }
        
        // Préparer le niveau et afficher le menu principal
        this.prepareLevel();
        this.engine.render();
        this.startMenuElement.classList.remove('hidden');
    }
    
    prepareLevel() {
        // Créer le joueur
        this.player = new Player();
        this.engine.addEntity(this.player);
        
        // Charger le niveau sélectionné
        this.levelManager.loadLevel(this.selectedLevelIndex);
        this.obstacles = this.levelManager.createObstaclesForLevel();
        
        // Ajouter tous les obstacles au moteur
        for (const obstacle of this.obstacles) {
            this.engine.addEntity(obstacle);
        }
        
        console.log(`Niveau chargé: ${this.levelManager.getLevelName()}`);
        console.log(`Nombre d'obstacles: ${this.levelManager.getTotalObstacles()}`);
    }
    
    startGame() {
        this.started = true;
        this.startMenuElement.classList.add('hidden');
        this.scoreElement.classList.remove('hidden');
        
        // Afficher le bouton pause mobile (sera visible uniquement sur mobile via CSS)
        if (this.pauseMobileBtn) {
            this.pauseMobileBtn.classList.remove('hidden');
        }
        
        // Démarrer le jeu
        this.engine.start();
        this.gameLoop();
    }
    
    setupControls() {
        // Clavier - Saut
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                // Démarrer le jeu si pas encore commencé
                if (!this.started) {
                    this.startGame();
                    return;
                }
                if (!this.gameOver && !this.paused) {
                    this.player.startJump();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.player.stopJump();
            }
        });
        
        // Pause avec P ou B
        document.addEventListener('keydown', (e) => {
            if ((e.code === 'KeyP' || e.code === 'KeyB') && this.started && !this.gameOver) {
                e.preventDefault();
                this.togglePause();
            }
        });
        
        // Échap pour fermer les menus
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape') {
                e.preventDefault();
                if (this.levelSelectOpen) {
                    this.closeLevelSelect();
                } else if (this.skinSelectOpen) {
                    this.closeSkinSelect();
                }
            }
        });
        
        // Entrée : démarrer ou restart
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Enter' || e.code === 'KeyN') {
                e.preventDefault();
                if (!this.started) {
                    this.startGame();
                } else if (this.gameOver) {
                    this.restart();
                }
            }
        });
        
        // M : retour au menu principal (en game over ou en pause)
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyM' && (this.gameOver || this.paused)) {
                e.preventDefault();
                if (this.paused) {
                    this.goToMainMenuFromPause();
                } else {
                    this.goToMainMenu();
                }
            }
        });
        
        // D : Toggle mode Debug
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyD') {
                e.preventDefault();
                this.toggleDebugMode();
            }
        });
        
        // Flèches : Téléportation en mode Debug + Pause
        document.addEventListener('keydown', (e) => {
            if (!this.debugMode || !this.paused) return;
            
            const speed = e.shiftKey ? CONFIG.DEBUG.TELEPORT_SPEED_FAST : CONFIG.DEBUG.TELEPORT_SPEED;
            
            if (e.code === 'ArrowRight') {
                e.preventDefault();
                this.debugTeleport(speed);
            } else if (e.code === 'ArrowLeft') {
                e.preventDefault();
                this.debugTeleport(-speed);
            }
        });
        
        // Souris/tactile (seulement pour sauter une fois le jeu démarré)
        this.canvas.addEventListener('mousedown', () => {
            if (this.started && !this.gameOver && !this.paused) {
                this.player.startJump();
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.player.stopJump();
        });
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.started && !this.gameOver && !this.paused) {
                this.player.startJump();
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.player.stopJump();
        });
    }
    
    
    togglePause() {
        this.paused = !this.paused;
        if (this.paused) {
            this.engine.stop();
            this.showPauseMenu();
        } else {
            this.hidePauseMenu();
            this.engine.start();
            this.gameLoop();
        }
    }
    
    showPauseMenu() {
        // En mode Debug, pas de menu ni de flou pour voir le niveau
        if (this.debugMode) {
            return;
        }
        
        // Ajouter l'effet de flou sur le canvas
        this.canvas.classList.add('paused');
        // Afficher le menu pause
        if (this.pauseMenuElement) {
            this.pauseMenuElement.classList.remove('hidden');
        }
        // Cacher le bouton pause mobile
        if (this.pauseMobileBtn) {
            this.pauseMobileBtn.classList.add('hidden');
        }
    }
    
    hidePauseMenu() {
        // Retirer l'effet de flou
        this.canvas.classList.remove('paused');
        // Cacher le menu pause
        if (this.pauseMenuElement) {
            this.pauseMenuElement.classList.add('hidden');
        }
        // Réafficher le bouton pause mobile si le jeu est en cours
        if (this.pauseMobileBtn && this.started && !this.gameOver) {
            this.pauseMobileBtn.classList.remove('hidden');
        }
    }
    
    goToMainMenuFromPause() {
        // D'abord cacher le menu pause et retirer le flou
        this.hidePauseMenu();
        // Puis aller au menu principal
        this.goToMainMenu();
    }
    
    gameLoop = () => {
        if (this.gameOver || this.paused) return;
        
        // Nettoyer les obstacles hors écran (sauf en mode Debug pour pouvoir revenir en arrière)
        if (!this.debugMode) {
            this.obstacles = this.obstacles.filter(obstacle => {
                if (obstacle.isOffScreen()) {
                    this.engine.removeEntity(obstacle);
                    return false;
                }
                return true;
            });
        }
        
        // Résoudre les collisions physiques (empêcher traversée)
        for (const obstacle of this.obstacles) {
            obstacle.resolveCollision(this.player);
        }
        
        // Calculer la distance une seule fois pour cette frame
        const distance = this.engine.getDistance();
        
        // Vérifier les collisions mortelles (corps meurtrier vs corps meurtrier)
        for (const obstacle of this.obstacles) {
            if (obstacle.checkCollision(this.player)) {
                if (this.debugMode) {
                    // En mode debug : juste le flash visuel, pas de mort
                    this.player.collisionFlashTimer = CONFIG.DEBUG.COLLISION_FLASH_DURATION;
                } else {
                    // Mode normal : game over
                    this.scoreElement.textContent = `Distance: ${distance}m`;
                    this.endGame(distance);
                    return;
                }
            }
        }

        // Vérifier le franchissement de la ligne d'arrivée (Finish)
        for (const obstacle of this.obstacles) {
            if (obstacle.type === 'finish' && typeof obstacle.hasPlayerPassed === 'function') {
                if (obstacle.hasPlayerPassed(this.player)) {
                    this.scoreElement.textContent = `Distance: ${distance}m`;
                    this.finishLevel(distance);
                    return;
                }
            }
        }
        
        // Mettre à jour le score
        this.scoreElement.textContent = `Distance: ${distance}m`;
        
        // Continuer la boucle
        requestAnimationFrame(this.gameLoop);
    }
    
    endGame(finalDistance) {
        this.gameOver = true;
        this.engine.stop();
        this.player.stopJump();
        
        // Cacher le bouton pause mobile
        if (this.pauseMobileBtn) {
            this.pauseMobileBtn.classList.add('hidden');
        }
        
        // Afficher l'écran de game over avec la même distance que celle affichée à l'écran
        const distanceToShow = typeof finalDistance === 'number' ? finalDistance : this.engine.getDistance();
        this.finalScoreElement.textContent = distanceToShow;
        this.gameOverElement.classList.remove('hidden');
    }
    
    finishLevel(finalDistance) {
        this.gameOver = true;
        this.engine.stop();
        this.player.stopJump();
        
        // Cacher le bouton pause mobile
        if (this.pauseMobileBtn) {
            this.pauseMobileBtn.classList.add('hidden');
        }
        
        const distanceToShow = typeof finalDistance === 'number' ? finalDistance : this.engine.getDistance();
        if (this.levelFinalScoreElement && this.levelCompleteElement) {
            this.levelFinalScoreElement.textContent = distanceToShow;
            this.levelCompleteElement.classList.remove('hidden');
        }
    }
    
    restart() {
        // Réinitialiser l'état
        this.gameOver = false;
        this.paused = false;
        this.engine.entities = [];
        this.engine.distance = 0;
        
        // Recréer le joueur
        this.player = new Player();
        this.engine.addEntity(this.player);
        
        // Recharger le niveau sélectionné
        this.levelManager.loadLevel(this.selectedLevelIndex);
        this.obstacles = this.levelManager.createObstaclesForLevel();
        
        // Ajouter tous les obstacles au moteur
        for (const obstacle of this.obstacles) {
            this.engine.addEntity(obstacle);
        }
        
        // Cacher les écrans de fin
        this.gameOverElement.classList.add('hidden');
        if (this.levelCompleteElement) {
            this.levelCompleteElement.classList.add('hidden');
        }
        
        // Réafficher le bouton pause mobile
        if (this.pauseMobileBtn) {
            this.pauseMobileBtn.classList.remove('hidden');
        }
        
        // Redémarrer le jeu
        this.engine.start();
        this.gameLoop();
    }
}

// Démarrer le jeu (le DOM est déjà prêt grâce au chargement dynamique)
new Game();
