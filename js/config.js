// Configuration du jeu
export const CONFIG = {
    // Canvas
    CANVAS_WIDTH: 1280,
    CANVAS_HEIGHT: 720,
    
    // Game loop
    FPS: 60,
    
    // Physique
    GRAVITY: 0.8,
    JUMP_FORCE: -18,
    
    // Joueur
    PLAYER_SIZE: 40,
    PLAYER_X: 200, // Position fixe X du joueur
    PLAYER_COLOR: '#4ecdc4',
    
    // Monde
    GROUND_HEIGHT: 100,
    SCROLL_SPEED: 5,
    
    // Conversion pixels <-> mètres (1 mètre = PIXELS_PER_METER pixels)
    PIXELS_PER_METER: 50,
    
    // Obstacles
    OBSTACLE_SPACING: 400, // Distance entre obstacles
    
    // Triangles (pics)
    TRIANGLE_MIN_WIDTH: 40,
    TRIANGLE_MAX_WIDTH: 50,
    TRIANGLE_MIN_HEIGHT: 40,
    TRIANGLE_MAX_HEIGHT: 50,
    TRIANGLE_COLOR: '#ff6b6b',
    
    // Rectangles (plateformes)
    RECTANGLE_MIN_WIDTH: 60,
    RECTANGLE_MAX_WIDTH: 70,
    RECTANGLE_MIN_HEIGHT: 60,
    RECTANGLE_MAX_HEIGHT: 70,
    RECTANGLE_COLOR: '#ffa500',
    RECTANGLE_HURT_MARGIN_X: 4,
    RECTANGLE_HURT_MARGIN_Y: 8,
    
    // Rectangles larges (grandes plateformes)
    RECTANGLE_LARGE_MIN_WIDTH: 600,  // 10x la largeur min d'un Rectangle
    RECTANGLE_LARGE_MAX_WIDTH: 1400, // 20x la largeur max d'un Rectangle
    RECTANGLE_LARGE_MIN_HEIGHT: 40,
    RECTANGLE_LARGE_MAX_HEIGHT: 60,
    RECTANGLE_LARGE_COLOR: '#e67e22', // Orange légèrement différent
    
    // Joueur - marges hitbox
    PLAYER_HURT_MARGIN: 4,
    
    // Triangles - marges hitbox
    TRIANGLE_HURT_MARGIN: 4,
    
    // Couleurs
    GROUND_COLOR: '#16213e',
    SKY_COLOR: '#0f3460'
};
