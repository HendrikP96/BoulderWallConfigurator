import { Constraint, ConstraintType } from './Constraint.js';

/**
 * BoltHoleOccupiedConstraint (HARD) - Prüft ob ein BoltHole bereits belegt ist.
 */
class BoltHoleOccupiedConstraint extends Constraint {

  constructor() {
    super("BoltHoleOccupied", ConstraintType.HARD);
  }

  validate(context) {
    let boltHole = context.boltHole;

    if (boltHole === null || boltHole === undefined) {
      let skipResult = {
        valid: true,
        message: "Kein BoltHole im Context"
      };
      return skipResult;
    }

    if (boltHole.isEmpty()) {
      let successResult = {
        valid: true,
        message: "BoltHole ist frei"
      };
      return successResult;
    } else {
      let failResult = {
        valid: false,
        message: "BoltHole ist bereits belegt"
      };
      return failResult;
    }
  }
}

export default BoltHoleOccupiedConstraint;
