import { useState } from 'react'
import './RoutePlannerPanel.css'

/**
 * RoutePlannerPanel
 * 
 * Separates Panel links für die Routen-Planung.
 * Zeigt alle Routen (Farbe = Route), Constraint-Status und ermöglicht Bearbeitung.
 */
function RoutePlannerPanel({ routes, selectedColor, onRouteNameChange, onSelectColor, onRouteClear, onRouteVisibilityToggle }) {
  let [editingId, setEditingId] = useState(null);
  let [editName, setEditName] = useState('');
  let [expandedRouteId, setExpandedRouteId] = useState(null);

  function startEdit(route, e) {
    e.stopPropagation();
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

  function toggleExpand(route) {
    if (expandedRouteId === route.getId()) {
      setExpandedRouteId(null);
    } else {
      setExpandedRouteId(route.getId());
    }
  }

  function handleRouteClick(route) {
    if (onSelectColor) {
      onSelectColor(route.getColor());
    }
  }

  function getDifficultyLabel(level) {
    let labels = {
      easy: "Leicht",
      medium: "Mittel",
      hard: "Schwer",
      expert: "Experte"
    };
    return labels[level] || level;
  }

  function renderConstraints(route) {
    let results = route.getValidationResults();
    
    // Keine Validierung vorhanden (z.B. bei weniger als 2 Holds)
    if (results === null) {
      return (
        <div className="constraint-item missing">
          <span className="constraint-icon">○</span>
          <span>Mindestens 2 Griffe für Analyse benötigt</span>
        </div>
      );
    }

    let items = [];

    // Passed constraints (fulfilled)
    for (let i = 0; i < results.passed.length; i++) {
      let item = results.passed[i];
      items.push(
        <div key={"pass-" + i} className="constraint-item fulfilled">
          <span className="constraint-icon">✓</span>
          <span>{item.message}</span>
        </div>
      );
    }

    // Soft violations (warnings)
    for (let i = 0; i < results.softViolations.length; i++) {
      let item = results.softViolations[i];
      items.push(
        <div key={"soft-" + i} className="constraint-item warning">
          <span className="constraint-icon">⚠</span>
          <span>{item.message}</span>
        </div>
      );
    }

    // Hard violations (errors)
    for (let i = 0; i < results.hardViolations.length; i++) {
      let item = results.hardViolations[i];
      items.push(
        <div key={"hard-" + i} className="constraint-item error">
          <span className="constraint-icon">⛔</span>
          <span>{item.message}</span>
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="constraint-item fulfilled">
          <span className="constraint-icon">✓</span>
          <span>Alle Anforderungen erfüllt</span>
        </div>
      );
    }

    return items;
  }

  return (
    <div className="route-planner-panel">
      <div className="route-planner-header">
        <h2>Routen-Planer</h2>
      </div>

      <div className="route-planner-list">
        {routes.length === 0 ? (
          <div className="route-planner-empty">
            <div className="empty-icon">🧗</div>
            <p>Noch keine Routen</p>
            <p className="empty-hint">Wähle eine Farbe und platziere Griffe auf der Wand</p>
          </div>
        ) : (
          routes.map(function(route) {
            let isSelected = route.getColor() === selectedColor;
            let isExpanded = expandedRouteId === route.getId();
            let isEditing = editingId === route.getId();
            let isComplete = route.isComplete();

            return (
              <div
                key={route.getId()}
                className={`route-planner-item ${isSelected ? 'selected' : ''} ${isComplete ? 'complete' : ''}`}
              >
                <div 
                  className="route-planner-item-header"
                  onClick={function() { handleRouteClick(route); }}
                >
                  <span
                    className="route-planner-color"
                    style={{ backgroundColor: route.getColor() }}
                  />
                  
                  {isEditing ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={function(e) { setEditName(e.target.value); }}
                      onKeyDown={function(e) { handleKeyPress(e, route); }}
                      onBlur={function() { saveEdit(route); }}
                      onClick={function(e) { e.stopPropagation(); }}
                      className="route-planner-name-input"
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="route-planner-name"
                      onClick={function(e) { startEdit(route, e); }}
                    >
                      {route.getName()}
                    </span>
                  )}

                  <span className="route-planner-hold-count">
                    {route.getHoldCount()} Griffe
                  </span>

                  <button
                    className="route-planner-visibility-btn"
                    onClick={function(e) { e.stopPropagation(); onRouteVisibilityToggle && onRouteVisibilityToggle(route.getId()); }}
                    title={route.isVisible() ? 'Route ausblenden' : 'Route einblenden'}
                  >
                    {route.isVisible() ? '◉' : '○'}
                  </button>

                  <button 
                    className="route-planner-expand-btn"
                    onClick={function(e) { e.stopPropagation(); toggleExpand(route); }}
                  >
                    {isExpanded ? '▲' : '▼'}
                  </button>
                </div>

                {isExpanded && (
                  <div className="route-planner-details">
                    <div className="route-detail-row">
                      <span className="detail-label">Schwierigkeit:</span>
                      <span className="detail-value">{getDifficultyLabel(route.getDifficultyLevel())}</span>
                    </div>

                    <div className="route-detail-section">
                      <span className="detail-section-title">Anforderungen:</span>
                      {renderConstraints(route)}
                    </div>

                    <button
                      className="route-clear-btn"
                      onClick={function(e) { e.stopPropagation(); onRouteClear && onRouteClear(route.getId()); }}
                    >
                      Route löschen
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {routes.length > 0 && (
        <div className="route-planner-summary">
          <span>{routes.length} Route{routes.length !== 1 ? 'n' : ''}</span>
          <span className="summary-divider">|</span>
          <span>{routes.filter(function(r) { return r.isComplete(); }).length} vollständig</span>
        </div>
      )}
    </div>
  );
}

export default RoutePlannerPanel
