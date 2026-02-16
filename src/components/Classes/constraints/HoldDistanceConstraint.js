import { Constraint, ConstraintType } from './Constraint.js';

/**
 * HoldDistanceConstraint (SOFT) - Warnt wenn Abstand zwischen Holds zu groß wird.
 */
class HoldDistanceConstraint extends Constraint {

  constructor(maxDistance, warningThreshold) {
    super("HoldDistance", ConstraintType.SOFT);
    
    if (maxDistance === undefined) {
      this.maxDistance = 0.6;
    } else {
      this.maxDistance = maxDistance;
    }
    
    if (warningThreshold === undefined) {
      this.warningThreshold = 0.5;
    } else {
      this.warningThreshold = warningThreshold;
    }
  }

  validate(context) {
    let hold1Position = context.hold1Position;
    let hold2Position = context.hold2Position;

    if (hold1Position === null || hold1Position === undefined || hold2Position === null || hold2Position === undefined) {
      let skipResult = {
        valid: true,
        message: "Keine Hold-Positionen im Context"
      };
      return skipResult;
    }

    let distance = this.calculateDistance(hold1Position, hold2Position);
    let distanceCm = Math.round(distance * 100);

    if (distance <= this.warningThreshold) {
      let successResult = {
        valid: true,
        message: "Abstand OK (" + distanceCm + "cm)"
      };
      return successResult;
    } else if (distance <= this.maxDistance) {
      let warningResult = {
        valid: false,
        message: "Abstand grenzwertig (" + distanceCm + "cm) - nähert sich Maximum von " + (this.maxDistance * 100) + "cm"
      };
      return warningResult;
    } else {
      let failResult = {
        valid: false,
        message: "Abstand zu groß (" + distanceCm + "cm > " + (this.maxDistance * 100) + "cm Maximum)"
      };
      return failResult;
    }
  }

  calculateDistance(pos1, pos2) {
    let dx = pos1.x - pos2.x;
    let dy = pos1.y - pos2.y;
    let dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  getMaxDistance() {
    return this.maxDistance;
  }

  getWarningThreshold() {
    return this.warningThreshold;
  }
}

export default HoldDistanceConstraint;
