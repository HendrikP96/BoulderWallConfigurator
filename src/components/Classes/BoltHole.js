import * as THREE from "three";
import SphereCollider from "./SphereCollider.js";
import HoldFactory from "./HoldFactory.js";

/**
 * BoltHole - Bohrloch auf einer Kletterwand. 
 * Verwaltet einen optionalen Hold und hat einen Collider für Raycasts.
 */
class BoltHole {

  constructor(position, hold) {
    this.position = position;
    this.hold = hold || null;
    this.holeRadius = 0.004;    
    this.holeDepth = 0.01;
    this.hoverColor = "#4ECDC4";  
    this.HoleColor = "#1a1a1a";
    this.isHovered = false;

    // Collider für Raycasting
    this.collider = new SphereCollider(this, 0.07);

    // Mesh direkt erstellen
    this.mesh = this.createMesh();
  }

  createMesh() {
    let geometry = new THREE.CylinderGeometry(
      this.holeRadius,
      this.holeRadius,
      this.holeDepth,
      6
    );
    geometry.rotateX(-Math.PI / 2);

    let material = new THREE.MeshStandardMaterial({
      color: this.HoleColor
    });

    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      this.position.x,
      this.position.y,
      this.position.z
    );

    // Collider als Child
    let colliderPos = { x: 0, y: 0, z: 0 };
    let colliderMesh = this.collider.createMesh(colliderPos);
    if (colliderMesh !== null) {
      mesh.add(colliderMesh);
    }

    return mesh;
  }

  getMesh() {
    return this.mesh;
  }

  getCollider() {
    return this.collider;
  }

  onClick() {
    if (this.isEmpty() === false) {
      return;
    }

    let holdFactory = HoldFactory.getInstance();
    if (holdFactory !== null) {
      holdFactory.placeHoldAt(this);
    }
  }

  onHover() {
    this.setHovered(true);

    if (this.isEmpty() === false) {
      return;
    }

    let holdFactory = HoldFactory.getInstance();
    if (holdFactory !== null) {
      holdFactory.showPreviewAt(this);
    }
  }

  onHoverExit() {
    this.setHovered(false);

    let holdFactory = HoldFactory.getInstance();
    if (holdFactory !== null) {
      holdFactory.hidePreview();
    }
  }

  setHovered(hovered) {
    this.isHovered = hovered;
    this.updateMeshColor();
  }

  updateMeshColor() {
    if (this.mesh === null) {
      return;
    }

    let color = this.isHovered ? this.hoverColor : this.HoleColor;
    this.mesh.material.color.set(color);
  }

  disposeMesh() {
    if (this.mesh !== null) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.mesh = null;
    }

    if (this.collider !== null) {
      this.collider.dispose();
    }
  }

  getPosition() {
    return this.position;
  }

  getHold() {
    return this.hold;
  }

  setPosition(position) {
    this.position = position;
  }

  setHold(hold) {
    this.hold = hold;
  }

  isEmpty() {
    if (this.hold === null) {
      return true;
    }
    return false;
  }

  snapHold(hold) {
    if (this.isEmpty() === false) {
      return false;
    }
    
    this.hold = hold;
    return true;
  }

  removeHold() {
    let removedHold = this.hold;
    this.hold = null;
    return removedHold;
  }
}

export default BoltHole;
