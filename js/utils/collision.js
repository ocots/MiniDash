// Détection de collision AABB (Axis-Aligned Bounding Box)
export function checkAABBCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Collision entre deux polygones convexes (SAT - Separating Axis Theorem)
export function checkPolygonCollision(poly1, poly2) {
    // poly1 et poly2 sont des tableaux de points [{x, y}, ...]
    const polygons = [poly1, poly2];
    
    for (const polygon of polygons) {
        for (let i = 0; i < polygon.length; i++) {
            const j = (i + 1) % polygon.length;
            
            // Calculer la normale de l'arête
            const edge = {
                x: polygon[j].x - polygon[i].x,
                y: polygon[j].y - polygon[i].y
            };
            const normal = { x: -edge.y, y: edge.x };
            
            // Projeter les deux polygones sur cet axe
            let min1 = Infinity, max1 = -Infinity;
            let min2 = Infinity, max2 = -Infinity;
            
            for (const point of poly1) {
                const proj = point.x * normal.x + point.y * normal.y;
                min1 = Math.min(min1, proj);
                max1 = Math.max(max1, proj);
            }
            
            for (const point of poly2) {
                const proj = point.x * normal.x + point.y * normal.y;
                min2 = Math.min(min2, proj);
                max2 = Math.max(max2, proj);
            }
            
            // Si les projections ne se chevauchent pas, pas de collision
            if (max1 < min2 || max2 < min1) {
                return false;
            }
        }
    }
    
    return true;
}

// Convertir un rectangle en polygone (4 points)
export function rectToPolygon(rect) {
    return [
        { x: rect.x, y: rect.y },
        { x: rect.x + rect.width, y: rect.y },
        { x: rect.x + rect.width, y: rect.y + rect.height },
        { x: rect.x, y: rect.y + rect.height }
    ];
}

// Créer un triangle (pointe en haut, base en bas)
export function createTrianglePolygon(x, y, width, height) {
    return [
        { x: x + width / 2, y: y },           // Pointe en haut
        { x: x, y: y + height },               // Coin bas gauche
        { x: x + width, y: y + height }        // Coin bas droit
    ];
}
