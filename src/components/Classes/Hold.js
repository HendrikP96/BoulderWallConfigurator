import * as THREE from "three";

/**
 * Hold - Visueller Griff auf einer Kletterwand.
 * Liegt immer auf einem BoltHole, kümmert sich nicht selbst um Positionierung.
 */
class Hold {

  constructor(typeId, meshPath, color, rotation) {
    this.typeId = typeId;
    this.meshPath = meshPath;
    this.color = color || "#ffffff";
    this.rotation = rotation || { x: 0, y: 0, z: 0 };
    this.mesh = null;
  }

  createMesh(holdFactory, position) {
    let prefab = holdFactory.getPrefab(this.typeId);

    if (prefab === null) {
      console.warn("Prefab für Hold-Typ " + this.typeId + " nicht geladen.");
      return null;
    }

    this.mesh = prefab;
    this.mesh.position.set(
      position.x,
      position.y,
      position.z + holdFactory.holdZOffset
    );
    this.mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
    this.mesh.scale.set(holdFactory.holdScale, holdFactory.holdScale, holdFactory.holdScale);

    let self = this;
    this.mesh.traverse(function(child) {
      if (child.isMesh) {
        // Original-Material klonen und Farbe als Tint anwenden
        let originalMaterial = child.material;
        let newMaterial = originalMaterial.clone();
        
        // Farbe mit Textur multiplizieren
        newMaterial.color.set(self.color);
        newMaterial.side = THREE.DoubleSide;
        
        child.material = newMaterial;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    return this.mesh;
  }

  getMesh() {
    return this.mesh;
  }

  disposeMesh() {
    if (this.mesh !== null) {
      this.mesh.traverse(function(child) {
        if (child.isMesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });
      this.mesh = null;
    }
  }

  getMeshPath() {
    return this.meshPath;
  }

  getColor() {
    return this.color;
  }

  getRotation() {
    return this.rotation;
  }

  getScale() {
    return this.scale;
  }

  getZOffset() {
    return this.zOffset;
  }

  getRenderConfig() {
    return {
      meshPath: this.meshPath,
      color: this.color,
      rotation: [this.rotation.x, this.rotation.y, this.rotation.z],
      scale: this.scale,
      zOffset: this.zOffset
    };
  }

  setColor(color) {
    this.color = color;
  }

  setRotation(rotation) {
    this.rotation = rotation;
  }
}

export default Hold;
