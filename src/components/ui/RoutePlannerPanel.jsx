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

  function getConstraintStatus(route) {
    let status = route.getConstraintStatus(4, 20);
    return status;
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
            let status = getConstraintStatus(route);
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
                      
                      <div className={`constraint-item ${status.hasStartHold.fulfilled ? 'fulfilled' : 'missing'}`}>
                        <span className="constraint-icon">{status.hasStartHold.fulfilled ? '✓' : '○'}</span>
                        <span>{status.hasStartHold.message}</span>
                      </div>

                      <div className={`constraint-item ${status.hasTopHold.fulfilled ? 'fulfilled' : 'missing'}`}>
                        <span className="constraint-icon">{status.hasTopHold.fulfilled ? '✓' : '○'}</span>
                        <span>{status.hasTopHold.message}</span>
                      </div>

                      <div className={`constraint-item ${status.holdCount.fulfilled ? 'fulfilled' : 'missing'}`}>
                        <span className="constraint-icon">{status.holdCount.fulfilled ? '✓' : '○'}</span>
                        <span>{status.holdCount.message}</span>
                      </div>
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
