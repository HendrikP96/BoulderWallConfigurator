import { Constraint, ConstraintType } from './Constraint.js';

/**
 * StartTopHoldConstraint (SOFT) - Prüft ob Route Start- und Top-Hold markiert hat.
 */
class StartTopHoldConstraint extends Constraint {

  constructor() {
    super("StartTopHold", ConstraintType.SOFT);
  }

  validate(context) {
    let route = context.route;

    if (route === null || route === undefined) {
      return { valid: true, message: "Keine Route im Context" };
    }

    let hasStart = route.getStartHold() !== null;
    let hasTop = route.getTopHold() !== null;

    if (!hasStart && !hasTop) {
      return {
        valid: false,
        message: "Start-Hold und Top-Hold nicht markiert"
      };
    }

    if (!hasStart) {
      return {
        valid: false,
        message: "Kein Start-Hold markiert"
      };
    }

    if (!hasTop) {
      return {
        valid: false,
        message: "Kein Top-Hold markiert"
      };
    }

    return {
      valid: true,
      message: "Start- und Top-Hold gesetzt"
    };
  }
}

export default StartTopHoldConstraint;
