import { useState } from 'react'

/**
 * RoutePanel
 * 
 * Zeigt alle Routen an (Farbe = Route). Routen werden automatisch erstellt
 * beim ersten Hold einer Farbe. Editierbarer Name und Constraint-Status.
 */
function RoutePanel({ routes, selectedColor, onRouteNameChange }) {
  let [editingId, setEditingId] = useState(null);
  let [editName, setEditName] = useState('');

  function startEdit(route) {
    setEditingId(route.getId());
    setEditName(route.getName());
  }

  function saveEdit(route) {
    if (editName.trim() && onRouteNameChange) {
      onRouteNameChange(route.getId(), editName.trim());
    }
    setEditingId(null);
  }

  function handleKeyPress(e, route) {
    if (e.key === 'Enter') {
      saveEdit(route);
    }
    if (e.key === 'Escape') {
      setEditingId(null);
    }
  }

  function getConstraintStatus(route) {
    let status = route.getConstraintStatus(4, 20);
    let hints = [];

    if (!status.hasStartHold.fulfilled) {
      hints.push("⚠ Kein Start");
    }
    if (!status.hasTopHold.fulfilled) {
      hints.push("⚠ Kein Top");
    }
    if (!status.holdCount.fulfilled) {
      hints.push(status.holdCount.message);
    }

    return hints;
  }

  return (
    <div className="route-panel">
      <div className="route-panel-header">
        <h3>Routen</h3>
        <p className="route-info-text">Farbe = Route. Automatisch erstellt beim ersten Hold.</p>
      </div>

      {/* Route-Liste */}
      <div className="route-list">
        {routes.length === 0 ? (
          <p className="route-empty">Noch keine Routen. Platziere einen Hold!</p>
        ) : (
          routes.map(function(route) {
            let isSelected = route.getColor() === selectedColor;
            let isEditing = editingId === route.getId();
            let hints = getConstraintStatus(route);
            let isComplete = route.isComplete();

            return (
              <div
                key={route.getId()}
                className={`route-item ${isSelected ? 'selected' : ''} ${isComplete ? 'complete' : ''}`}
              >
                <span
                  className="route-color-dot"
                  style={{ backgroundColor: route.getColor() }}
                />
                
                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={function(e) { setEditName(e.target.value); }}
                    onKeyDown={function(e) { handleKeyPress(e, route); }}
                    onBlur={function() { saveEdit(route); }}
                    className="route-name-input"
                    autoFocus
                  />
                ) : (
                  <span
                    className="route-name"
                    onDoubleClick={function() { startEdit(route); }}
                    title="Doppelklick zum Umbenennen"
                  >
                    {route.getName()}
                  </span>
                )}

                <span className="route-hold-count">{route.getHoldCount()} Holds</span>

                {isComplete ? (
                  <span className="route-status complete">✓</span>
                ) : hints.length > 0 ? (
                  <span className="route-hints" title={hints.join(', ')}>
                    {hints.length} Hinweis{hints.length > 1 ? 'e' : ''}
                  </span>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default RoutePanel

