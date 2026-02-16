import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Hold from './Hold.js';

/**
 * HoldFactory - Singleton. Verwaltet Hold-Prefabs, Preview und Platzierung.
 */
let instance = null;

class HoldFactory {

  constructor() {
    if (instance !== null) {
      return instance;
    }
    instance = this;

    this.holdTypes = [1, 2, 4, 5, 6, 7];
    this.prefabs = {};
    this.isLoaded = false;
    this.gltfLoader = new GLTFLoader();
    this.createdHolds = [];

    // Preview-State
    this.previewMesh = null;
    this.previewParent = null;
    this.selectedType = 1;
    this.selectedColor = "#FF6B6B";

    // Hold-Einstellungen (zentral für Hold und Preview)
    this.holdScale = 0.7;
    this.holdZOffset = 0.00;
  }

  static getInstance() {
    return instance;
  }

  setSelectedType(typeId) {
    this.selectedType = typeId;
  }

  setSelectedColor(color) {
    this.selectedColor = color;
  }

  getSelectedType() {
    return this.selectedType;
  }

  getSelectedColor() {
    return this.selectedColor;
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

    // Position relativ zum BoltHole
    prefab.position.set(0, 0, this.holdZOffset);
    prefab.scale.set(this.holdScale, this.holdScale, this.holdScale);

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

  placeHoldAt(boltHole) {
    if (boltHole.isEmpty() === false) {
      return null;
    }

    let hold = this.createHold(this.selectedType, this.selectedColor);
    boltHole.setHold(hold);

    // Position relativ zum BoltHole
    let pos = { x: 0, y: 0, z: 0 };
    let mesh = hold.createMesh(this, pos);

    if (mesh !== null) {
      boltHole.getMesh().add(mesh);
    }

    return hold;
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

  getPrefab(typeId) {
    if (this.prefabs[typeId] === undefined) {
      return null;
    }
    return this.prefabs[typeId].clone();
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
      console.warn("Hold-Typ " + typeId + " existiert nicht. Verwende Typ " + this.holdTypes[0]);
      typeId = this.holdTypes[0];
    }

    let meshPath = "/models/Holds/Hold_" + typeId + "/Hold_" + typeId + ".glb";
    
    let rotation = { x: 0, y: 0, z: 0 };
    
    let hold = new Hold(typeId, meshPath, color, rotation);
    this.createdHolds.push(hold);
    
    return hold;
  }

  createRandomHold(color) {
    if (color === undefined) {
      color = "#ffffff";
    }

    let randomIndex = Math.floor(Math.random() * this.holdTypes.length);
    let randomType = this.holdTypes[randomIndex];
    
    return this.createHold(randomType, color);
  }

  getAvailableTypes() {
    let typesCopy = [];
    for (let i = 0; i < this.holdTypes.length; i++) {
      typesCopy.push(this.holdTypes[i]);
    }
    return typesCopy;
  }

  getCreatedHoldsCount() {
    return this.createdHolds.length;
  }

  getCreatedHolds() {
    return this.createdHolds;
  }
}

export default HoldFactory;