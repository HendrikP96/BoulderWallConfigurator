import { BoulderRoute } from '../entities/BoulderRoute.js';
import EventBus from '../engine/EventBus.js';
import ConstraintManager from '../constraints/ConstraintManager.js';
import ReachabilityConstraint from '../constraints/route/ReachabilityConstraint.js';
import StartPositionConstraint from '../constraints/route/StartPositionConstraint.js';

class RouteManager {

  constructor(wall) {
    let self = this;
    this.wall = wall;
    this.routes = [];
    this.eventBus = EventBus.getInstance();
    
    // Route Constraints initialisieren
    this.constraintManager = ConstraintManager.getInstance();
    this.initRouteConstraints();

    this.eventBus.on("hold:placed", function(data) {
      self.addHoldToRoute(data.boltHole);
    });

    this.eventBus.on("hold:removed", function(data) {
      self.removeHoldFromRoute(data.boltHole);
    });

    this.eventBus.on("ui:routeRenamed", function(data) {
      let route = self.getRouteById(data.routeId);
      if (route) {
        route.setName(data.newName);
        self.eventBus.emit("routes:updated", self.routes);
      }
    });

    this.eventBus.on("ui:routeCleared", function(data) {
      self.clearRoute(data.routeId);
    });

    this.eventBus.on("ui:routeVisibilityToggled", function(data) {
      self.toggleRouteVisibility(data.routeId);
    });

    this.eventBus.on("ui:validateRoute", function(data) {
      self.validateRouteById(data.routeId);
    });
  }

  validateRouteById(routeId) {
    let route = this.getRouteById(routeId);
    if (route === null) {
      return;
    }

    let context = { route: route };
    let results = this.constraintManager.validateAll(context);

    // Sende Ergebnis ans UI
    this.eventBus.emit("route:validated", {
      routeId: routeId,
      isValid: results.isValid,
      softViolations: results.softViolations,
      hardViolations: results.hardViolations,
      passed: results.passed
    });
  }

  validateAndStoreResults(route) {
    let context = { route: route };
    let results = this.constraintManager.validateAll(context);
    route.setValidationResults(results);
  }

  initRouteConstraints() {
    // Nur hinzufügen wenn noch nicht vorhanden
    let existingConstraints = this.constraintManager.getConstraints();
    let hasReachability = false;
    let hasStartPosition = false;
    
    for (let i = 0; i < existingConstraints.length; i++) {
      if (existingConstraints[i].getName() === "Reachability") {
        hasReachability = true;
      }
      if (existingConstraints[i].getName() === "StartPosition") {
        hasStartPosition = true;
      }
    }
    
    if (hasReachability === false) {
      this.constraintManager.addConstraint(new ReachabilityConstraint({
        maxReach: 0.7,
        maxHorizontalReach: 1.0,
        maxVerticalStep: 0.8
      }));
    }
    
    if (hasStartPosition === false) {
      this.constraintManager.addConstraint(new StartPositionConstraint({
        maxStartHeight: 2.2
      }));
    }
  }

  toggleRouteVisibility(routeId) {
    let route = this.getRouteById(routeId);
    if (route === null) {
      return;
    }

    let newVisible = !route.isVisible();
    route.setVisible(newVisible);

    let holds = route.getHolds();
    for (let i = 0; i < holds.length; i++) {
      let boltHole = holds[i];
      let hold = boltHole.getHold();
      if (hold && hold.getMesh()) {
        hold.getMesh().visible = newVisible;
      }
    }

    this.eventBus.emit("routes:updated", this.routes);
  }

  clearRoute(routeId) {
    let route = this.getRouteById(routeId);
    if (route === null) {
      return;
    }

    let routeName = route.getName();
    let holds = route.getHolds().slice();

    for (let i = 0; i < holds.length; i++) {
      let boltHole = holds[i];
      this.eventBus.emit("ui:removeHold", { boltHole: boltHole });
    }

    let index = this.routes.indexOf(route);
    if (index !== -1) {
      this.routes.splice(index, 1);
    }

    this.eventBus.emit("route:deleted", { name: routeName });
    this.eventBus.emit("routes:updated", this.routes);
  }

  addHoldToRoute(boltHole) {
    let hold = boltHole.getHold();
    let color = hold.getColor();
    let route = this.getRouteByColor(color);
    let isNewRoute = false;

    if (route === null) {
      route = new BoulderRoute(color);
      this.routes.push(route);
      isNewRoute = true;
    }

    route.addHold(boltHole);
    this.validateAndStoreResults(route);
    this.eventBus.emit("routes:updated", this.routes);

    if (isNewRoute) {
      this.eventBus.emit("route:created", { name: route.getName() });
    }
  }

  removeHoldFromRoute(boltHole) {
    for (let i = 0; i < this.routes.length; i++) {
      let route = this.routes[i];
      if (route.containsHold(boltHole)) {
        route.removeHold(boltHole);

        if (route.getHoldCount() === 0) {
          let routeName = route.getName();
          this.routes.splice(i, 1);
          this.eventBus.emit("route:deleted", { name: routeName });
        } else {
          this.validateAndStoreResults(route);
        }
        break;
      }
    }
    this.eventBus.emit("routes:updated", this.routes);
  }

  // --- Getter / Setter ---

  getRouteByColor(color) {
    for (let i = 0; i < this.routes.length; i++) {
      if (this.routes[i].getColor() === color) {
        return this.routes[i];
      }
    }
    return null;
  }

  getRouteById(routeId) {
    for (let i = 0; i < this.routes.length; i++) {
      if (this.routes[i].getId() === routeId) {
        return this.routes[i];
      }
    }
    return null;
  }

  getRoutes() {
    return this.routes;
  }
}

export default RouteManager;
