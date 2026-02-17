import * as THREE from "three";
import EventBus from '../engine/EventBus.js';

let WALL_TEXTURES = {
  classic: {
    color: "/textures/Wall/Wall1_Color.png",
    normal: "/textures/Wall/Wall1_Normal.png"
  },
  plywood: {
    color: "/textures/Wall/plywood_color.png",
    normal: "/textures/Wall/Wall1_Normal.png"
  }
};

class Wall {

  constructor(position, rotation) {
    this.position = position || { x: 0, y: 0, z: 0 };
    this.rotation = rotation || { x: 0, y: 0, z: 0 };
    this.wallElements = [];
    this.texture = "classic";
    this.depth = 0.15;
    this.group = null;
    this.textureLoader = null;

    this.eventBus = EventBus.getInstance();
    this.subscribeToEvents();
  }

  subscribeToEvents() {
    let self = this;

    this.eventBus.on("ui:wallTextureChanged", function(data) {
      if (self.textureLoader === null) {
        return;
      }
      self.setTexture(data.texture, self.textureLoader);
      self.eventBus.emit("settings:updated", { wallTexture: self.texture });
    });
  }

  createAllMeshes(textureLoader) {
    this.group = new THREE.Group();
    this.group.position.set(this.position.x, this.position.y, this.position.z);

    let texturePaths = this.getTexturePaths();

    for (let i = 0; i < this.wallElements.length; i++) {
      let element = this.wallElements[i];
      element.createMesh(textureLoader, texturePaths);
      this.group.add(element.getGroup());
    }

    return this.group;
  }

  disposeAllMeshes() {
    for (let i = 0; i < this.wallElements.length; i++) {
      let element = this.wallElements[i];
      element.disposeMesh();

      let boltHoles = element.getAllBoltHoles();
      for (let j = 0; j < boltHoles.length; j++) {
        boltHoles[j].disposeMesh();
      }
    }
  }

  updateTextures(textureLoader) {
    let texturePaths = this.getTexturePaths();
    let self = this;
    let loadedCount = 0;
    let colorTexture = null;
    let normalTexture = null;
    
    function applyTextures() {
      colorTexture.wrapS = colorTexture.wrapT = THREE.RepeatWrapping;
      normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;
      
      for (let i = 0; i < self.wallElements.length; i++) {
        let element = self.wallElements[i];
        let mesh = element.getMesh();
        
        if (mesh !== null && mesh.material !== null) {
          colorTexture.repeat.set(element.getWidth(), element.getHeight());
          normalTexture.repeat.set(element.getWidth(), element.getHeight());
          
          mesh.material.map = colorTexture;
          mesh.material.normalMap = normalTexture;
          mesh.material.needsUpdate = true;
        }
      }
    }
    
    function onTextureLoaded() {
      loadedCount = loadedCount + 1;
      if (loadedCount === 2) {
        applyTextures();
      }
    }
    
    colorTexture = textureLoader.load(texturePaths.color, onTextureLoaded);
    normalTexture = textureLoader.load(texturePaths.normal, onTextureLoaded);
  }

  addWallElement(wallElement) {
    this.wallElements.push(wallElement);
  }

  removeWallElement(index) {
    if (index < 0 || index >= this.wallElements.length) {
      return undefined;
    }
    
    let removedElement = this.wallElements[index];
    this.wallElements.splice(index, 1);
    return removedElement;
  }

  // --- Getter / Setter ---

  getGroup() {
    return this.group;
  }

  getPosition() {
    return this.position;
  }

  setPosition(position) {
    this.position = position;
  }

  getRotation() {
    return this.rotation;
  }

  setRotation(rotation) {
    this.rotation = rotation;
  }

  getTexture() {
    return this.texture;
  }

  setTexture(texture, textureLoader) {
    this.texture = texture;
    if (textureLoader !== undefined) {
      this.updateTextures(textureLoader);
    }
  }

  setTextureLoader(loader) {
    this.textureLoader = loader;
  }

  getTexturePaths() {
    return WALL_TEXTURES[this.texture] || WALL_TEXTURES.classic;
  }

  getDepth() {
    return this.depth;
  }

  getWallElements() {
    return this.wallElements;
  }

  getWallElementCount() {
    return this.wallElements.length;
  }

  getAllBoltHoles() {
    let allBoltHoles = [];
    
    for (let i = 0; i < this.wallElements.length; i++) {
      let element = this.wallElements[i];
      let elementHoles = element.getAllBoltHoles();
      
      for (let j = 0; j < elementHoles.length; j++) {
        allBoltHoles.push(elementHoles[j]);
      }
    }
    
    return allBoltHoles;
  }
}

export default Wall;
