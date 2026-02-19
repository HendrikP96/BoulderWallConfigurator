# Boulder Wall Configurator

Ein interaktiver 3D-Konfigurator für Kletterwände mit Routenplanung und Constraint-Validierung.

![Three.js](https://img.shields.io/badge/Three.js-black?logo=three.js)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)

## Features

- **3D-Visualisierung** einer Kletterwand mit platzierbaren Griffen
- **Routen-System** mit farbcodierter Zuordnung
- **Constraint-Validierung** für realistische Kletterrouten
- **Kollisionserkennung** zwischen Griffen (Mesh-zu-Mesh)
- **Echtzeit-Feedback** bei Regelverletzungen

---

## Architektur

### Schichtenmodell

```
┌─────────────────────────────────────────────────────────┐
│                    React UI Layer                        │
│         (ConfiguratorPanel, RoutePlannerPanel)           │
├─────────────────────────────────────────────────────────┤
│                      EventBus                            │
│              (Entkoppelte Kommunikation)                 │
├─────────────────────────────────────────────────────────┤
│                    Manager Layer                         │
│        (HoldManager, RouteManager, WallBuilder)          │
├─────────────────────────────────────────────────────────┤
│                  Constraint Layer                        │
│     (ConstraintManager, Reachability, Collision, ...)    │
├─────────────────────────────────────────────────────────┤
│                    Entity Layer                          │
│         (Wall, WallElement, BoltHole, Hold, Route)       │
├─────────────────────────────────────────────────────────┤
│                   Three.js Engine                        │
│        (SceneController, InputManager, Renderer)         │
└─────────────────────────────────────────────────────────┘
```

### Kommunikation via EventBus

Die Komponenten kommunizieren **ausschließlich über Events** - keine direkten Aufrufe zwischen Layern.

```javascript
// Beispiel: UI ändert Farbe
eventBus.emit("ui:colorChanged", { color: "#FF6B6B" });

// HoldManager reagiert
eventBus.on("ui:colorChanged", function(data) {
  self.setSelectedColor(data.color);
});
```

**Vorteile:**
- Lose Kopplung zwischen Komponenten
- Einfaches Testen (Events mocken)
- Neue Features können Events abonnieren ohne bestehenden Code zu ändern

---

## Design Patterns

### Singleton Pattern

Verwendet für Manager-Klassen die genau einmal existieren dürfen:

```javascript
class HoldManager extends Singleton {
  constructor() {
    super();
    if (this._isInitialized) return;
    this._isInitialized = true;
    // ...
  }
}

// Verwendung
let manager = HoldManager.getInstance();
```

**Anwendung:** `EventBus`, `HoldManager`, `ConstraintManager`, `InputManager`

**Warum Singleton?**
- Zentrale Zustandsverwaltung
- Garantiert konsistente Instanz
- Vermeidet Parameter-Durchreichung durch alle Ebenen

### Strategy Pattern (Constraints)

Constraints implementieren ein gemeinsames Interface:

```javascript
class Constraint {
  validate(context) { /* überschreiben */ }
  isHard() { return this.type === ConstraintType.HARD; }
}

class ReachabilityConstraint extends Constraint {
  validate(context) {
    // Prüft ob Route kletterbar ist
  }
}
```

**Vorteile:**
- Neue Constraints ohne Änderung am ConstraintManager
- Constraints sind austauschbar
- Einheitliche Validierungslogik

### Observer Pattern (EventBus)

```javascript
eventBus.on("hold:placed", callback);   // Subscribe
eventBus.emit("hold:placed", data);     // Notify
eventBus.off("hold:placed", callback);  // Unsubscribe
```

---

## Constraint-System

### Constraint-Typen

| Typ | Verhalten | Beispiel |
|-----|-----------|----------|
| **HARD** | Blockiert Aktion | Kollision zwischen Holds |
| **SOFT** | Warnung, erlaubt aber | Zu große Distanz zwischen Griffen |

### Implementierte Constraints

#### ReachabilityConstraint (SOFT)

Prüft ob ein kletterbarer Pfad vom Start zum Top existiert.

**Algorithmus:**
1. Baue Erreichbarkeits-Graph (welche Griffe können voneinander erreicht werden)
2. BFS vom niedrigsten zum höchsten Griff
3. Wenn kein Pfad: Analysiere warum (isolierte Griffe, zu große Distanz)

```javascript
// Erreichbarkeitskriterien
maxReach: 1.2,            // 3D-Distanz in Metern
maxHorizontalReach: 0.8,  // Seitliche Reichweite
maxVerticalStep: 1.0      // Maximaler Schritt nach oben
```

**Komplexität:** O(n²) für Graph-Aufbau, O(n) für BFS

#### StartPositionConstraint (SOFT)

Prüft ob der niedrigste Griff vom Boden erreichbar ist.

```javascript
maxStartHeight: 1.0  // Meter über Boden
```

#### HoldCollisionConstraint (HARD)

Verhindert überlappende Griffe.

**Technik:** Mesh-zu-Mesh Intersection mit `three-mesh-bvh`

```javascript
// Bounding Volume Hierarchy für schnelle Intersection
mesh.geometry.boundsTree = new MeshBVH(mesh.geometry);

// Intersection-Check
let matrixBtoA = meshA.matrixWorld.invert().multiply(meshB.matrixWorld);
meshA.geometry.boundsTree.intersectsGeometry(meshB.geometry, matrixBtoA);
```

**Warum BVH statt Bounding Box?**
- Bounding Box zu ungenau für längliche/unregelmäßige Griffe
- BVH ermöglicht präzise Geometrie-Prüfung
- Performant durch hierarchische Unterteilung

### Constraint-Validierung

```javascript
// ConstraintManager sammelt Ergebnisse
validateAll(context) {
  let results = {
    isValid: true,
    hardViolations: [],
    softViolations: [],
    passed: []
  };
  
  for (let constraint of this.constraints) {
    let result = constraint.validate(context);
    if (result === null) continue;  // Vorbedingung nicht erfüllt
    
    if (result.valid) {
      results.passed.push(...);
    } else if (constraint.isHard()) {
      results.hardViolations.push(...);
      results.isValid = false;
    } else {
      results.softViolations.push(...);
    }
  }
  return results;
}
```

---

## Entity-Struktur

### Wall

Container für WallElements. Verwaltet Position und Material.

```
Wall
├── WallElement (Segment 1)
│   ├── Mesh (sichtbare Wand)
│   └── BoltHoles[]
│       ├── BoltHole → Hold (optional)
│       └── BoltHole → null
└── WallElement (Segment 2)
    └── ...
```

### BoltHole

Bohrloch auf der Wand. Kann einen Hold aufnehmen.

```javascript
class BoltHole {
  position;     // {x, y, z}
  hold;         // Hold | null
  collider;     // SphereCollider für Raycasts
  
  isEmpty() { return this.hold === null; }
  onClick() { }   // Leer - Logik in HoldManager
  onHover() { this.setHovered(true); }
}
```

**Design-Entscheidung:** `onClick()` ist leer, weil die Platzierungslogik im HoldManager liegt. Das ermöglicht Tool-abhängiges Verhalten (Place vs. Delete).

### Hold

Klettergriff mit Mesh und Eigenschaften.

```javascript
class Hold {
  typeId;   // Griff-Typ (1-7)
  color;    // Hex-Farbe
  scale;    // Größe
  mesh;     // Three.js Mesh
}
```

### BoulderRoute

Route = Sammlung von Holds mit gleicher Farbe.

```javascript
class BoulderRoute {
  id;                 // UUID
  name;               // "Rote Route"
  color;              // "#e74c3c"
  holds;              // BoltHole[]
  validationResults;  // Constraint-Ergebnisse
  
  isComplete() {
    return results.isValid && results.softViolations.length === 0;
  }
}
```

---

## Manager-Klassen

### HoldManager

Zentrale Verwaltung von Griffen.

**Verantwortlichkeiten:**
- Prefab-Verwaltung (GLTF-Modelle vorladen)
- Hold-Platzierung/-Entfernung
- Preview beim Hover
- Kollisionsprüfung vor Platzierung

**Event-Flow bei Platzierung:**
```
User klickt BoltHole
  ↓
InputManager emittiert "interaction:click"
  ↓
HoldManager.placeHoldAt()
  ├── Erstelle Hold
  ├── Lade Mesh
  ├── HoldCollisionConstraint.validate()
  │   └── Bei Kollision: Revert + "placement:blocked"
  └── Bei Erfolg: "hold:placed"
```

### RouteManager

Verwaltet Routen basierend auf Griff-Farben.

**Automatische Routen-Erstellung:**
- Neuer Hold mit neuer Farbe → Neue Route
- Letzter Hold einer Farbe entfernt → Route gelöscht

```javascript
addHoldToRoute(boltHole) {
  let color = boltHole.getHold().getColor();
  let route = this.getRouteByColor(color);
  
  if (route === null) {
    route = new BoulderRoute(color);  // Neue Route!
    this.routes.push(route);
  }
  
  route.addHold(boltHole);
  this.validateAndStoreResults(route);
}
```

### WallBuilder

Erstellt die 3D-Wand mit Bohrlöchern.

```javascript
let wall = WallBuilder.createWall(
  width,       // 2.4m
  height,      // 3.0m
  holeSpacing  // 0.2m
);
```

---

## 3D-Engine

### SceneController

Initialisiert Three.js und orchestriert Komponenten.

```javascript
init(container) {
  this.setupRenderer();
  this.setupCamera();
  this.setupLighting();
  this.setupControls();
  
  this.holdManager.preloadAll(() => {
    this.buildWall();
    this.animate();
  });
}
```

### InputManager

Verarbeitet Maus-Events und Raycasting.

```javascript
update() {
  this.raycaster.setFromCamera(this.mouse, this.camera);
  let intersects = this.raycaster.intersectObjects(this.colliders);
  
  // Hover-Logik
  if (newTarget !== this.hoveredTarget) {
    this.hoveredTarget?.onHoverExit();
    newTarget?.onHover();
    eventBus.emit("interaction:hover", newTarget);
  }
}
```

### ConstraintVisualizer

Visualisiert Constraint-Verletzungen:
- Rote Linien zwischen problematischen Griffen
- Blinkende Griffe bei Hover über Warnung
- Distanz-Labels

---

## UI-Komponenten

### ConfiguratorPanel (rechts)

- Tool-Auswahl (Platzieren/Löschen)
- Griff-Typ Auswahl mit 3D-Preview
- Farb-Picker
- Größen-Auswahl

### RoutePlannerPanel (links)

- Liste aller Routen
- Constraint-Status pro Route
- Hover über Warnung → Visualisierung in 3D
- "Routenplanung abschließen" Button (nur wenn alle Routen valid)

---

## Code-Stil

### Konventionen

```javascript
// let statt const (Konsistenz)
let variable = value;

// ES5 function statt Arrow (für self-Pattern)
eventBus.on("event", function(data) {
  let self = this;
  // ...
});

// Explizite Vergleiche
if (value === null) { }      // statt !value
if (arr.length === 0) { }    // statt !arr.length

// for-Schleifen statt forEach
for (let i = 0; i < items.length; i++) {
  let item = items[i];
}
```

### Keine unnötigen Null-Checks

```javascript
// ❌ Nicht so
if (data === null || data === undefined) { return; }

// ✅ Nur wenn Null tatsächlich möglich
// Events liefern immer valide Daten
```

---

## Projektstruktur

```
src/
├── components/
│   └── ui/
│       ├── ConfiguratorPanel.jsx
│       ├── RoutePlannerPanel.jsx
│       └── HoldTypeSelector.jsx
├── constraints/
│   ├── Constraint.js           # Basis-Klasse
│   ├── ConstraintManager.js    # Singleton
│   ├── placement/
│   │   └── HoldCollisionConstraint.js
│   └── route/
│       ├── ReachabilityConstraint.js
│       └── StartPositionConstraint.js
├── constants/
│   └── constraintConfig.js     # Konfigurationswerte
├── engine/
│   ├── SceneController.js
│   ├── InputManager.js
│   ├── EventBus.js
│   └── ConstraintVisualizer.js
├── entities/
│   ├── Wall.js
│   ├── WallElement.js
│   ├── BoltHole.js
│   ├── Hold.js
│   └── BoulderRoute.js
├── managers/
│   ├── HoldManager.js
│   ├── RouteManager.js
│   └── WallBuilder.js
└── utils/
    ├── Singleton.js
    ├── Collider.js
    └── SphereCollider.js
```

---

## Technologie-Stack

| Technologie | Verwendung |
|-------------|------------|
| **Three.js** | 3D-Rendering, Raycasting |
| **three-mesh-bvh** | Präzise Mesh-Kollision |
| **React** | UI-Komponenten |
| **Vite** | Build-Tool, HMR |

---

## Erweiterungsmöglichkeiten

### Export/Import (nächster Schritt)

```json
{
  "version": "1.0",
  "wall": { "width": 2.4, "height": 3.0 },
  "routes": [{
    "name": "Rote Route",
    "color": "#e74c3c",
    "holds": [{
      "boltHolePosition": { "row": 2, "col": 3 },
      "holdType": "jug_large",
      "scale": 0.5
    }]
  }]
}
```

### Weitere Constraints

- **TopHoldConstraint** - Prüft ob höchster Griff als Ziel geeignet
- **HoldDensityConstraint** - Mindestanzahl Griffe pro Route
- **SymmetryConstraint** - Warnung bei stark asymmetrischen Routen

### Undo/Redo

Command-Pattern für Aktions-History:

```javascript
class PlaceHoldCommand {
  execute() { /* platzieren */ }
  undo() { /* entfernen */ }
}
```

---

## Installation & Start

```bash
npm install
npm run dev
```

---

## Interview-Cheatsheet

**"Warum EventBus statt Props?"**
→ Entkopplung. UI und Engine kennen sich nicht. Neue Features können Events abonnieren.

**"Warum BFS für Erreichbarkeit?"**
→ Findet kürzesten Pfad (wenigste Züge). O(n) bei Graph bereits gebaut.

**"Warum Mesh-Kollision statt Bounding Box?"**
→ Holds sind unregelmäßig geformt. Bounding Box hätte viele false positives.

**"Warum Singleton für Manager?"**
→ Zentrale Instanz, kein Durchreichen durch Komponenten, konsistenter Zustand.

**"Hard vs Soft Constraints?"**
→ Hard blockiert (Kollision macht keinen Sinn). Soft warnt (Route schwierig aber möglich).

**"Warum let statt const überall?"**
→ Stilentscheidung für Konsistenz. Weniger cognitive load.
