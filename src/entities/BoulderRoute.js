import { getColorName } from '../constants/colors.js';

/**
 * BoulderRoute - Kletterroute bestehend aus mehreren Holds.
 * Eine Route ist eindeutig einer Farbe zugeordnet (1:1 Mapping).
 */
class BoulderRoute {

  constructor(color, name) {
    this.id = Date.now();
    this.color = color;
    this.name = name || this.generateDefaultName(color);
    this.holds = [];
    this.visible = true;
    this.validationResults = null;
  }

  generateDefaultName(color) {
    let name = getColorName(color);
    return name || "Route " + this.id;
  }

  addHold(boltHole) {
    this.holds.push(boltHole);
  }

  removeHold(boltHole) {
    let index = -1;
    
    for (let i = 0; i < this.holds.length; i++) {
      if (this.holds[i] === boltHole) {
        index = i;
        break;
      }
    }
    
    if (index === -1) {
      return false;
    }
    
    this.holds.splice(index, 1);
    return true;
  }

  containsHold(boltHole) {
    for (let i = 0; i < this.holds.length; i++) {
      if (this.holds[i] === boltHole) {
        return true;
      }
    }
    return false;
  }

  isComplete() {
    let results = this.validationResults;
    if (results === null) {
      return false;
    }
    return results.isValid && results.softViolations.length === 0;
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  setName(name) {
    this.name = name;
  }

  getColor() {
    return this.color;
  }

  setColor(color) {
    this.color = color;
  }

  getHolds() {
    return this.holds;
  }

  getHoldCount() {
    return this.holds.length;
  }

  isVisible() {
    return this.visible;
  }

  setVisible(visible) {
    this.visible = visible;
  }

  getValidationResults() {
    return this.validationResults;
  }

  setValidationResults(results) {
    this.validationResults = results;
  }
}

export { BoulderRoute };
