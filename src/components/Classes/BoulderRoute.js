let DifficultyLevel = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
  EXPERT: "expert"
};

/**
 * BoulderRoute - Kletterroute bestehend aus mehreren Holds.
 * Enthält Metadaten wie Name, Farbe und Schwierigkeit.
 */
class BoulderRoute {

  constructor(name, color, difficultyLevel) {
    this.id = Date.now();
    this.name = name;
    this.color = color;
    this.difficultyLevel = difficultyLevel || DifficultyLevel.MEDIUM;
    this.holds = [];
  }

  getId() {
    return this.id;
  }

  getName() {
    return this.name;
  }

  getColor() {
    return this.color;
  }

  getDifficultyLevel() {
    return this.difficultyLevel;
  }

  getHolds() {
    return this.holds;
  }

  getHoldCount() {
    return this.holds.length;
  }

  setName(name) {
    this.name = name;
  }

  setColor(color) {
    this.color = color;
  }

  setDifficultyLevel(level) {
    this.difficultyLevel = level;
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
}

export { BoulderRoute, DifficultyLevel };
