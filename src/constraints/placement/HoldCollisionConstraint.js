import * as THREE from 'three';
import { MeshBVH } from 'three-mesh-bvh';
import { Constraint, ConstraintType } from '../Constraint.js';

/**
 * HoldCollisionConstraint (HARD)
 * 
 * Prüft ob ein neuer Hold physisch mit bestehenden Holds kollidieren würde.
 * Nutzt MeshBVH für präzise Mesh-zu-Mesh Intersection.
 * 
 * Context: {
 *   newHold: Hold,
 *   existingHolds: Hold[]
 * }
 */
class HoldCollisionConstraint extends Constraint {

  constructor() {
    super("HoldCollision", ConstraintType.HARD);
  }

  validate(context) {
    let newHold = context.newHold;
    let existingHolds = context.existingHolds;

    if (existingHolds.length === 0) {
      return { valid: true, message: "Keine existierenden Holds" };
    }

    for (let i = 0; i < existingHolds.length; i++) {
      let intersects = this.meshesIntersect(newHold, existingHolds[i]);
      if (intersects) {
        return {
          valid: false,
          message: "Hold kollidiert mit bestehendem Griff",
          collidingHold: existingHolds[i]
        };
      }
    }

    return { valid: true, message: "Keine Kollision" };
  }

  meshesIntersect(holdA, holdB) {
    holdA.getMesh().updateMatrixWorld(true);
    holdB.getMesh().updateMatrixWorld(true);

    let meshesA = this.collectMeshes(holdA.getMesh());
    let meshesB = this.collectMeshes(holdB.getMesh());

    for (let a = 0; a < meshesA.length; a++) {
      let meshA = meshesA[a];
      this.ensureBVH(meshA);

      for (let b = 0; b < meshesB.length; b++) {
        let meshB = meshesB[b];
        this.ensureBVH(meshB);

        let matrixBtoA = new THREE.Matrix4()
          .copy(meshA.matrixWorld)
          .invert()
          .multiply(meshB.matrixWorld);

        if (meshA.geometry.boundsTree.intersectsGeometry(meshB.geometry, matrixBtoA)) {
          return true;
        }
      }
    }

    return false;
  }

  collectMeshes(object) {
    let meshes = [];
    object.traverse(function(child) {
      if (child.isMesh) {
        meshes.push(child);
      }
    });
    return meshes;
  }

  ensureBVH(mesh) {
    if (!mesh.geometry.boundsTree) {
      mesh.geometry.boundsTree = new MeshBVH(mesh.geometry);
    }
  }
}

export default HoldCollisionConstraint;
