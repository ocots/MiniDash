// Configuration du jeu
// Toutes les dimensions sont en UNITÉS LOGIQUES (1 unité = taille du joueur)
// Le système de rendu convertit automatiquement en pixels selon la taille de l'écran

// ============================================================
// PARAMÈTRES DE GAMEPLAY (à ajuster pour équilibrer le jeu)
// ============================================================

const GAMEPLAY = {
    // Vitesse du jeu (en mètres/seconde)
    // Plus c'est haut, plus le jeu défile vite
    SPEED: 10,
    
    // Distance horizontale parcourue pendant un saut (en mètres)
    // Détermine l'espacement max entre obstacles franchissables
    JUMP_DISTANCE: 5,
    
    // Hauteur maximale du saut (en unités = taille du joueur)
    // 3 = le joueur monte de 3× sa taille
    JUMP_HEIGHT: 3.5,
};

// ============================================================
// CONFIGURATION TECHNIQUE (calculée automatiquement)
// ============================================================

// Conversion unités <-> mètres
const UNITS_PER_METER = 1.25;

// Calculs physiques dérivés des paramètres de gameplay
const SCROLL_SPEED = GAMEPLAY.SPEED * UNITS_PER_METER;  // unités/s
const JUMP_DISTANCE_UNITS = GAMEPLAY.JUMP_DISTANCE * UNITS_PER_METER;
const TIME_IN_AIR = JUMP_DISTANCE_UNITS / SCROLL_SPEED;  // secondes
// Physique du saut parabolique:
// hauteur_max = v0² / (2*g)  =>  v0 = sqrt(2 * g * h)
// temps_montée = v0 / g  =>  temps_total = 2 * v0 / g
// Donc: g = 8 * h / t²  et  v0 = 4 * h / t
const GRAVITY = (8 * GAMEPLAY.JUMP_HEIGHT) / (TIME_IN_AIR * TIME_IN_AIR);
const JUMP_FORCE = -(4 * GAMEPLAY.JUMP_HEIGHT) / TIME_IN_AIR;

export const CONFIG = {
    // Ratio du canvas (16:9)
    ASPECT_RATIO: 16 / 9,
    
    // Dimensions logiques du monde (en unités)
    // Le joueur fait 1 unité de côté
    WORLD_HEIGHT: 18,  // 18 unités de haut (le joueur = 1/18 de la hauteur)
    
    // Game loop
    FPS: 60,
    
    // Physique (calculée automatiquement)
    GRAVITY,
    JUMP_FORCE,
    SCROLL_SPEED,
    
    // Conversion
    UNITS_PER_METER,
    
    // Joueur (en unités)
    PLAYER_SIZE: 1,
    PLAYER_X: 8 , // Position fixe X du joueur (en unités)
    PLAYER_COLOR: '#4ecdc4',
    
    // Monde (en unités)
    GROUND_HEIGHT: 2.5,
    
    // Couleurs des obstacles
    TRIANGLE_COLOR: '#ff6b6b',
    RECTANGLE_COLOR: '#ffa500',
    RECTANGLE_LARGE_COLOR: '#e67e22',
    
    // Marges hitbox (en unités)
    RECTANGLE_HURT_MARGIN_X: 0.1,
    RECTANGLE_HURT_MARGIN_Y: 0.2,
    PLAYER_HURT_MARGIN: 0.1,
    TRIANGLE_HURT_MARGIN: 0.1,
    
    // Couleurs du monde
    GROUND_COLOR: '#16213e',
    SKY_COLOR: '#0f3460'
};
