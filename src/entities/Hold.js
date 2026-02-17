import * as THREE from "three";

class Hold {

  constructor(typeId, color, scale) {
    this.typeId = typeId;
    this.color = color || "#ffffff";
    this.scale = scale || 0.5;
    this.mesh = null;
  }

  createMesh(holdManager, position) {
    let prefab = holdManager.getPrefab(this.typeId);

    if (prefab === null) {
      return null;
    }

    this.mesh = prefab;
    this.mesh.position.set(position.x, position.y, position.z + holdManager.holdZOffset);
    this.mesh.scale.set(this.scale, this.scale, this.scale);

    let self = this;
    this.mesh.traverse(function(child) {
      if (child.isMesh) {
        let originalMaterial = child.material;
        let newMaterial = new THREE.MeshStandardMaterial({
          color: self.color,
          normalMap: originalMaterial.normalMap || null,
          side: THREE.DoubleSide
        });
        child.material = newMaterial;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

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

  // --- Getter / Setter ---

  getMesh() {
    return this.mesh;
  }

  getTypeId() {
    return this.typeId;
  }

  getColor() {
    return this.color;
  }

  setColor(color) {
    this.color = color;
  }

  getScale() {
    return this.scale;
  }

  setScale(scale) {
    this.scale = scale;
  }
}

export default Hold;
