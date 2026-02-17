import * as THREE from "three";
import Collider from "./Collider.js";

/**
 * SphereCollider - Kugelförmiger Collider für Raycasting.
 */
class SphereCollider extends Collider {

  constructor(owner, radius) {
    super(owner);
    this.radius = radius;
  }

  createMesh(position) {
    let geometry = new THREE.SphereGeometry(this.radius, 8, 8);
    let material = new THREE.MeshBasicMaterial({
      visible: false
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(position.x, position.y, position.z);
    this.mesh.userData.owner = this.owner;

    return this.mesh;
  }

  getRadius() {
    return this.radius;
  }

  setRadius(radius) {
    this.radius = radius;

    if (this.mesh !== null) {
      this.mesh.geometry.dispose();
      this.mesh.geometry = new THREE.SphereGeometry(this.radius, 8, 8);
    }
  }
}

export default SphereCollider;
