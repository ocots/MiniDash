// Configuration du jeu
// Toutes les dimensions sont en UNITÉS LOGIQUES (1 unité = taille du joueur)
// Le système de rendu convertit automatiquement en pixels selon la taille de l'écran

export const CONFIG = {
    // Ratio du canvas (16:9)
    ASPECT_RATIO: 16 / 9,
    
    // Dimensions logiques du monde (en unités)
    // Le joueur fait 1 unité de côté
    WORLD_HEIGHT: 18,  // 18 unités de haut (le joueur = 1/18 de la hauteur)
    
    // Game loop
    FPS: 60,
    
    // Physique (en unités/seconde²)
    // Ces valeurs sont calibrées pour un saut d'environ 3 unités de haut
    GRAVITY: 50,        // Accélération vers le bas (unités/s²)
    JUMP_FORCE: -18,    // Vélocité initiale du saut (unités/s)
    
    // Joueur (en unités)
    PLAYER_SIZE: 1,
    PLAYER_X: 5, // Position fixe X du joueur (en unités)
    PLAYER_COLOR: '#4ecdc4',
    
    // Monde (en unités)
    GROUND_HEIGHT: 2.5,
    SCROLL_SPEED: 7.5, // Vitesse de défilement en unités/seconde
    
    // Conversion unités <-> mètres (pour l'affichage de la distance)
    // 1 mètre = X unités logiques
    UNITS_PER_METER: 1.25,
    
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
