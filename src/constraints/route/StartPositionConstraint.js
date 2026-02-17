import { Constraint, ConstraintType } from '../Constraint.js';

/**
 * StartPositionConstraint (SOFT)
 * 
 * Prüft ob der niedrigste Hold einer Route vom Boden aus erreichbar ist.
 * Ein Kletterer muss den ersten Hold greifen können ohne zu springen.
 * 
 * Context: {
 *   route: BoulderRoute  // Route mit getHolds()
 * }
 */
class StartPositionConstraint extends Constraint {

  constructor(options) {
    super("StartPosition", ConstraintType.SOFT);
    
    options = options || {};
    
    // Maximale Starthöhe (vom Boden erreichbar, ca. Armreichweite)
    this.maxStartHeight = options.maxStartHeight || 1.9;
  }

  validate(context) {
    let route = context.route;

    if (route === null || route === undefined) {
      return { valid: true, message: "Keine Route im Context" };
    }

    let holds = route.getHolds();

    if (holds.length === 0) {
      return { valid: true, message: "Keine Holds in der Route" };
    }

    // Finde den niedrigsten Hold (kleinste Y-Koordinate)
    let lowestHold = this.findLowestHold(holds);
    let startHeight = lowestHold.getPosition().y;

    // Prüfe maximale Starthöhe (erreichbar vom Boden)
    if (startHeight > this.maxStartHeight) {
      let heightCm = Math.round(startHeight * 100);
      let maxCm = Math.round(this.maxStartHeight * 100);
      return {
        valid: false,
        message: "Start-Hold zu hoch (" + heightCm + "cm > " + maxCm + "cm)"
      };
    }

    return { valid: true, message: "Starthöhe OK (" + Math.round(startHeight * 100) + "cm)" };
  }

  findLowestHold(holds) {
    let lowest = holds[0];
    let lowestY = lowest.getPosition().y;

    for (let i = 1; i < holds.length; i++) {
      let currentY = holds[i].getPosition().y;
      if (currentY < lowestY) {
        lowest = holds[i];
        lowestY = currentY;
      }
    }

    return lowest;
  }

  // --- Getter ---

  getMaxStartHeight() {
    return this.maxStartHeight;
  }
}

export default StartPositionConstraint;
