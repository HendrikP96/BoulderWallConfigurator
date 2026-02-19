/**
 * Zentrale Constraint-Konfiguration für Boulder-Routen
 * Wird beim App-Start vom ConstraintManager geladen
 */

let ROUTE_CONSTRAINTS = {
  reachability: {
    enabled: true,
    maxReach: 1.2,            // 120cm maximale 3D-Distanz (Armspanne)
    maxHorizontalReach: 1.5,  // 150cm maximale horizontale Distanz (mit Körperverlagerung)
    maxVerticalStep: 1.0      // 100cm maximaler vertikaler Schritt (dynamischer Zug)
  },
  startPosition: {
    enabled: true,
    maxStartHeight: 1.0       // 100cm maximale Starthöhe (vom Boden erreichbar)
  }
};

export { ROUTE_CONSTRAINTS };
