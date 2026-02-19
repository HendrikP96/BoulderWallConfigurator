import { Constraint, ConstraintType } from '../Constraint.js';

/**
 * ReachabilityConstraint (SOFT)
 * 
 * Prüft ob ein kletterbarer Pfad vom untersten zum obersten Griff existiert.
 * Nutzt Graph-Traversierung (BFS).
 * 
 * Logik:
 * 1. Baue Erreichbarkeits-Graph: Welche Griffe können voneinander erreicht werden?
 * 2. Finde Pfad vom niedrigsten zum höchsten Griff
 * 3. Wenn kein Pfad existiert: Zeige isolierte oder nicht erreichbare Griffe
 */
class ReachabilityConstraint extends Constraint {

  constructor(options) {
    super("Reachability", ConstraintType.SOFT);
    
    options = options || {};
    
    // Maximale 3D-Distanz zwischen zwei Griffen
    this.maxReach = options.maxReach;
    
    // Maximale horizontale Distanz (seitliche Armreichweite)
    this.maxHorizontalReach = options.maxHorizontalReach;
    
    // Maximaler vertikaler Schritt nach oben
    this.maxVerticalStep = options.maxVerticalStep;
  }

  validate(context) {
    let route = context.route;
    let holds = route.getHolds();

    if (holds.length < 2) {
      return null;  // Vorbedingung nicht erfüllt, kein Ergebnis
    }

    // Sortiere nach Höhe um Start und Ziel zu finden
    let sortedHolds = this.sortByHeight(holds);
    let startHold = sortedHolds[0];           // Niedrigster Griff
    let topHold = sortedHolds[sortedHolds.length - 1];  // Höchster Griff

    // Baue Erreichbarkeits-Graph: Für jeden Griff eine Liste erreichbarer Nachbarn
    let reachabilityGraph = this.buildReachabilityGraph(holds);

    // Finde Pfad vom Start zum Top via BFS
    let pathResult = this.findPath(holds, reachabilityGraph, startHold, topHold);

    if (pathResult.found) {
      return { 
        valid: true, 
        message: "Route kletterbar (Pfad mit " + pathResult.path.length + " Griffen gefunden)" 
      };
    }

    // Kein Pfad gefunden - analysiere warum
    let violations = this.analyzeUnreachableHolds(holds, reachabilityGraph, startHold);

    if (violations.length > 0) {
      let messages = [];
      for (let i = 0; i < violations.length; i++) {
        messages.push(violations[i].message);
      }
      return {
        valid: false,
        message: messages.join("; "),
        violations: violations
      };
    }

    // Fallback: Generische Fehlermeldung
    return {
      valid: false,
      message: "Kein kletterbarer Pfad vom Start zum Top gefunden"
    };
  }

  /**
   * Baut einen Erreichbarkeits-Graphen.
   * Für jeden Griff wird geprüft, welche anderen Griffe erreichbar sind.
   * Ergebnis: Map von Hold-Index zu Array von erreichbaren Hold-Indizes
   */
  buildReachabilityGraph(holds) {
    let graph = {};

    for (let i = 0; i < holds.length; i++) {
      graph[i] = [];
      let posA = holds[i].getWorldPosition();

      for (let j = 0; j < holds.length; j++) {
        if (i === j) continue;

        let posB = holds[j].getWorldPosition();
        
        // Prüfe ob Übergang möglich ist
        if (this.canReach(posA, posB)) {
          graph[i].push(j);
        }
      }
    }

    return graph;
  }

  /**
   * Prüft ob ein Übergang zwischen zwei Positionen möglich ist.
   * Gibt true/false zurück (keine Details).
   */
  canReach(pos1, pos2) {
    let dx = Math.abs(pos2.x - pos1.x);
    let dy = pos2.y - pos1.y;
    let dz = Math.abs(pos2.z - pos1.z);
    let distance3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

    // 3D-Distanz prüfen
    if (distance3D > this.maxReach) {
      return false;
    }

    // Horizontale Reichweite prüfen
    if (dx > this.maxHorizontalReach) {
      return false;
    }

    // Vertikaler Schritt nach oben prüfen (runter ist immer OK)
    if (dy > this.maxVerticalStep) {
      return false;
    }

    return true;
  }

