import { Constraint, ConstraintType } from '../Constraint.js';

/**
 * ReachabilityConstraint (SOFT)
 * 
 * Prüft ob alle Holds einer Route erreichbar sind.
 * Checks:
 * - 3D-Distanz zwischen aufeinanderfolgenden Holds
 * - Horizontale Spannweite (deltaX) für Armreichweite
 * - Vertikale Distanz (deltaY) für Schritterhöhung
 * 
 * Context: {
 *   route: BoulderRoute  // Route mit getHolds()
 * }
 */
class ReachabilityConstraint extends Constraint {

  constructor(options) {
    super("Reachability", ConstraintType.SOFT);
    
    options = options || {};
    
    // Maximum 3D-Distanz zwischen zwei Holds (Armspanne diagonal)
    this.maxReach = options.maxReach || 0.7;
    
    // Maximum horizontale Distanz (Armspanne seitlich)
    this.maxHorizontalReach = options.maxHorizontalReach || 1.0;
    
    // Maximum vertikale Distanz nach oben (Schritterhöhung)
    this.maxVerticalStep = options.maxVerticalStep || 0.8;
  }

  validate(context) {
    let route = context.route;

    if (route === null || route === undefined) {
      return { valid: true, message: "Keine Route im Context" };
    }

    let holds = route.getHolds();

    if (holds.length < 2) {
      return { valid: true, message: "Weniger als 2 Holds - nicht prüfbar" };
    }

    // Sortiere Holds nach Höhe (Y-Koordinate) für logische Reihenfolge
    let sortedHolds = this.sortByHeight(holds);

    // Prüfe jeden Übergang zwischen aufeinanderfolgenden Holds
    let violations = [];

    for (let i = 0; i < sortedHolds.length - 1; i++) {
      let currentHold = sortedHolds[i];
      let nextHold = sortedHolds[i + 1];

      let currentPos = currentHold.getPosition();
      let nextPos = nextHold.getPosition();

      let result = this.checkTransition(currentPos, nextPos, i + 1);
      
      if (result.valid === false) {
        violations.push(result.message);
      }
    }

    if (violations.length > 0) {
      return {
        valid: false,
        message: violations.join("; ")
      };
    }

    return { valid: true, message: "Alle Holds erreichbar" };
  }

  checkTransition(pos1, pos2, transitionIndex) {
    let dx = Math.abs(pos2.x - pos1.x);
    let dy = pos2.y - pos1.y;  // Positiv = nach oben
    let dz = Math.abs(pos2.z - pos1.z);

    let distance3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // Prüfe 3D-Distanz
    if (distance3D > this.maxReach) {
      let distCm = Math.round(distance3D * 100);
      let maxCm = Math.round(this.maxReach * 100);
      return {
        valid: false,
        message: "Übergang " + transitionIndex + ": 3D-Abstand zu groß (" + distCm + "cm > " + maxCm + "cm)"
      };
    }

    // Prüfe horizontale Reichweite
    if (dx > this.maxHorizontalReach) {
      let dxCm = Math.round(dx * 100);
      let maxCm = Math.round(this.maxHorizontalReach * 100);
      return {
        valid: false,
        message: "Übergang " + transitionIndex + ": Horizontaler Abstand zu groß (" + dxCm + "cm > " + maxCm + "cm)"
      };
    }

    // Prüfe vertikale Schritterhöhung (nur nach oben)
    if (dy > this.maxVerticalStep) {
      let dyCm = Math.round(dy * 100);
      let maxCm = Math.round(this.maxVerticalStep * 100);
      return {
        valid: false,
        message: "Übergang " + transitionIndex + ": Vertikaler Schritt zu hoch (" + dyCm + "cm > " + maxCm + "cm)"
      };
    }

    return { valid: true };
  }

  sortByHeight(holds) {
    let holdsCopy = [];
    for (let i = 0; i < holds.length; i++) {
      holdsCopy.push(holds[i]);
    }

    holdsCopy.sort(function(a, b) {
      return a.getPosition().y - b.getPosition().y;
    });

    return holdsCopy;
  }

  // --- Getter ---

  getMaxReach() {
    return this.maxReach;
  }

  getMaxHorizontalReach() {
    return this.maxHorizontalReach;
  }

  getMaxVerticalStep() {
    return this.maxVerticalStep;
  }
}

export default ReachabilityConstraint;
