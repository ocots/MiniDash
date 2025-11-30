// Niveau 2 - Le Parcours du Ciel
// Un niveau épique mélangeant sol et plateformes aériennes
// Difficulté progressive avec pic à ~270m puis descente vers la victoire

export const level2 = {
    name: "Niveau 2 - Le Parcours du Ciel (400m)",
    obstacles: [

        // =====================================================
        // PHASE 1: ÉCHAUFFEMENT (0-60m) - Difficulté: ★☆☆☆☆
        // Introduction douce aux mécaniques
        // =====================================================
        
        // Premiers sauts simples
        { type: 'triangle', x: 18, width: 0.9, height: 0.9 },
        { type: 'triangle', x: 28, width: 0.9, height: 0.9 },
        
        // Premier bloc à sauter
        { type: 'rectangle', x: 40, width: 1, height: 1 },
        
        // Introduction aux plateformes aériennes (optionnelle)
        { type: 'triangle', x: 52, width: 1, height: 1 },
        { type: 'plateformeAir', x: 50, y: 2, width: 3, height: 0.5 },

        // =====================================================
        // PHASE 2: APPRENTISSAGE (60-120m) - Difficulté: ★★☆☆☆
        // On apprend à utiliser les plateformes
        // =====================================================
        
        // Série de triangles avec échappatoire aérienne
        { type: 'triangle', x: 68, width: 1, height: 1 },
        { type: 'triangle', x: 73, width: 1, height: 1 },
        { type: 'plateformeAir', x: 66, y: 1.8, width: 4, height: 0.5 },
        { type: 'plateformeAir', x: 72, y: 1.8, width: 4, height: 0.5 },
        
        // Premier escalier aérien (3 marches)
        { type: 'plateformeAir', x: 85, y: 1.5, width: 2.5, height: 0.5 },
        { type: 'plateformeAir', x: 90, y: 2.5, width: 2.5, height: 0.5 },
        { type: 'plateformeAir', x: 95, y: 3.5, width: 2.5, height: 0.5 },
        
        // Grande plateforme de repos avec petit piège
        { 
            type: 'rectangleLarge', x: 105, width: 12, height: 1,
            carried: [
                { type: 'triangle', relativeX: 8, width: 0.8, height: 0.8 }
            ]
        },

        // =====================================================
        // PHASE 3: MONTÉE EN PUISSANCE (120-200m) - Difficulté: ★★★☆☆
        // Les choses sérieuses commencent
        // =====================================================
        
        // Slalom au sol
        { type: 'triangle', x: 125, width: 1, height: 1 },
        { type: 'rectangle', x: 132, width: 1.2, height: 1.4 },
        { type: 'triangle', x: 140, width: 1, height: 1 },
        { type: 'triangle', x: 145, width: 1, height: 1 },
        
        // Choix: sol dangereux OU chemin aérien
        // Sol: triple triangle rapproché
        { type: 'triangle', x: 158, width: 1, height: 1 },
        { type: 'triangle', x: 162, width: 1, height: 1 },
        { type: 'triangle', x: 166, width: 1, height: 1 },
        // Air: pont de plateformes
        { type: 'plateformeAir', x: 155, y: 2, width: 3.5, height: 0.5 },
        { type: 'plateformeAir', x: 161, y: 2.5, width: 3.5, height: 0.5 },
        { type: 'plateformeAir', x: 167, y: 2, width: 3.5, height: 0.5 },
        
        // Escalier descendant avec piège
        { type: 'plateformeAir', x: 180, y: 3, width: 2.5, height: 0.5 },
        { type: 'plateformeAir', x: 185, y: 2, width: 2.5, height: 0.5 },
        { type: 'plateformeAir', x: 190, y: 1, width: 2.5, height: 0.5,
          carried: [{ type: 'triangle', relativeX: 1.5, width: 0.7, height: 0.7 }]
        },

        // =====================================================
        // PHASE 4: ZONE INTENSE (200-280m) - Difficulté: ★★★★★
        // Le pic de difficulté ! Concentration maximale !
        // =====================================================
        
        // Mur d'obstacles au sol
        { type: 'rectangle', x: 205, width: 1.2, height: 1.6 },
        { type: 'triangle', x: 212, width: 1, height: 1 },
        { type: 'rectangle', x: 218, width: 1.2, height: 2 },
        { type: 'triangle', x: 225, width: 1.1, height: 1.1 },
        
        // Grande plateforme piégée - ATTENTION !
        { 
            type: 'rectangleLarge', x: 235, width: 18, height: 1,
            carried: [
                { type: 'triangle', relativeX: 3, width: 0.9, height: 0.9 },
                { type: 'triangle', relativeX: 9, width: 0.9, height: 0.9 },
                { type: 'triangle', relativeX: 14, width: 0.9, height: 0.9 }
            ]
        },
        
        // Le passage infernal: sol ET air dangereux !
        // Sol: triangles
        { type: 'triangle', x: 260, width: 1, height: 1 },
        { type: 'triangle', x: 265, width: 1, height: 1 },
        { type: 'triangle', x: 270, width: 1, height: 1 },
        // Air: plateformes avec pièges
        { type: 'plateformeAir', x: 258, y: 2, width: 3, height: 0.5 },
        { type: 'plateformeAir', x: 262, y: 3, width: 5, height: 0.5 },
        { type: 'plateformeAir', x: 269, y: 2, width: 4, height: 0.5,
          carried: [{ type: 'triangle', relativeX: 2, width: 0.7, height: 0.7 }]
        },

        // =====================================================
        // PHASE 5: DESCENTE (280-350m) - Difficulté: ★★★☆☆
        // On relâche un peu la pression
        // =====================================================
        
        // Plateforme de récupération
        { type: 'plateformeAir', x: 285, y: 1.5, width: 5, height: 0.5 },
        
        // Obstacles espacés pour reprendre son souffle
        { type: 'triangle', x: 300, width: 1, height: 1 },
        { type: 'rectangle', x: 312, width: 1.2, height: 1.2 },
        { type: 'triangle', x: 325, width: 1, height: 1 },
        
        // Dernière grande plateforme (repos)
        { 
            type: 'rectangleLarge', x: 335, width: 10, height: 1,
            carried: []  // Pas de piège, on est gentil !
        },

        // =====================================================
        // PHASE 6: SPRINT FINAL (350-400m) - Difficulté: ★★☆☆☆
        // Dernière ligne droite, on y croit !
        // =====================================================
        
        // Quelques obstacles pour garder l'attention
        { type: 'triangle', x: 355, width: 0.9, height: 0.9 },
        { type: 'triangle', x: 362, width: 0.9, height: 0.9 },
        
        // Dernier choix: sol ou air pour la gloire
        { type: 'rectangle', x: 375, width: 1, height: 1.2 },
        { type: 'plateformeAir', x: 373, y: 2, width: 4, height: 0.5 },
        
        // Dernier triangle avant la victoire
        { type: 'triangle', x: 390, width: 1, height: 1 },

        // =====================================================
        // ARRIVÉE - VICTOIRE !
        // =====================================================
        { type: 'finish', x: 405, width: 0.5, height: 0 }
    ]
};
