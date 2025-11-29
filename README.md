# Geometry Dash - Mini

Un jeu de type runner 2D minimaliste en JavaScript vanilla.

## 🎮 Comment jouer

- **Espace** ou **Clic souris** : Sauter
- **Maintenir** : Rebonds automatiques
- **Objectif** : Éviter les obstacles et parcourir la plus grande distance

## 🚀 Lancer le jeu

### En local
Ouvrez simplement `index.html` dans votre navigateur.

### Avec un serveur local (recommandé)
```bash
# Python 3
python -m http.server 8000

# Ou avec Node.js
npx serve
```

Puis ouvrez `http://localhost:8000` dans votre navigateur.

## 📦 Déploiement sur GitHub Pages

1. Créer un repo GitHub
2. Pousser le code
3. Aller dans Settings > Pages
4. Sélectionner la branche `main` comme source
5. Le jeu sera accessible à `https://votre-username.github.io/geometry_dash/`

## 🏗️ Architecture

```
geometry_dash/
├── index.html              # Point d'entrée
├── css/
│   └── style.css          # Styles
├── js/
│   ├── main.js            # Logique principale
│   ├── config.js          # Configuration
│   ├── engine/
│   │   └── GameEngine.js  # Moteur de jeu
│   ├── entities/
│   │   ├── Player.js      # Joueur
│   │   └── Obstacle.js    # Obstacles
│   └── utils/
│       └── collision.js   # Détection collisions
└── README.md
```

## ✨ Fonctionnalités actuelles

- ✅ Joueur carré avec physique (gravité, sauts)
- ✅ Rebonds automatiques (maintien touche)
- ✅ Défilement automatique
- ✅ Obstacles aléatoires
- ✅ Détection de collision
- ✅ Score (distance parcourue)
- ✅ Game over et restart

## 🔜 Améliorations futures

- Plateformes flottantes
- Différents types d'obstacles (triangles, pics)
- Système de niveaux
- Musique et effets sonores
- Particules et animations
- Meilleur design visuel
