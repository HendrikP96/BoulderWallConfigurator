import * as THREE from "three";

/**
 * Collider - Basisklasse für alle Collider-Typen.
 * Unsichtbares Mesh für Raycasting. Owner muss onClick/onHover/onHoverExit implementieren.
 */
class Collider {

  constructor(owner) {
    this.owner = owner;
    this.mesh = null;
    this.isEnabled = true;
  }

  /**
   * Erstellt das Collider-Mesh. Muss von Unterklassen überschrieben werden.
   */
  createMesh(position) {
    throw new Error("createMesh muss von Unterklasse implementiert werden");
  }

  getMesh() {
    return this.mesh;
  }

  getOwner() {
    return this.owner;
  }

  setPosition(position) {
    if (this.mesh !== null) {
      this.mesh.position.set(position.x, position.y, position.z);
    }
  }

  enable() {
    this.isEnabled = true;
    if (this.mesh !== null) {
      this.mesh.userData.owner = this.owner;
    }
  }

  disable() {
    this.isEnabled = false;
    if (this.mesh !== null) {
      this.mesh.userData.owner = null;
    }
  }

  isActive() {
    return this.isEnabled;
  }

  dispose() {
    if (this.mesh !== null) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.mesh = null;
    }
  }
}

export default Collider;
