let ConstraintType = {
  HARD: "hard",
  SOFT: "soft"
};

/**
 * Basisklasse für Constraints.
 * Unterklassen müssen validate() implementieren.
 */
class Constraint {

  constructor(name, type) {
    this.name = name;
    if (type === undefined) {
      this.type = ConstraintType.SOFT;
    } else {
      this.type = type;
    }
  }

  getName() {
    return this.name;
  }

  getType() {
    return this.type;
  }

  isHard() {
    return this.type === ConstraintType.HARD;
  }

  isSoft() {
    return this.type === ConstraintType.SOFT;
  }

  validate(context) {
    throw new Error("validate() muss von Unterklasse implementiert werden");
  }
}

export { Constraint, ConstraintType };
