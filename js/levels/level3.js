// Niveau 3 - Le Parcours de l'Extrême
// DIFFICULTÉ MAXIMALE mais FINISSABLE
// Contraintes: saut de 5m horizontal, 3.5 unités de hauteur
// Toutes les dimensions en MÈTRES

export const level3 = {
    name: "Niveau 3 - Le Parcours de l'Extrême (400m)",
    obstacles: [

        // =====================================================
        // PHASE 1: DÉMARRAGE BRUTAL (0-50m) - Difficulté: ★★★★☆
        // On commence fort mais réalisable
        // =====================================================
        
        // Double triangle rapproché (espacement 4m = OK)
        { type: 'triangle', x: 15, width: 1, height: 1 },
        { type: 'triangle', x: 19, width: 1, height: 1 },
        
        // Rectangle moyen à sauter
        { type: 'rectangle', x: 26, width: 1.2, height: 1.6 },
        
        // Plateforme piégée avec triangles bien espacés
        { 
            type: 'rectangleLarge', x: 33, width: 10, height: 1,
            carried: [
                { type: 'triangle', relativeX: 3, width: 0.9, height: 0.9 },
                { type: 'triangle', relativeX: 7, width: 0.9, height: 0.9 }
            ]
        },
        
        // Triangle + rectangle (espacement 4m)
        { type: 'triangle', x: 47, width: 1, height: 1 },

        // =====================================================
        // PHASE 2: MONTÉE AÉRIENNE (50-100m) - Difficulté: ★★★★☆
        // Utilisation des plateformes aériennes
        // =====================================================
        
        // Obstacles au sol
        { type: 'rectangle', x: 55, width: 1.2, height: 1.8 },
        { type: 'triangle', x: 60, width: 1, height: 1 },
        
        // Escalier aérien (espacement 4m entre plateformes)
        { type: 'plateformeAir', x: 68, y: 1.5, width: 3, height: 0.5 },
        { type: 'plateformeAir', x: 73, y: 2.5, width: 3, height: 0.5 },
        { type: 'plateformeAir', x: 78, y: 3, width: 3, height: 0.5 },
        
        // Retour au sol avec obstacles
        { type: 'triangle', x: 86, width: 1, height: 1 },
        { type: 'rectangle', x: 91, width: 1.2, height: 1.4 },
        { type: 'triangle', x: 96, width: 1, height: 1 },

        // =====================================================
        // PHASE 3: SLALOM INTENSE (100-150m) - Difficulté: ★★★★★
        // Enchaînement rapide mais faisable
        // =====================================================
        
        // Série de triangles (espacement 4-5m)
        { type: 'triangle', x: 105, width: 1, height: 1 },
        { type: 'triangle', x: 109, width: 1, height: 1 },
        { type: 'rectangle', x: 114, width: 1.2, height: 1.8 },
        { type: 'triangle', x: 119, width: 1, height: 1 },
        { type: 'triangle', x: 123, width: 1, height: 1 },
        
        // Grande plateforme avec 3 pièges espacés
        { 
            type: 'rectangleLarge', x: 130, width: 18, height: 1,
            carried: [
                { type: 'triangle', relativeX: 4, width: 0.9, height: 0.9 },
                { type: 'triangle', relativeX: 9, width: 0.9, height: 0.9 },
                { type: 'triangle', relativeX: 14, width: 0.9, height: 0.9 }
            ]
        },

        // =====================================================
        // PHASE 4: CHOIX TACTIQUES (150-200m) - Difficulté: ★★★★★
        // Sol dangereux OU chemin aérien
        // =====================================================
        
        // Obstacles au sol rapprochés
        { type: 'triangle', x: 153, width: 1, height: 1 },
        { type: 'rectangle', x: 157, width: 1.2, height: 2 },
        { type: 'triangle', x: 162, width: 1, height: 1 },
        { type: 'rectangle', x: 166, width: 1.2, height: 2 },
        
        // Alternative aérienne (espacement 4m)
        { type: 'plateformeAir', x: 152, y: 2, width: 3.5, height: 0.5 },
        { type: 'plateformeAir', x: 157, y: 2.5, width: 3.5, height: 0.5 },
        { type: 'plateformeAir', x: 162, y: 2, width: 3.5, height: 0.5 },
        { type: 'plateformeAir', x: 167, y: 1.5, width: 3.5, height: 0.5 },
        
        // Retour au sol
        { type: 'triangle', x: 175, width: 1, height: 1 },
        { type: 'triangle', x: 180, width: 1, height: 1 },
        
        // Plateforme aérienne avec piège
        { type: 'plateformeAir', x: 186, y: 2, width: 4, height: 0.5,
          carried: [{ type: 'triangle', relativeX: 2, width: 0.8, height: 0.8 }]
        },
        
        { type: 'triangle', x: 194, width: 1, height: 1 },

        // =====================================================
        // PHASE 5: LE MUR (200-250m) - Difficulté: ★★★★★
        // Section la plus dense du niveau
        // =====================================================
        
        // Mur d'obstacles variés (espacement 4-5m)
        { type: 'rectangle', x: 205, width: 1.2, height: 1.6 },
        { type: 'triangle', x: 210, width: 1, height: 1 },
        //{ type: 'rectangle', x: 214, width: 1.2, height: 2 },
        { type: 'triangle', x: 218, width: 1, height: 1 },
        { type: 'rectangle', x: 223, width: 1.2, height: 1.8 },
        { type: 'triangle', x: 228, width: 1, height: 1 },
        
        // Grande plateforme ultra-piégée
        { 
            type: 'rectangleLarge', x: 235, width: 20, height: 1,
            carried: [
                { type: 'triangle', relativeX: 3, width: 0.9, height: 0.9 },
                { type: 'triangle', relativeX: 8, width: 0.9, height: 0.9 },
                { type: 'triangle', relativeX: 13, width: 0.9, height: 0.9 },
                { type: 'triangle', relativeX: 17, width: 0.9, height: 0.9 }
            ]
        },

        // =====================================================
        // PHASE 6: COMBO AIR-SOL (250-300m) - Difficulté: ★★★★★
        // Alternance rapide entre sol et air
        // =====================================================
        
        // Obstacles au sol
        { type: 'triangle', x: 260, width: 1, height: 1 },
        { type: 'rectangle', x: 265, width: 1.2, height: 1.6 },
        
        // Plateformes aériennes (espacement 4m)
        { type: 'plateformeAir', x: 272, y: 2.5, width: 3, height: 0.5 },
        { type: 'plateformeAir', x: 277, y: 3, width: 3, height: 0.5,
          carried: [{ type: 'triangle', relativeX: 1.5, width: 0.7, height: 0.7 }]
        },
        { type: 'plateformeAir', x: 282, y: 2.5, width: 3, height: 0.5 },
        
        // Retour brutal au sol
        { type: 'triangle', x: 290, width: 1, height: 1 },
        { type: 'triangle', x: 294, width: 1, height: 1 },
        { type: 'rectangle', x: 299, width: 1.2, height: 1.8 },

        // =====================================================
        // PHASE 7: DESCENTE TECHNIQUE (300-350m) - Difficulté: ★★★★☆
        // Toujours intense mais légèrement moins dense
        // =====================================================
        
        // Plateforme de transition
        { 
            type: 'rectangleLarge', x: 308, width: 12, height: 1,
            carried: [
                { type: 'triangle', relativeX: 5, width: 0.9, height: 0.9 },
                { type: 'triangle', relativeX: 9, width: 0.9, height: 0.9 }
            ]
        },
        
        // Obstacles espacés
        { type: 'triangle', x: 325, width: 1, height: 1 },
        { type: 'rectangle', x: 330, width: 1.2, height: 1.6 },
        { type: 'triangle', x: 336, width: 1, height: 1 },
        { type: 'triangle', x: 341, width: 1, height: 1 },
        { type: 'rectangle', x: 346, width: 1.2, height: 1.4 },

        // =====================================================
        // PHASE 8: SPRINT FINAL (350-400m) - Difficulté: ★★★★★
        // Dernière épreuve avant la victoire
        // =====================================================
        
        // Escalier de rectangles
        { type: 'rectangle', x: 355, width: 1.2, height: 1.2 },
        { type: 'rectangle', x: 360, width: 1.2, height: 1.6 },
        { type: 'rectangle', x: 365, width: 1.2, height: 2 },
        
        // Combo aérien final (espacement 4m)
        { type: 'plateformeAir', x: 372, y: 2.5, width: 3, height: 0.5 },
        { type: 'plateformeAir', x: 377, y: 2, width: 3, height: 0.5,
          carried: [{ type: 'triangle', relativeX: 1.5, width: 0.8, height: 0.8 }]
        },
        
        // Derniers obstacles avant la gloire
        { type: 'triangle', x: 385, width: 1, height: 1 },
        { type: 'triangle', x: 390, width: 1, height: 1 },
        { type: 'rectangle', x: 395, width: 1.2, height: 1.4 },
        { type: 'triangle', x: 400, width: 1, height: 1 },

        // =====================================================
        // ARRIVÉE - VICTOIRE MÉRITÉE !
        // Félicitations, champion !
        // =====================================================
        { type: 'finish', x: 410, width: 0.5, height: 0 }
    ]
};
