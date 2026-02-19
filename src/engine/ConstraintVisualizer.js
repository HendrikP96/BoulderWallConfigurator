import * as THREE from "three";
import EventBus from "./EventBus.js";

/**
 * ConstraintVisualizer
 * 
 * Visualisiert Constraint-Verletzungen in der 3D-Szene:
 * - Linien zwischen problematischen Holds
 * - Blinkende Holds bei Hover über Constraint-Warnung
 */
class ConstraintVisualizer {

  constructor(scene) {
    this.scene = scene;
    this.eventBus = EventBus.getInstance();
    this.activeLines = [];
    this.activeLabels = [];
    this.blinkingHolds = [];
    this.blinkInterval = null;
    this.originalMaterials = new Map();

    this.setupEventListeners();
  }

  setupEventListeners() {
    let self = this;

    this.eventBus.on("constraint:highlight", function(data) {
      self.showViolation(data.violation);
    });

    this.eventBus.on("constraint:clearHighlight", function() {
      self.clearVisualization();
    });
  }

  showViolation(violation) {
    this.clearVisualization();

    this.drawLine(violation.positions, violation.lineType);
    this.drawDistanceLabel(violation.positions, violation.lineType);
    this.startBlinking(violation.affectedHolds);
  }

  drawLine(positions, lineType) {
    let pos1 = positions[0];
    let pos2 = positions[1];

    let points = [];
    let material = new THREE.LineBasicMaterial({ 
      color: 0xff0000, 
      linewidth: 3,
      depthTest: false
    });

    if (lineType === "horizontal") {
      // Horizontale Linie auf gleicher Höhe
      let midY = (pos1.y + pos2.y) / 2;
      points.push(new THREE.Vector3(pos1.x, midY, pos1.z + 0.05));
      points.push(new THREE.Vector3(pos2.x, midY, pos2.z + 0.05));
    } else if (lineType === "vertical") {
      // Vertikale Linie auf gleicher X-Position
      let midX = (pos1.x + pos2.x) / 2;
      points.push(new THREE.Vector3(midX, pos1.y, pos1.z + 0.05));
      points.push(new THREE.Vector3(midX, pos2.y, pos2.z + 0.05));
    } else {
      // Direkte Linie zwischen den Holds
      points.push(new THREE.Vector3(pos1.x, pos1.y, pos1.z + 0.05));
      points.push(new THREE.Vector3(pos2.x, pos2.y, pos2.z + 0.05));
    }

    let geometry = new THREE.BufferGeometry().setFromPoints(points);
    let line = new THREE.Line(geometry, material);
    line.renderOrder = 999;

    this.scene.add(line);
    this.activeLines.push(line);
  }

  drawDistanceLabel(positions, lineType) {
    let pos1 = positions[0];
    let pos2 = positions[1];

    // Berechne Distanz je nach Typ
    let distance;
    if (lineType === "horizontal") {
      distance = Math.abs(pos2.x - pos1.x);
    } else if (lineType === "vertical") {
      distance = Math.abs(pos2.y - pos1.y);
    } else {
      let dx = pos2.x - pos1.x;
      let dy = pos2.y - pos1.y;
      let dz = pos2.z - pos1.z;
      distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    let distanceCm = Math.round(distance * 100);

    // Canvas für Text erstellen
    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 64;

    // Transparenter Hintergrund
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Rote Schrift
    context.font = '24px Segoe UI, Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillStyle = '#ff0000';
    context.fillText(distanceCm + ' cm', canvas.width / 2, canvas.height / 2);

    // Texture und Sprite erstellen
    let texture = new THREE.CanvasTexture(canvas);
    let spriteMaterial = new THREE.SpriteMaterial({ 
      map: texture,
      depthTest: false
    });
    let sprite = new THREE.Sprite(spriteMaterial);

    // Position in der Mitte der Linie
    let midX = (pos1.x + pos2.x) / 2;
    let midY = (pos1.y + pos2.y) / 2;
    let midZ = (pos1.z + pos2.z) / 2 + 0.15;

    sprite.position.set(midX, midY, midZ);
    sprite.scale.set(0.3, 0.15, 1);
    sprite.renderOrder = 1000;

    this.scene.add(sprite);
    this.activeLabels.push(sprite);
  }

  startBlinking(holds) {
    let self = this;
    this.blinkingHolds = holds;
    let isVisible = true;

    // Speichere Original-Materialien für alle Child-Meshes
    for (let i = 0; i < holds.length; i++) {
      let hold = holds[i].getHold();
      if (hold && hold.getMesh()) {
        hold.getMesh().traverse(function(child) {
          if (child.isMesh && child.material) {
            self.originalMaterials.set(child.uuid, {
              emissive: child.material.emissive ? child.material.emissive.clone() : null,
              emissiveIntensity: child.material.emissiveIntensity || 0
            });
          }
        });
      }
    }

    // Blink-Animation
    this.blinkInterval = setInterval(function() {
      isVisible = !isVisible;
      
      for (let i = 0; i < self.blinkingHolds.length; i++) {
        let hold = self.blinkingHolds[i].getHold();
        if (hold && hold.getMesh()) {
          hold.getMesh().traverse(function(child) {
            if (child.isMesh && child.material) {
              if (isVisible) {
                child.material.emissive = new THREE.Color(0xff0000);
                child.material.emissiveIntensity = 0.5;
              } else {
                child.material.emissive = new THREE.Color(0x000000);
                child.material.emissiveIntensity = 0;
              }
            }
          });
        }
      }
    }, 300);
  }

  stopBlinking() {
    let self = this;
    
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
      this.blinkInterval = null;
    }

    // Stelle Original-Materialien wieder her
    for (let i = 0; i < this.blinkingHolds.length; i++) {
      let hold = this.blinkingHolds[i].getHold();
      if (hold && hold.getMesh()) {
        hold.getMesh().traverse(function(child) {
          if (child.isMesh && child.material) {
            let original = self.originalMaterials.get(child.uuid);
            if (original && original.emissive) {
              child.material.emissive = original.emissive;
              child.material.emissiveIntensity = original.emissiveIntensity;
            } else {
              child.material.emissive = new THREE.Color(0x000000);
              child.material.emissiveIntensity = 0;
            }
          }
        });
      }
    }

    this.blinkingHolds = [];
    this.originalMaterials.clear();
  }

  clearVisualization() {
    // Entferne Linien
    for (let i = 0; i < this.activeLines.length; i++) {
      this.scene.remove(this.activeLines[i]);
      this.activeLines[i].geometry.dispose();
      this.activeLines[i].material.dispose();
    }
    this.activeLines = [];

    // Entferne Labels
    for (let i = 0; i < this.activeLabels.length; i++) {
      this.scene.remove(this.activeLabels[i]);
      this.activeLabels[i].material.map.dispose();
      this.activeLabels[i].material.dispose();
    }
    this.activeLabels = [];

    // Stoppe Blinken
    this.stopBlinking();
  }

  dispose() {
    this.clearVisualization();
    this.eventBus.off("constraint:highlight");
    this.eventBus.off("constraint:clearHighlight");
  }
}

export default ConstraintVisualizer;
