import * as THREE from "three";
import SphereCollider from "../utils/SphereCollider.js";

/**
 * BoltHole - Bohrloch auf einer Kletterwand. 
 * Verwaltet einen optionalen Hold und hat einen Collider für Raycasts.
 */
class BoltHole {

  constructor(position) {
    this.position = position;
    this.hold = null;
    this.holeRadius = 0.004;    
    this.holeDepth = 0.005;
    this.hoverColor = "#4ECDC4";  
    this.holeColor = "#1a1a1a";
    this.isHovered = false;

    this.collider = new SphereCollider(this, 0.07);
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
      color: this.holeColor
    });

    let mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      this.position.x,
      this.position.y,
      this.position.z
    );

    let colliderPos = { x: 0, y: 0, z: 0 };
    let colliderMesh = this.collider.createMesh(colliderPos);
    if (colliderMesh !== null) {
      mesh.add(colliderMesh);
    }

    return mesh;
  }

  onClick() {
  }

  onHover() {
    this.setHovered(true);
  }

  onHoverExit() {
    this.setHovered(false);
  }

  setHovered(hovered) {
    this.isHovered = hovered;
    this.updateMeshColor();
  }

  updateMeshColor() {
    if (this.mesh === null) {
      return;
    }

    let color = this.isHovered ? this.hoverColor : this.holeColor;
    this.mesh.material.color.set(color);
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

  getMesh() {
    return this.mesh;
  }

  getCollider() {
    return this.collider;
  }

  getPosition() {
    return this.position;
  }

  getWorldPosition() {
    if (this.mesh === null) {
      return this.position;
    }
    let worldPos = new THREE.Vector3();
    this.mesh.getWorldPosition(worldPos);
    return { x: worldPos.x, y: worldPos.y, z: worldPos.z };
  }

  setPosition(position) {
    this.position = position;
  }

  getHold() {
    return this.hold;
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
}

export default BoltHole;