  /**
   * Findet einen Pfad vom Start-Griff zum Ziel-Griff via BFS.
   * BFS findet den kürzesten Pfad (wenigste Züge).
   */
  findPath(holds, graph, startHold, targetHold) {
    let startIndex = holds.indexOf(startHold);
    let targetIndex = holds.indexOf(targetHold);

    // BFS-Queue: Jeder Eintrag ist [aktueller Index, bisheriger Pfad]
    let queue = [[startIndex, [startIndex]]];
    let visited = {};
    visited[startIndex] = true;

    while (queue.length > 0) {
      let current = queue.shift();
      let currentIndex = current[0];
      let currentPath = current[1];

      // Ziel erreicht?
      if (currentIndex === targetIndex) {
        // Wandle Index-Pfad in Hold-Pfad um
        let holdPath = [];
        for (let i = 0; i < currentPath.length; i++) {
          holdPath.push(holds[currentPath[i]]);
        }
        return { found: true, path: holdPath };
      }

      // Alle erreichbaren Nachbarn durchgehen
      let neighbors = graph[currentIndex];
      for (let i = 0; i < neighbors.length; i++) {
        let neighborIndex = neighbors[i];
        
        if (!visited[neighborIndex]) {
          visited[neighborIndex] = true;
          let newPath = currentPath.slice();
          newPath.push(neighborIndex);
          queue.push([neighborIndex, newPath]);
        }
      }
    }

    // Kein Pfad gefunden
    return { found: false, path: [] };
  }

  /**
   * Analysiert welche Griffe nicht erreichbar sind und warum.
   * Gibt detaillierte Violations für das UI zurück.
   */
  analyzeUnreachableHolds(holds, graph, startHold) {
    let violations = [];
    let startIndex = holds.indexOf(startHold);

    // Finde alle vom Start aus erreichbaren Griffe (BFS)
    let reachableFromStart = {};
    reachableFromStart[startIndex] = true;
    let queue = [startIndex];

    while (queue.length > 0) {
      let currentIndex = queue.shift();
      let neighbors = graph[currentIndex];

      for (let i = 0; i < neighbors.length; i++) {
        let neighborIndex = neighbors[i];
        if (!reachableFromStart[neighborIndex]) {
          reachableFromStart[neighborIndex] = true;
          queue.push(neighborIndex);
        }
      }
    }

    // Finde isolierte Griffe (nicht vom Start erreichbar)
    for (let i = 0; i < holds.length; i++) {
      if (!reachableFromStart[i]) {
        let hold = holds[i];
        let pos = hold.getWorldPosition();
        let heightCm = Math.round(pos.y * 100);

        // Finde den nächsten erreichbaren Griff für die Visualisierung
        let nearestReachable = this.findNearestReachableHold(holds, i, reachableFromStart);

        if (nearestReachable !== null) {
          let nearestPos = nearestReachable.hold.getWorldPosition();
          let maxReachCm = Math.round(this.maxReach * 100);

          violations.push({
            valid: false,
            message: "Griff ist nicht erreichbar (max. " + maxReachCm + "cm Reichweite überschritten)",
            affectedHolds: [nearestReachable.hold, hold],
            lineType: "direct",
            positions: [nearestPos, pos]
          });
        } else {
          let maxReachCm = Math.round(this.maxReach * 100);
          violations.push({
            valid: false,
            message: "Griff ist isoliert (max. " + maxReachCm + "cm Reichweite überschritten)",
            affectedHolds: [hold],
            lineType: "direct",
            positions: [pos, pos]
          });
        }
      }
    }

    return violations;
  }

  /**
   * Findet den nächsten Griff aus der erreichbaren Menge zu einem isolierten Griff.
   */
  findNearestReachableHold(holds, isolatedIndex, reachableSet) {
    let isolatedPos = holds[isolatedIndex].getWorldPosition();
    let nearest = null;
    let nearestDistance = Infinity;

    for (let i = 0; i < holds.length; i++) {
      if (reachableSet[i]) {
        let pos = holds[i].getWorldPosition();
        let dx = pos.x - isolatedPos.x;
        let dy = pos.y - isolatedPos.y;
        let dz = pos.z - isolatedPos.z;
        let distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearest = { hold: holds[i], distance: distance };
        }
      }
    }

    return nearest;
  }

  sortByHeight(holds) {
    let holdsCopy = [];
    for (let i = 0; i < holds.length; i++) {
      holdsCopy.push(holds[i]);
    }

    holdsCopy.sort(function(a, b) {
      return a.getWorldPosition().y - b.getWorldPosition().y;
    });

    return holdsCopy;
  }

  getMaxReach() {
    return this.maxReach;
  }

  getMaxHorizontalReach() {
    return this.maxHorizontalReach;
  }

  getMaxVerticalStep() {
    return this.maxVerticalStep;
  }
}

export default ReachabilityConstraint;
