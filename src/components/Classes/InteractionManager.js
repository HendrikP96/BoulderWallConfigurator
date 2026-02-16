/**
 * InteractionManager - Koordiniert Nutzer-Interaktionen mit der Szene.
 * Delegiert Aktionen an die entsprechenden Manager und kommuniziert mit  UI-Komponenten.
 */
class InteractionManager {

  constructor(wall, holdFactory, routeManager, wallBuilder) {
    this.wall = wall;
    this.holdFactory = holdFactory;
    this.routeManager = routeManager;
    this.wallBuilder = wallBuilder;

    this.activeRoute = null;
    this.selectedHoldType = 1;
    this.selectedColor = "#FF6B6B";
    this.lastValidation = null;
  }

  selectRoute(routeId) {
    let route = this.routeManager.getRouteById(routeId);
    
    if (route === undefined || route === null) {
      return false;
    }
    
    this.activeRoute = route;
    this.selectedColor = route.getColor();
    return true;
  }

  createNewRoute(name, color) {
    let route = this.routeManager.createRoute(name, color);
    this.activeRoute = route;
    this.selectedColor = color;
    return route;
  }

  deselectRoute() {
    this.activeRoute = null;
  }

  selectHoldType(typeId) {
    let availableTypes = this.holdFactory.getAvailableTypes();
    let typeExists = false;
    
    for (let i = 0; i < availableTypes.length; i++) {
      if (availableTypes[i] === typeId) {
        typeExists = true;
        break;
      }
    }
    
    if (typeExists === true) {
      this.selectedHoldType = typeId;
      this.holdFactory.setSelectedType(typeId);
    }
  }

  selectColor(color) {
    this.selectedColor = color;
    this.holdFactory.setSelectedColor(color);
  }

  /**
   * Handler für Klick auf ein BoltHole.
   * Platziert Hold ohne Route wenn keine aktiv, sonst mit Route-Zuordnung.
   */
  onBoltHoleClick(boltHole) {
    if (this.activeRoute === null) {
      return this.placeHoldWithoutRoute(boltHole);
    }
    return this.placeHoldOnRoute(boltHole, this.activeRoute);
  }

  placeHoldWithoutRoute(boltHole) {
    if (boltHole.isEmpty() === false) {
      let violation = {
        name: "BoltHoleOccupied",
        message: "BoltHole ist bereits belegt"
      };
      
      this.lastValidation = {
        isValid: false,
        hardViolations: [violation]
      };
      
      let result = {
        success: false,
        violations: this.lastValidation.hardViolations
      };
      return result;
    }

    let hold = this.holdFactory.createHold(this.selectedHoldType, this.selectedColor);
    boltHole.snapHold(hold);

    this.lastValidation = {
      isValid: true,
      hardViolations: [],
      softViolations: []
    };
    
    let result = {
      success: true,
      hold: hold
    };
    return result;
  }

  // Platziert Hold mit Constraint-Prüfung und Route-Zuordnung.
  
  placeHoldOnRoute(boltHole, route) {
    let validation = this.routeManager.canPlaceHold(boltHole, route);
    this.lastValidation = validation;

    if (validation.isValid === false) {
      let result = {
        success: false,
        violations: validation.hardViolations,
        warnings: validation.softViolations
      };
      return result;
    }

    let hold = this.holdFactory.createHold(this.selectedHoldType, route.getColor());
    boltHole.snapHold(hold);
    route.addHold(boltHole);

    let result = {
      success: true,
      hold: hold,
      warnings: validation.softViolations
    };
    return result;
  }

  removeHold(boltHole) {
    if (boltHole.isEmpty() === true) {
      let result = {
        success: false,
        message: "Kein Hold zum Entfernen"
      };
      return result;
    }

    let removedHold = boltHole.removeHold();

    let routes = this.routeManager.getRoutes();
    for (let i = 0; i < routes.length; i++) {
      routes[i].removeHold(boltHole);
    }

    let result = {
      success: true,
      removedHold: removedHold
    };
    return result;
  }

  addWallOverhang(angle, width, height) {
    return this.wallBuilder.addOverhang(this.wall, angle, width, height);
  }

  getActiveRoute() {
    return this.activeRoute;
  }

  getSelectedHoldType() {
    return this.selectedHoldType;
  }

  getSelectedColor() {
    return this.selectedColor;
  }

  getLastValidation() {
    return this.lastValidation;
  }

  getWall() {
    return this.wall;
  }

  getRouteManager() {
    return this.routeManager;
  }

  getHoldFactory() {
    return this.holdFactory;
  }

  getWallBuilder() {
    return this.wallBuilder;
  }
}

export default InteractionManager;
