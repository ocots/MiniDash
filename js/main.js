import { CONFIG } from './config.js';
import { GameEngine } from './engine/GameEngine.js';
import { Player } from './entities/Player.js';
import { LevelManager } from './levels/LevelManager.js';

// Clé localStorage pour stocker le niveau sélectionné
const STORAGE_KEY = 'minidash_selected_level';

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
        
        // Niveau sélectionné (récupéré depuis localStorage ou 0 par défaut)
        this.selectedLevelIndex = this.loadSelectedLevel();
        
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
        
        this.init();
    }
    
    init() {
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
        
        // Boutons retour au menu principal
        if (this.mainMenuBtn) {
            this.mainMenuBtn.addEventListener('click', () => this.goToMainMenu());
        }
        if (this.levelMainMenuBtn) {
            this.levelMainMenuBtn.addEventListener('click', () => this.goToMainMenu());
        }
        
        // Afficher le menu et faire un premier rendu statique
        this.engine.render();
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
        
        // Échap pour fermer le menu de sélection de niveau
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this.levelSelectOpen) {
                e.preventDefault();
                this.closeLevelSelect();
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
        
        // M : retour au menu principal (seulement en game over)
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyM' && this.gameOver) {
                e.preventDefault();
                this.goToMainMenu();
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
        } else {
            this.engine.start();
            this.gameLoop();
        }
    }
    
    gameLoop = () => {
        if (this.gameOver || this.paused) return;
        
        // Nettoyer les obstacles hors écran
        this.obstacles = this.obstacles.filter(obstacle => {
            if (obstacle.isOffScreen()) {
                this.engine.removeEntity(obstacle);
                return false;
            }
            return true;
        });
        
        // Résoudre les collisions physiques (empêcher traversée)
        for (const obstacle of this.obstacles) {
            obstacle.resolveCollision(this.player);
        }
        
        // Calculer la distance une seule fois pour cette frame
        const distance = this.engine.getDistance();
        
        // Vérifier les collisions mortelles (corps meurtrier vs corps meurtrier)
        for (const obstacle of this.obstacles) {
            if (obstacle.checkCollision(this.player)) {
                // Mettre à jour le score une dernière fois avec cette distance
                this.scoreElement.textContent = `Distance: ${distance}m`;
                this.endGame(distance);
                return;
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
        
        // Afficher l'écran de game over avec la même distance que celle affichée à l'écran
        const distanceToShow = typeof finalDistance === 'number' ? finalDistance : this.engine.getDistance();
        this.finalScoreElement.textContent = distanceToShow;
        this.gameOverElement.classList.remove('hidden');
    }
    
    finishLevel(finalDistance) {
        this.gameOver = true;
        this.engine.stop();
        this.player.stopJump();
        
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
        
        // Redémarrer le jeu
        this.engine.start();
        this.gameLoop();
    }
}

// Démarrer le jeu (le DOM est déjà prêt grâce au chargement dynamique)
new Game();
