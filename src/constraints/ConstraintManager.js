import Singleton from '../utils/Singleton.js';
import EventBus from '../engine/EventBus.js';

/**
 * ConstraintManager - Verwaltet und validiert mehrere Constraints.
 * Unterscheidet zwischen Hard-Violations (blockierend) und Soft-Violations (Warnungen).
 * Singleton - es gibt nur eine zentrale Instanz.
 */
class ConstraintManager extends Singleton {

  constructor() {
    super();
    if (this._isInitialized) return;
    this._isInitialized = true;
    
    this.constraints = [];
    this.eventBus = EventBus.getInstance();
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

  /**
   * Validiert und sendet Ergebnisse an das UI via EventBus.
   * Für automatisches Feedback bei Aktionen.
   */
  validateAndNotify(context, source) {
    let results = this.validateAll(context);
    
    // Sende Hard-Violations (Fehler)
    if (results.hardViolations.length > 0) {
      this.eventBus.emit("constraint:violation", {
        type: "error",
        source: source || "unknown",
        violations: results.hardViolations
      });
    }
    
    // Sende Soft-Violations (Warnungen)
    if (results.softViolations.length > 0) {
      this.eventBus.emit("constraint:violation", {
        type: "warning",
        source: source || "unknown",
        violations: results.softViolations
      });
    }
    
    // Sende OK wenn alles passt
    if (results.isValid && results.softViolations.length === 0) {
      this.eventBus.emit("constraint:cleared", { source: source });
    }
    
    return results;
  }

  /**
   * Validiert Route-Constraints und benachrichtigt UI.
   */
  validateRoute(route) {
    let context = { route: route };
    return this.validateAndNotify(context, "route");
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
