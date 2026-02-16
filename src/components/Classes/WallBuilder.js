import Wall from './Wall.js';
import WallElement from './WallElement.js';
import ConstraintManager from './constraints/ConstraintManager.js';
import WallAngleConstraint from './constraints/WallAngleConstraint.js';

/**
 * WallBuilder - Baut Wände aus mehreren WallElements.
 * Prüft über Constraints welche Winkel für Überhänge erlaubt sind.
 */
class WallBuilder {

  constructor() {
    this.constraintManager = new ConstraintManager();
    this.constraintManager.addConstraint(new WallAngleConstraint());
  }

  createSimpleWall(width, height, depth) {
    if (depth === undefined) {
      depth = 0.15;
    }

    let wall = new Wall();
    let position = { x: 0, y: height / 2, z: 0 };
    let element = new WallElement(width, height, position);
    wall.addWallElement(element);
    
    return wall;
  }

  /**
   * Fügt einen Überhang zur Wand hinzu.
   * Prüft zuerst via Constraints ob der Winkel erlaubt ist.
   */
  addOverhang(wall, angle, width, height) {
    let context = { angle: angle };
    let result = this.constraintManager.validateAll(context);

    if (result.isValid === false) {
      let response = {
        success: false,
        violations: result.hardViolations,
        message: result.hardViolations[0].message
      };
      return response;
    }

    let wallElements = wall.getWallElements();
    let elementCount = wallElements.length;
    
    if (elementCount === 0) {
      let errorResponse = {
        success: false,
        message: "Keine bestehenden Wandelemente gefunden"
      };
      return errorResponse;
    }

    let lastElement = wallElements[elementCount - 1];

    let newPositionY = lastElement.getHeight() + height / 2;
    let newPosition = { x: 0, y: newPositionY, z: 0 };
    let newElement = new WallElement(width, height, newPosition);
    
    wall.addWallElement(newElement);

    let successResponse = {
      success: true,
      message: "Überhang mit " + angle + "° hinzugefügt"
    };
    return successResponse;
  }

  getAllowedAngles() {
    let constraints = this.constraintManager.getConstraints();
    let angleConstraint = null;
    
    for (let i = 0; i < constraints.length; i++) {
      if (constraints[i].getName() === "WallAngle") {
        angleConstraint = constraints[i];
        break;
      }
    }
    
    if (angleConstraint === null) {
      return [0];
    }
    
    return angleConstraint.getAllowedAngles();
  }

  getConstraintManager() {
    return this.constraintManager;
  }
}

export default WallBuilder;