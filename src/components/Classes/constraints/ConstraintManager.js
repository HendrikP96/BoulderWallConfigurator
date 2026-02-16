/**
 * ConstraintManager - Verwaltet und validiert mehrere Constraints.
 * Unterscheidet zwischen Hard-Violations (blockierend) und Soft-Violations (Warnungen).
 */
class ConstraintManager {

  constructor() {
    this.constraints = [];
  }

  addConstraint(constraint) {
    this.constraints.push(constraint);
  }

  removeConstraint(name) {
    let index = -1;
    for (let i = 0; i < this.constraints.length; i++) {
      if (this.constraints[i].getName() === name) {
        index = i;
        break;
      }
    }
    
    if (index !== -1) {
      this.constraints.splice(index, 1);
      return true;
    }
    return false;
  }

  getConstraints() {
    return this.constraints;
  }

  /**
   * Validiert alle Constraints gegen einen Kontext.
   * Gibt isValid=false zurück wenn ein Hard-Constraint verletzt wird.
   */
  validateAll(context) {
    let results = {
      isValid: true,
      hardViolations: [],
      softViolations: [],
      passed: []
    };

    for (let i = 0; i < this.constraints.length; i++) {
      let constraint = this.constraints[i];
      let result = constraint.validate(context);

      if (result.valid) {
        let passedEntry = {
          name: constraint.getName(),
          message: result.message
        };
        results.passed.push(passedEntry);
      } else if (constraint.isHard()) {
        let hardViolation = {
          name: constraint.getName(),
          message: result.message
        };
        results.hardViolations.push(hardViolation);
        results.isValid = false;
      } else {
        let softViolation = {
          name: constraint.getName(),
          message: result.message
        };
        results.softViolations.push(softViolation);
      }
    }

    return results;
  }

  canProceed(context) {
    let results = this.validateAll(context);
    return results.isValid;
  }

  getConstraintsByType(type) {
    let filteredConstraints = [];
    for (let i = 0; i < this.constraints.length; i++) {
      if (this.constraints[i].getType() === type) {
        filteredConstraints.push(this.constraints[i]);
      }
    }
    return filteredConstraints;
  }
}

export default ConstraintManager;
