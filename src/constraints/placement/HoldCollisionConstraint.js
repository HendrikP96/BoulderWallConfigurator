import { Constraint, ConstraintType } from '../Constraint.js';

/**
 * HoldCollisionConstraint (HARD)
 * 
 * Prüft ob ein neuer Hold physisch mit bestehenden Holds kollidieren würde.
 * Der Radius eines Holds hängt von seiner Scale ab.
 * 
 * Context: {
 *   targetPosition: { x, y, z },
 *   holdRadius: number,
 *   existingHolds: [{ position: { x, y, z }, radius: number }, ...]
 * }
 */
class HoldCollisionConstraint extends Constraint {

  constructor() {
    super("HoldCollision", ConstraintType.HARD);
  }

  validate(context) {
    let targetPosition = context.targetPosition;
    let holdRadius = context.holdRadius;
    let existingHolds = context.existingHolds;

    // Wenn keine Position oder keine existierenden Holds, ist alles OK
    if (targetPosition === null || targetPosition === undefined) {
      return { valid: true, message: "Keine Zielposition angegeben" };
    }

    if (existingHolds === null || existingHolds === undefined || existingHolds.length === 0) {
      return { valid: true, message: "Keine existierenden Holds" };
    }

    // Prüfe Kollision mit jedem existierenden Hold
    for (let i = 0; i < existingHolds.length; i++) {
      let existing = existingHolds[i];
      let distance = this.calculateDistance(targetPosition, existing.position);
      let minDistance = holdRadius + existing.radius;

      if (distance < minDistance) {
        let overlapCm = Math.round((minDistance - distance) * 100);
        return {
          valid: false,
          message: "Hold würde mit bestehendem Hold kollidieren (Überlappung: " + overlapCm + "cm)"
        };
      }
    }

    return { valid: true, message: "Keine Kollision" };
  }

  calculateDistance(pos1, pos2) {
    let dx = pos1.x - pos2.x;
    let dy = pos1.y - pos2.y;
    let dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }
}

export default HoldCollisionConstraint;
