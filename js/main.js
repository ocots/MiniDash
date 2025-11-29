import { CONFIG } from './config.js';
import { GameEngine } from './engine/GameEngine.js';
import { Player } from './entities/Player.js';
import { LevelManager } from './levels/LevelManager.js';

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
        
        this.init();
    }
    
    init() {
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
        
        // Afficher le menu et faire un premier rendu statique
        this.engine.render();
    }
    
    prepareLevel() {
        // Créer le joueur
        this.player = new Player();
        this.engine.addEntity(this.player);
        
        // Charger le niveau 1
        this.levelManager.loadLevel(0);
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
        
        // Souris/tactile
        this.canvas.addEventListener('mousedown', () => {
            if (!this.started) {
                this.startGame();
                return;
            }
            if (!this.gameOver && !this.paused) {
                this.player.startJump();
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.player.stopJump();
        });
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!this.started) {
                this.startGame();
                return;
            }
            if (!this.gameOver && !this.paused) {
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
        
        // Recharger le niveau
        this.levelManager.loadLevel(0);
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
