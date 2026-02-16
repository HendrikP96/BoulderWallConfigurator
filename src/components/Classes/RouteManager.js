import { BoulderRoute } from './BoulderRoute.js';
import ConstraintManager from './constraints/ConstraintManager.js';
import BoltHoleOccupiedConstraint from './constraints/BoltHoleOccupiedConstraint.js';
import HoldDistanceConstraint from './constraints/HoldDistanceConstraint.js';
import RouteSeparationConstraint from './constraints/RouteSeparationConstraint.js';

/**
 * RouteManager - Verwaltet Kletterrouten auf einer Wand.
 * Prüft via Constraints ob neue Holds platziert werden können.
 */
class RouteManager {

  constructor(wall) {
    this.wall = wall;
    this.routes = [];

    this.constraintManager = new ConstraintManager();
    this.constraintManager.addConstraint(new BoltHoleOccupiedConstraint());
    this.constraintManager.addConstraint(new HoldDistanceConstraint());
    this.constraintManager.addConstraint(new RouteSeparationConstraint());
  }

  createRoute(name, color) {
    let route = new BoulderRoute(name, color);
    this.routes.push(route);
    return route;
  }

  removeRoute(routeId) {
    let index = -1;
    
    for (let i = 0; i < this.routes.length; i++) {
      if (this.routes[i].getId() === routeId) {
        index = i;
        break;
      }
    }
    
    if (index === -1) {
      return null;
    }
    
    let removedRoute = this.routes[index];
    this.routes.splice(index, 1);
    return removedRoute;
  }

  getRouteById(routeId) {
    for (let i = 0; i < this.routes.length; i++) {
      if (this.routes[i].getId() === routeId) {
        return this.routes[i];
      }
    }
    return undefined;
  }

  getRoutes() {
    return this.routes;
  }

  /**
   * Prüft ob ein Hold auf einem BoltHole platziert werden kann.
   * Berücksichtigt BoltHole-Belegung und Abstand zum letzten Hold.
   */
  canPlaceHold(boltHole, route) {
    let context = { boltHole: boltHole };

    if (route !== null && route !== undefined) {
      if (route.getHoldCount() > 0) {
        let holds = route.getHolds();
        let lastHoldIndex = route.getHoldCount() - 1;
        let lastHold = holds[lastHoldIndex];
        context.hold1Position = lastHold.getPosition();
        context.hold2Position = boltHole.getPosition();
      }
    }

    return this.constraintManager.validateAll(context);
  }

  /**
   * Fügt einen Hold zur Route hinzu mit vorheriger Constraint-Prüfung.
   */
  addHoldToRoute(route, boltHole) {
    let validation = this.canPlaceHold(boltHole, route);

    if (validation.isValid === false) {
      let result = {
        success: false,
        violations: validation.hardViolations,
        warnings: validation.softViolations
      };
      return result;
    }

    route.addHold(boltHole);
    
    let result = {
      success: true,
      warnings: validation.softViolations
    };
    return result;
  }

  checkRouteSeparation(route1, route2) {
    let route1Holds = [];
    let holds1 = route1.getHolds();
    for (let i = 0; i < holds1.length; i++) {
      route1Holds.push(holds1[i].getPosition());
    }

    let route2Holds = [];
    let holds2 = route2.getHolds();
    for (let i = 0; i < holds2.length; i++) {
      route2Holds.push(holds2[i].getPosition());
    }

    let context = {
      route1Holds: route1Holds,
      route2Holds: route2Holds
    };

    return this.constraintManager.validateAll(context);
  }

  /**
   * Validiert eine komplette Route (Mindest-Holds, Abstände).
   */
  validateRoute(route) {
    let errors = [];

    if (route.getHoldCount() < 3) {
      errors.push("Route braucht mindestens 3 Holds");
    }

    let holds = route.getHolds();
    for (let i = 1; i < holds.length; i++) {
      let context = {
        hold1Position: holds[i - 1].getPosition(),
        hold2Position: holds[i].getPosition()
      };
      let result = this.constraintManager.validateAll(context);

      if (result.softViolations.length > 0) {
        let message = "Hold " + (i + 1) + ": " + result.softViolations[0].message;
        errors.push(message);
      }
    }

    let validationResult = {
      valid: errors.length === 0,
      errors: errors
    };
    return validationResult;
  }

  getWall() {
    return this.wall;
  }

  getConstraintManager() {
    return this.constraintManager;
  }
}

export default RouteManager;