import { Constraint, ConstraintType } from './Constraint.js';

/**
 * RouteSeparationConstraint (SOFT) - Warnt wenn Routen zu nah beieinander liegen.
 */
class RouteSeparationConstraint extends Constraint {

  constructor(minDistance) {
    super("RouteSeparation", ConstraintType.SOFT);
    
    if (minDistance === undefined) {
      this.minDistance = 0.15;
    } else {
      this.minDistance = minDistance;
    }
  }

  validate(context) {
    let route1Holds = context.route1Holds;
    let route2Holds = context.route2Holds;

    if (route1Holds === null || route1Holds === undefined || route2Holds === null || route2Holds === undefined) {
      let skipResult = {
        valid: true,
        message: "Keine Routen-Holds im Context"
      };
      return skipResult;
    }

    if (route1Holds.length === 0 || route2Holds.length === 0) {
      let emptyResult = {
        valid: true,
        message: "Eine oder beide Routen sind leer"
      };
      return emptyResult;
    }

    for (let i = 0; i < route1Holds.length; i++) {
      let hold1 = route1Holds[i];
      
      for (let j = 0; j < route2Holds.length; j++) {
        let hold2 = route2Holds[j];
        let distance = this.calculateDistance2D(hold1, hold2);

        if (distance < this.minDistance) {
          let distanceCm = Math.round(distance * 100);
          let failResult = {
            valid: false,
            message: "Routen zu nah beieinander (" + distanceCm + "cm < " + (this.minDistance * 100) + "cm Minimum)"
          };
          return failResult;
        }
      }
    }

    let successResult = {
      valid: true,
      message: "Routen haben ausreichend Abstand"
    };
    return successResult;
  }


  // sollte im 3D Raum berechnet werden, da ja bei Überhängen nicht die selbe z Achse da ist - ANPASSUNG NÖTIG
  calculateDistance2D(pos1, pos2) {
    let dx = pos1.x - pos2.x;
    let dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getMinDistance() {
    return this.minDistance;
  }
}

export default RouteSeparationConstraint;
