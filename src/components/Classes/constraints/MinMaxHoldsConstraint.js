import { Constraint, ConstraintType } from './Constraint.js';

/**
 * MinMaxHoldsConstraint (SOFT) - Prüft ob Route zwischen min und max Holds hat.
 */
class MinMaxHoldsConstraint extends Constraint {

  constructor(minHolds, maxHolds) {
    super("MinMaxHolds", ConstraintType.SOFT);
    
    this.minHolds = minHolds || 4;
    this.maxHolds = maxHolds || 20;
  }

  validate(context) {
    let route = context.route;

    if (route === null || route === undefined) {
      return { valid: true, message: "Keine Route im Context" };
    }

    let holdCount = route.getHoldCount();

    if (holdCount < this.minHolds) {
      return {
        valid: false,
        message: "Route braucht mindestens " + this.minHolds + " Holds (aktuell: " + holdCount + ")"
      };
    }

    if (holdCount > this.maxHolds) {
      return {
        valid: false,
        message: "Route hat zu viele Holds: " + holdCount + " (max: " + this.maxHolds + ")"
      };
    }

    return {
      valid: true,
      message: "Hold-Anzahl OK (" + holdCount + ")"
    };
  }

  getMinHolds() {
    return this.minHolds;
  }

  getMaxHolds() {
    return this.maxHolds;
  }
}

export default MinMaxHoldsConstraint;
