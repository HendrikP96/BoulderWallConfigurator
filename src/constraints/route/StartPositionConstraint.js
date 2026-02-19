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
    this.maxStartHeight = options.maxStartHeight;
  }

  validate(context) {
    let route = context.route;
    let holds = route.getHolds();

    if (holds.length === 0) {
      return null;
    }

    // Finde den niedrigsten Hold (kleinste Y-Koordinate)
    let lowestHold = this.findLowestHold(holds);
    let startHeight = lowestHold.getWorldPosition().y;

    // Prüfe maximale Starthöhe (erreichbar vom Boden)
    if (startHeight > this.maxStartHeight) {
      let heightCm = Math.round(startHeight * 100);
      let maxCm = Math.round(this.maxStartHeight * 100);
      return {
        valid: false,
        message: "Start-Hold zu hoch (Maximalhöhe von " + maxCm + "cm überschritten)"
      };
    }

    return { valid: true, message: "Starthöhe OK (" + Math.round(startHeight * 100) + "cm)" };
  }

  findLowestHold(holds) {
    let lowest = holds[0];
    let lowestY = lowest.getWorldPosition().y;

    for (let i = 1; i < holds.length; i++) {
      let currentY = holds[i].getWorldPosition().y;
      if (currentY < lowestY) {
        lowest = holds[i];
        lowestY = currentY;
      }
    }

    return lowest;
  }

  getMaxStartHeight() {
    return this.maxStartHeight;
  }
}

export default StartPositionConstraint;
