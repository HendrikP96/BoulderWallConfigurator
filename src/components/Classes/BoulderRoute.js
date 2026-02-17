let DifficultyLevel = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
  EXPERT: "expert"
};

/**
 * BoulderRoute - Kletterroute bestehend aus mehreren Holds.
 * Eine Route ist eindeutig einer Farbe zugeordnet (1:1 Mapping).
 */
class BoulderRoute {

  constructor(color, name) {
    this.id = Date.now();
    this.color = color;
    this.name = name || this.generateDefaultName(color);
    this.difficultyLevel = DifficultyLevel.MEDIUM;
    this.holds = [];
    this.startHold = null;
    this.topHold = null;
    this.visible = true;
  }

  generateDefaultName(color) {
    let colorNames = {
      "#FF6B6B": "Rot",
      "#FFE66D": "Gelb",
      "#0984E3": "Blau",
      "#FF9F43": "Orange",
      "#6C5CE7": "Violett",
      "#2ECC71": "Grün"
    };
    return colorNames[color] || "Route " + this.id;
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

  getConstraintStatus(minHolds, maxHolds) {
    minHolds = minHolds || 4;
    maxHolds = maxHolds || 20;

    let status = {
      hasStartHold: {
        fulfilled: this.startHold !== null,
        message: this.startHold !== null ? "Start-Griff gesetzt" : "Kein Start-Griff markiert"
      },
      hasTopHold: {
        fulfilled: this.topHold !== null,
        message: this.topHold !== null ? "Top-Griff gesetzt" : "Kein Top-Griff markiert"
      },
      holdCount: {
        fulfilled: this.holds.length >= minHolds && this.holds.length <= maxHolds,
        message: this.holds.length + " von " + minHolds + "-" + maxHolds + " Griffen"
      },
      isValid: false
    };

    status.isValid = status.hasStartHold.fulfilled && 
                     status.hasTopHold.fulfilled && 
                     status.holdCount.fulfilled;

    return status;
  }

  isComplete() {
    return this.startHold !== null && 
           this.topHold !== null && 
           this.holds.length >= 4;
  }

  // --- Getter / Setter ---

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

  getDifficultyLevel() {
    return this.difficultyLevel;
  }

  setDifficultyLevel(level) {
    this.difficultyLevel = level;
  }

  getHolds() {
    return this.holds;
  }

  getHoldCount() {
    return this.holds.length;
  }

  getStartHold() {
    return this.startHold;
  }

  setStartHold(boltHole) {
    this.startHold = boltHole;
  }

  getTopHold() {
    return this.topHold;
  }

  setTopHold(boltHole) {
    this.topHold = boltHole;
  }

  isVisible() {
    return this.visible;
  }

  setVisible(visible) {
    this.visible = visible;
  }
}

export { BoulderRoute, DifficultyLevel };
