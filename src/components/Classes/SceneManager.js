/**
 * SceneManager - Verwaltet alle Daten und Logik der 3D-Szene.
 * Arbeitet wie ein Unity-Scene-Manager - hält Objekte und deren Zustände.
 * ReactRenderer liest nur aus dieser Klasse und rendert.
 */
class SceneManager {

  constructor() {
    this.wall = null;
    this.interactionManager = null;
    this.hoveredBoltHole = null;
    
    this.camera = {
      position: { x: 0, y: 2, z: 5 },
      fov: 50,
      near: 0.1,
      far: 1000
    };
    
    this.lights = [];
    
    let ambientLight = {
      type: "ambient",
      intensity: 0.4,
      color: "#ffffff"
    };
    this.lights.push(ambientLight);
    
    let directionalLight = {
      type: "directional",
      position: { x: 10, y: 10, z: 5 },
      intensity: 1,
      color: "#ffffff",
      castShadow: true,
      shadowMapSize: 2048
    };
    this.lights.push(directionalLight);
    
    this.environment = {
      preset: "warehouse",
      showGrid: true,
      gridConfig: {
        cellSize: 0.5,
        cellThickness: 0.5,
        sectionSize: 2,
        sectionThickness: 1,
        fadeDistance: 30,
        fadeStrength: 1
      }
    };
    
    this.orbitControls = {
      enablePan: true,
      enableZoom: true,
      enableRotate: true,
      minDistance: 1,
      maxDistance: 20,
      target: { x: 0, y: 1.5, z: 0 }
    };
    
    this.renderConfig = {
      shadows: true,
      toneMapping: "ACESFilmic"
    };
    
    this.updateCallbacks = [];
  }

  setWall(wall) {
    this.wall = wall;
    this.notifyUpdate();
  }

  setInteractionManager(manager) {
    this.interactionManager = manager;
  }

  setHoveredBoltHole(boltHole) {
    if (this.hoveredBoltHole !== boltHole) {
      this.hoveredBoltHole = boltHole;
      this.notifyUpdate();
    }
  }

  setCameraPosition(position) {
    this.camera.position = position;
    this.notifyUpdate();
  }

  setCameraFov(fov) {
    this.camera.fov = fov;
    this.notifyUpdate();
  }

  addLight(light) {
    this.lights.push(light);
    this.notifyUpdate();
  }

  removeLight(index) {
    if (index >= 0 && index < this.lights.length) {
      this.lights.splice(index, 1);
      this.notifyUpdate();
    }
  }

  setEnvironmentPreset(preset) {
    this.environment.preset = preset;
    this.notifyUpdate();
  }

  setShowGrid(show) {
    this.environment.showGrid = show;
    this.notifyUpdate();
  }

  getWall() {
    return this.wall;
  }

  getInteractionManager() {
    return this.interactionManager;
  }

  getHoveredBoltHole() {
    return this.hoveredBoltHole;
  }

  getCamera() {
    return this.camera;
  }

  getLights() {
    return this.lights;
  }

  getEnvironment() {
    return this.environment;
  }

  getOrbitControls() {
    return this.orbitControls;
  }

  getRenderConfig() {
    return this.renderConfig;
  }

  getWallElements() {
    if (this.wall === null) {
      return [];
    }
    return this.wall.getWallElements();
  }

  getWallTexture() {
    if (this.wall === null) {
      return "classic";
    }
    return this.wall.getTexture();
  }

  getAllBoltHoles() {
    if (this.wall === null) {
      return [];
    }
    return this.wall.getAllBoltHoles();
  }

  getSelectedHoldType() {
    if (this.interactionManager === null) {
      return 1;
    }
    return this.interactionManager.getSelectedHoldType();
  }

  getSelectedColor() {
    if (this.interactionManager === null) {
      return "#FF6B35";
    }
    return this.interactionManager.getSelectedColor();
  }

  onBoltHoleClick(boltHole) {
    if (this.interactionManager === null) {
      let errorResult = {
        success: false,
        message: "No InteractionManager"
      };
      return errorResult;
    }
    
    let result = this.interactionManager.onBoltHoleClick(boltHole);
    this.notifyUpdate();
    return result;
  }

  /**
   * Registriert einen Callback für Updates.
   * Gibt eine Unsubscribe-Funktion zurück.
   */
  onUpdate(callback) {
    this.updateCallbacks.push(callback);
    
    let self = this;
    let unsubscribe = function() {
      let index = -1;
      for (let i = 0; i < self.updateCallbacks.length; i++) {
        if (self.updateCallbacks[i] === callback) {
          index = i;
          break;
        }
      }
      if (index > -1) {
        self.updateCallbacks.splice(index, 1);
      }
    };
    return unsubscribe;
  }

  notifyUpdate() {
    for (let i = 0; i < this.updateCallbacks.length; i++) {
      this.updateCallbacks[i]();
    }
  }

  forceUpdate() {
    this.notifyUpdate();
  }
}

export default SceneManager;
