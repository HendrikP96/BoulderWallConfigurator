import WallTypeSelector from './WallTypeSelector'
import HoldTypeSelector from './HoldTypeSelector'
import RoutePanel from './RoutePanel'
import ColorPicker from './ColorPicker'
import './ConfiguratorPanel.css'

/**
 * ConfiguratorPanel
 * 
 * Hauptkomponente für das Konfigurator-UI.
 * Enthält Auswahl für Wand-Typen, Hold-Typen, Farben und Routen.
 */
function ConfiguratorPanel({
  interactionManager,
  onWallTypeChange,
  onHoldTypeChange,
  onColorChange,
  onCreateRoute,
  onSelectRoute,
  triggerUpdate
}) {
  const selectedHoldType = interactionManager?.getSelectedHoldType() || 1
  const selectedColor = interactionManager?.getSelectedColor() || '#FF6B6B'
  const activeRoute = interactionManager?.getActiveRoute()
  const routes = interactionManager?.getRouteManager()?.getRoutes() || []
  const wallTexture = interactionManager?.getWall()?.getTexture() || 'classic'

  return (
    <div className="configurator-panel">
      <h2 className="panel-title">Configurator</h2>

      {/* Wand-Typ Auswahl */}
      <section className="panel-section">
        <h3>Wand-Typ</h3>
        <WallTypeSelector
          selectedType={wallTexture}
          onSelect={onWallTypeChange}
        />
      </section>

      {/* Hold-Typ Auswahl */}
      <section className="panel-section">
        <h3>Hold-Typ</h3>
        <HoldTypeSelector
          selectedType={selectedHoldType}
          onSelect={onHoldTypeChange}
        />
      </section>

      {/* Farb-Auswahl */}
      <section className="panel-section">
        <h3>Farbe</h3>
        <ColorPicker
          selectedColor={selectedColor}
          onSelect={onColorChange}
        />
      </section>

      {/* Routen-Verwaltung */}
      <section className="panel-section">
        <h3>Routen</h3>
        <RoutePanel
          routes={routes}
          activeRoute={activeRoute}
          onCreateRoute={onCreateRoute}
          onSelectRoute={onSelectRoute}
          selectedColor={selectedColor}
        />
      </section>
    </div>
  )
}

export default ConfiguratorPanel
