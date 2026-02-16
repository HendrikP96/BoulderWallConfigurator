import { useState } from 'react'

/**
 * RoutePanel
 * 
 * Verwaltung der Kletterrouten: Erstellen und Auswählen
 */
function RoutePanel({ routes, activeRoute, onCreateRoute, onSelectRoute, selectedColor }) {
  const [newRouteName, setNewRouteName] = useState('')

  const handleCreateRoute = () => {
    if (newRouteName.trim()) {
      onCreateRoute?.(newRouteName.trim(), selectedColor)
      setNewRouteName('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCreateRoute()
    }
  }

  return (
    <div className="route-panel">
      {/* Neue Route erstellen */}
      <div className="route-create">
        <input
          type="text"
          placeholder="Route Name..."
          value={newRouteName}
          onChange={(e) => setNewRouteName(e.target.value)}
          onKeyPress={handleKeyPress}
          className="route-input"
        />
        <button
          onClick={handleCreateRoute}
          className="route-create-btn"
          disabled={!newRouteName.trim()}
        >
          +
        </button>
      </div>

      {/* Route-Liste */}
      <div className="route-list">
        {routes.length === 0 ? (
          <p className="route-empty">Keine Routen vorhanden</p>
        ) : (
          routes.map(route => (
            <button
              key={route.getId()}
              className={`route-item ${activeRoute?.getId() === route.getId() ? 'active' : ''}`}
              onClick={() => onSelectRoute?.(route.getId())}
            >
              <span
                className="route-color-dot"
                style={{ backgroundColor: route.getColor() }}
              />
              <span className="route-name">{route.getName()}</span>
              <span className="route-hold-count">{route.getHoldCount()} Holds</span>
            </button>
          ))
        )}
      </div>

      {/* Aktive Route deselektieren */}
      {activeRoute && (
        <button
          className="route-deselect-btn"
          onClick={() => onSelectRoute?.(null)}
        >
          Route deselektieren
        </button>
      )}
    </div>
  )
}

export default RoutePanel
