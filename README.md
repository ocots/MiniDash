# MiniDash

Un jeu de type runner 2D minimaliste en JavaScript vanilla, inspiré de Geometry Dash.

🎮 **Jouer en ligne** : [https://ocots.github.io/MiniDash/](https://ocots.github.io/MiniDash/)

## 🎮 Contrôles

| Touche | Action |
|--------|--------|
| **Espace** / **Clic** / **Tactile** | Sauter |
| **Maintenir** | Rebonds automatiques |
| **P** ou **B** | Pause |
| **Entrée** ou **N** | Recommencer (après Game Over) |

## 🚀 Lancer le jeu en local

```bash
# Python 3
python -m http.server 8080

# Ou avec Node.js
npx serve
```

Puis ouvrez `http://localhost:8080` dans votre navigateur.

## 🏗️ Architecture

```
MiniDash/
├── index.html
├── css/style.css
└── js/
    ├── main.js              # Logique principale
    ├── config.js            # Configuration gameplay
    ├── engine/
    │   ├── GameEngine.js    # Moteur de jeu
    │   └── Scale.js         # Système responsive
    ├── entities/
    │   ├── Entity.js        # Classe de base
    │   ├── Player.js        # Joueur
    │   ├── Obstacle.js      # Obstacle de base
    │   ├── Rectangle.js     # Plateforme
    │   ├── RectangleLarge.js # Grande plateforme
    │   ├── Triangle.js      # Pic mortel
    │   └── Finish.js        # Ligne d'arrivée
    ├── levels/
    │   ├── LevelManager.js  # Gestionnaire de niveaux
    │   └── level1.js        # Niveau 1
    └── utils/
        └── collision.js     # Détection collisions
```

## ✨ Fonctionnalités

- Gameplay responsive (PC, tablette, mobile)
- Physique réaliste (gravité, sauts)
- Rebonds automatiques
- Niveaux personnalisables (en mètres)
- Différents obstacles (rectangles, triangles, grandes plateformes)
- Ligne d'arrivée
- Pause et restart
