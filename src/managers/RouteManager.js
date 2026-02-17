import { BoulderRoute } from '../entities/BoulderRoute.js';
import EventBus from '../engine/EventBus.js';

class RouteManager {

  constructor(wall) {
    let self = this;
    this.wall = wall;
    this.routes = [];
    this.eventBus = EventBus.getInstance();

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
