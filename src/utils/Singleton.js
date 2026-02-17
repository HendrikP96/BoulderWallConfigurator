/**
 * Singleton - Basisklasse für das Singleton-Pattern.
 * 
 * Verwendung:
 * class MyManager extends Singleton {
 *   constructor() {
 *     super();
 *     if (this._isInitialized) return;
 *     this._isInitialized = true;
 *     // ... Initialisierung
 *   }
 * }
 * 
 * // Zugriff:
 * let manager = MyManager.getInstance();
 */

let instances = {};

class Singleton {

  constructor() {
    let className = this.constructor.name;
    
    // Wenn bereits eine Instanz existiert, diese zurückgeben
    if (instances[className] !== undefined) {
      return instances[className];
    }
    
    // Neue Instanz speichern
    instances[className] = this;
  }

  /**
   * Gibt die einzige Instanz der Klasse zurück.
   * Erstellt sie bei Bedarf.
   */
  static getInstance() {
    let className = this.name;
    
    if (instances[className] === undefined) {
      new this();
    }
    
    return instances[className];
  }

  /**
   * Nur für Tests: Setzt die Instanz zurück.
   */
  static resetInstance() {
    let className = this.name;
    delete instances[className];
  }
}

export default Singleton;
