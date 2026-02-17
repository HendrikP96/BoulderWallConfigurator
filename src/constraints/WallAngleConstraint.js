import { Constraint, ConstraintType } from './Constraint.js';

/**
 * WallAngleConstraint (HARD) - Prüft ob ein Winkel für Wandelemente erlaubt ist.
 */
class WallAngleConstraint extends Constraint {

  constructor(allowedAngles) {
    super("WallAngle", ConstraintType.HARD);
    
    if (allowedAngles === undefined) {
      this.allowedAngles = [0, -15, -30, -45];
    } else {
      this.allowedAngles = allowedAngles;
    }
  }

  validate(context) {
    let angle = context.angle;

    if (angle === undefined) {
      let skipResult = {
        valid: true,
        message: "Kein Winkel im Context"
      };
      return skipResult;
    }

    let isAllowed = false;
    for (let i = 0; i < this.allowedAngles.length; i++) {
      if (this.allowedAngles[i] === angle) {
        isAllowed = true;
        break;
      }
    }

    if (isAllowed) {
      let successResult = {
        valid: true,
        message: "Winkel " + angle + "° ist erlaubt"
      };
      return successResult;
    } else {
      let anglesString = "";
      for (let i = 0; i < this.allowedAngles.length; i++) {
        if (i > 0) {
          anglesString = anglesString + "°, ";
        }
        anglesString = anglesString + this.allowedAngles[i];
      }
      anglesString = anglesString + "°";
      
      let failResult = {
        valid: false,
        message: "Winkel " + angle + "° nicht erlaubt. Erlaubte Winkel: " + anglesString
      };
      return failResult;
    }
  }

  getAllowedAngles() {
    let copy = [];
    for (let i = 0; i < this.allowedAngles.length; i++) {
      copy.push(this.allowedAngles[i]);
    }
    return copy;
  }
}

export default WallAngleConstraint;
