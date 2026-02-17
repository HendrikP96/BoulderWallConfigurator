import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Hold from '../entities/Hold.js';
import EventBus from '../engine/EventBus.js';

let instance = null;

class HoldManager {

  constructor() {
    if (instance !== null) {
      return instance;
    }
    instance = this;

    this.holdTypes = [1, 2, 3, 4, 5, 6];
    this.prefabs = {};
    this.isLoaded = false;
    this.gltfLoader = new GLTFLoader();
    this.createdHolds = [];

    this.previewMesh = null;
    this.previewParent = null;
    this.selectedType = 1;
    this.selectedColor = "#FF6B6B";
    this.selectedScale = 0.5;

    this.holdScale = 0.5;
    this.holdZOffset = 0.00;
    this.currentTool = "place";

    this.eventBus = EventBus.getInstance();
    this.subscribeToEvents();
  }

  subscribeToEvents() {
    let self = this;

    this.eventBus.on("interaction:click", function(target) {
      if (target === null || target === undefined) {
        return;
      }
      if (typeof target.isEmpty !== "function") {
        return;
      }
      if (self.currentTool === "place") {
        self.placeHoldAt(target);
      }
      if (self.currentTool === "delete") {
        self.removeHoldAt(target);
      }
    });

    this.eventBus.on("ui:holdTypeChanged", function(data) {
      self.setSelectedType(data.typeId);
      self.emitSettings();
    });

    this.eventBus.on("ui:colorChanged", function(data) {
      self.setSelectedColor(data.color);
      self.emitSettings();
    });

    this.eventBus.on("ui:toolChanged", function(data) {
      self.currentTool = data.tool;
      self.emitSettings();
    });

    this.eventBus.on("ui:scaleChanged", function(data) {
      self.selectedScale = data.scale;
      self.emitSettings();
    });

    this.eventBus.on("interaction:hover", function(target) {
      if (target === null || target === undefined) {
        return;
      }
      if (typeof target.isEmpty !== "function") {
        return;
      }
      if (self.currentTool === "place") {
        if (target.isEmpty()) {
          self.showPreviewAt(target);
        }
      }
      if (self.currentTool === "delete") {
        if (target.isEmpty() === false) {
          self.highlightHoldForDelete(target);
        }
      }
    });

    this.eventBus.on("interaction:hoverEnd", function(target) {
      if (target === null || target === undefined) {
        return;
      }
      if (self.currentTool === "place") {
        self.hidePreview();
      }
      if (self.currentTool === "delete") {
        self.unhighlightHold(target);
      }
    });

    this.eventBus.on("ui:removeHold", function(data) {
      self.removeHoldAt(data.boltHole);
    });
  }

  preloadAll(callback) {
    let self = this;
    let loadedCount = 0;
    let totalCount = this.holdTypes.length;

    for (let i = 0; i < this.holdTypes.length; i++) {
      let typeId = this.holdTypes[i];
      let path = "/models/Holds/Hold_" + typeId + "/Hold_" + typeId + ".glb";

      this.gltfLoader.load(path, function(gltf) {
        self.prefabs[typeId] = gltf.scene;
        loadedCount = loadedCount + 1;

        if (loadedCount === totalCount) {
          self.isLoaded = true;
          if (callback !== undefined) {
            callback();
          }
        }
      });
    }
  }

  placeHoldAt(boltHole) {
    if (boltHole.isEmpty() === false) {
      return;
    }

    let hold = this.createHold(this.selectedType, this.selectedColor);
    boltHole.setHold(hold);

    let pos = { x: 0, y: 0, z: 0 };
    let mesh = hold.createMesh(this, pos);

    if (mesh !== null) {
      boltHole.getMesh().add(mesh);
    }

    this.eventBus.emit("hold:placed", { boltHole: boltHole });
  }

  removeHoldAt(boltHole) {
    if (boltHole.isEmpty()) {
      return;
    }

    let hold = boltHole.getHold();
    let holdMesh = hold.getMesh();

    if (holdMesh !== null && holdMesh.visible === false) {
      return;
    }

    if (holdMesh !== null) {
      boltHole.getMesh().remove(holdMesh);
      hold.disposeMesh();
    }

    boltHole.removeHold();
    this.eventBus.emit("hold:removed", { boltHole: boltHole });
  }

  highlightHoldForDelete(boltHole) {
    let hold = boltHole.getHold();
    if (hold === null) {
      return;
    }
    let mesh = hold.getMesh();
    if (mesh === null || mesh.visible === false) {
      return;
    }
    mesh.traverse(function(child) {
      if (child.isMesh) {
        child.userData.originalMaterial = child.material;
        child.material = child.material.clone();
        child.material.opacity = 0.5;
        child.material.transparent = true;
        child.material.color.set("#ff0000");
      }
    });
  }

  unhighlightHold(boltHole) {
    let hold = boltHole.getHold();
    if (hold === null) {
      return;
    }
    let mesh = hold.getMesh();
    if (mesh === null) {
      return;
    }
    mesh.traverse(function(child) {
      if (child.isMesh && child.userData.originalMaterial) {
        child.material = child.userData.originalMaterial;
      }
    });
  }

  createHold(typeId, color) {
    if (color === undefined) {
      color = "#ffffff";
    }

    let typeExists = false;
    for (let i = 0; i < this.holdTypes.length; i++) {
      if (this.holdTypes[i] === typeId) {
        typeExists = true;
        break;
      }
    }

    if (typeExists === false) {
      typeId = this.holdTypes[0];
    }

    let hold = new Hold(typeId, color, this.selectedScale);
    this.createdHolds.push(hold);
    
    return hold;
  }

  showPreviewAt(boltHole) {
    this.hidePreview();

    let boltHoleMesh = boltHole.getMesh();
    if (boltHoleMesh === null) {
      return;
    }

    let prefab = this.getPrefab(this.selectedType);
    if (prefab === null) {
      return;
    }

    prefab.position.set(0, 0, this.holdZOffset);
    prefab.scale.set(this.selectedScale, this.selectedScale, this.selectedScale);

    let color = this.selectedColor;
    prefab.traverse(function(child) {
      if (child.isMesh) {
        child.material = new THREE.MeshBasicMaterial({
          color: color,
          wireframe: true
        });
      }
    });

    this.previewMesh = prefab;
    this.previewParent = boltHoleMesh;
    boltHoleMesh.add(this.previewMesh);
  }

  hidePreview() {
    if (this.previewMesh !== null && this.previewParent !== null) {
      this.previewParent.remove(this.previewMesh);
      this.previewMesh = null;
      this.previewParent = null;
    }
  }

  emitSettings() {
    this.eventBus.emit("settings:updated", {
      selectedType: this.selectedType,
      selectedColor: this.selectedColor,
      selectedScale: this.selectedScale,
      currentTool: this.currentTool
    });
  }

  // --- Getter / Setter ---

  static getInstance() {
    return instance;
  }

  getPrefab(typeId) {
    if (this.prefabs[typeId] === undefined) {
      return null;
    }
    return this.prefabs[typeId].clone();
  }

  getAvailableTypes() {
    let typesCopy = [];
    for (let i = 0; i < this.holdTypes.length; i++) {
      typesCopy.push(this.holdTypes[i]);
    }
    return typesCopy;
  }

  getSelectedType() {
    return this.selectedType;
  }

  setSelectedType(typeId) {
    this.selectedType = typeId;
  }

  getSelectedColor() {
    return this.selectedColor;
  }

  setSelectedColor(color) {
    this.selectedColor = color;
  }
}

export default HoldManager;
