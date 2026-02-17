// Export aller Constraint-Klassen für einfachen Import
export { Constraint, ConstraintType } from './Constraint.js';
export { default as ConstraintManager } from './ConstraintManager.js';

// Placement Constraints (HARD) - verhindern ungültige Platzierungen
export { default as HoldCollisionConstraint } from './placement/HoldCollisionConstraint.js';

// Route Constraints (SOFT) - warnen bei suboptimalen Routen
export { default as ReachabilityConstraint } from './route/ReachabilityConstraint.js';
export { default as StartPositionConstraint } from './route/StartPositionConstraint.js';
