// Niveau 1 - L'Aventure
// Format: { type, x, width, height } - toutes les dimensions sont en MÈTRES
// Pour rectangleLarge: carried: [{ type, relativeX, width, height }, ...] - aussi en mètres

export const level1 = {
    name: "Niveau 1 - L'Aventure (400m)",
    obstacles: [

        // ===== ZONE 1: Échauffement (0-40m) =====  
        { type: 'triangle', x: 23, width: 0.9, height: 0.9 },
        { type: 'triangle', x: 30, width: 0.9, height: 0.9 },

        // ===== ZONE 2: Premières plateformes (40-70m) =====
        { 
            type: 'rectangleLarge', x: 40, width: 10, height: 1,
            carried: [
                { type: 'triangle', relativeX: 4, width: 0.8, height: 0.8 }
            ]
        },
        { type: 'triangle', x: 55, width: 1, height: 1 },
        { type: 'triangle', x: 60, width: 1, height: 1 },
        { type: 'rectangle', x: 67, width: 1.4, height: 1.4 },

        // ===== ZONE 3: Double saut (70-100m) =====
        { type: 'triangle', x: 75, width: 0.8, height: 0.8 },
        { type: 'rectangle', x: 85, width: 1.2, height: 1.6 },
        { type: 'triangle', x: 92, width: 1, height: 1 },
        { 
            type: 'rectangleLarge', x: 100, width: 8, height: 1,
            carried: [
                { type: 'triangle', relativeX: 5, width: 0.7, height: 0.7 }
            ]
        },

        // ===== ZONE 4: Escaliers (100-140m) =====
        { type: 'rectangle', x: 115, width: 1.2, height: 1 },
        { type: 'rectangle', x: 122, width: 1.2, height: 1.5 },
        { type: 'rectangle', x: 129, width: 1.2, height: 2 },
        { type: 'triangle', x: 138, width: 1, height: 1 },
        { type: 'triangle', x: 143, width: 1, height: 1 },
        { type: 'triangle', x: 148, width: 1, height: 1 },

        // ===== ZONE 5: Grande plateforme piégée (140-180m) =====
        { 
            type: 'rectangleLarge', x: 155, width: 20, height: 1,
            carried: [
                { type: 'triangle', relativeX: 3, width: 0.8, height: 0.8 },
                { type: 'triangle', relativeX: 8, width: 0.8, height: 0.8 },
                { type: 'triangle', relativeX: 13, width: 0.8, height: 0.8 }
            ]
        },
        { type: 'triangle', x: 182, width: 1.2, height: 1.2 },
        { type: 'rectangle', x: 190, width: 1.4, height: 1.4 },

        // ===== ZONE 6: Slalom (180-220m) =====
        { type: 'triangle', x: 200, width: 0.9, height: 0.9 },
        { type: 'rectangle', x: 206, width: 1, height: 1.2 },
        { type: 'triangle', x: 213, width: 0.9, height: 0.9 },
        { type: 'rectangle', x: 219, width: 1, height: 1.4 },
        { type: 'triangle', x: 226, width: 0.9, height: 0.9 },
        { type: 'rectangle', x: 232, width: 1, height: 1.6 },

        // ===== ZONE 7: Repos puis surprise (220-260m) =====
        { 
            type: 'rectangleLarge', x: 245, width: 15, height: 1,
            carried: []  // Plateforme de repos, pas de piège !
        },
        { type: 'triangle', x: 265, width: 1, height: 1 },
        { type: 'triangle', x: 270, width: 1, height: 1 },
        { type: 'triangle', x: 275, width: 1, height: 1 },

        // ===== ZONE 8: Chaos contrôlé (260-300m) =====
        { type: 'rectangle', x: 285, width: 1.2, height: 1.8 },
        { type: 'triangle', x: 293, width: 0.8, height: 0.8 },
        { type: 'triangle', x: 297, width: 0.8, height: 0.8 },
        { 
            type: 'rectangleLarge', x: 305, width: 12, height: 1,
            carried: [
                { type: 'triangle', relativeX: 4, width: 0.9, height: 0.9 },
                { type: 'triangle', relativeX: 10, width: 0.7, height: 0.7 }
            ]
        },

        // ===== ZONE 9: Sprint final (300-350m) =====
        { type: 'triangle', x: 325, width: 1, height: 1 },
        { type: 'triangle', x: 330, width: 1, height: 1 },
        { type: 'rectangle', x: 338, width: 1.4, height: 1.4 },
        { type: 'triangle', x: 347, width: 1.1, height: 1.1 },
        { type: 'triangle', x: 353, width: 1.1, height: 1.1 },

        // ===== ZONE 10: Dernier défi (350-400m) =====
        { 
            type: 'rectangleLarge', x: 365, width: 16, height: 1,
            carried: [
                { type: 'triangle', relativeX: 2, width: 0.8, height: 0.8 },
                { type: 'triangle', relativeX: 7, width: 1, height: 1 },
                { type: 'triangle', relativeX: 12, width: 0.8, height: 0.8 }
            ]
        },
        { type: 'triangle', x: 387, width: 1, height: 1 },
        { type: 'triangle', x: 393, width: 1, height: 1 },
        { type: 'rectangle', x: 400, width: 1.2, height: 1.2 },

        // ===== ARRIVÉE =====
        { type: 'finish', x: 410, width: 0.5, height: 0 }
    ]
};
