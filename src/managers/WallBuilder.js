import Wall from '../entities/Wall.js';
import WallElement from '../entities/WallElement.js';
import ConstraintManager from '../constraints/ConstraintManager.js';

/**
 * WallBuilder - Klasse zum Erstellen von Wänden und Hinzufügen von Überhängen (zukünftig).
 */
class WallBuilder {

  constructor() {
    this.constraintManager = ConstraintManager.getInstance();
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
    // Default angles - kann durch Constraint-System erweitert werden
    return [0, 15, 30, 45];
  }

  getConstraintManager() {
    return this.constraintManager;
  }
}

export default WallBuilder;
