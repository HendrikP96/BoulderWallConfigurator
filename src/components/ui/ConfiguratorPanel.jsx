import WallTypeSelector from './WallTypeSelector'
import HoldTypeSelector from './HoldTypeSelector'
import ColorPicker from './ColorPicker'
import './ConfiguratorPanel.css'

function ConfiguratorPanel({
  selectedHoldType,
  selectedColor,
  selectedScale,
  wallTexture,
  currentTool,
  onWallTypeChange,
  onHoldTypeChange,
  onColorChange,
  onScaleChange,
  onToolChange
}) {
  return (
    <div className="configurator-panel">
      <h2 className="panel-title">Konfigurator</h2>

      <section className="panel-section">
        <h3>Werkzeug</h3>
        <div className="tool-selector">
          <button
            className={`tool-btn ${currentTool === 'place' ? 'selected' : ''}`}
            onClick={function() { onToolChange && onToolChange('place'); }}
          >
            Platzieren
          </button>
          <button
            className={`tool-btn ${currentTool === 'delete' ? 'selected' : ''}`}
            onClick={function() { onToolChange && onToolChange('delete'); }}
          >
            Löschen
          </button>
        </div>
      </section>

      <section className="panel-section">
        <h3>Wand-Typ</h3>
        <WallTypeSelector
          selectedType={wallTexture}
          onSelect={onWallTypeChange}
        />
      </section>

      <section className="panel-section">
        <h3>Griff-Typ</h3>
        <HoldTypeSelector
          selectedType={selectedHoldType}
          onSelect={onHoldTypeChange}
        />
      </section>

      <section className="panel-section">
        <h3>Farbe</h3>
        <ColorPicker
          selectedColor={selectedColor}
          onSelect={onColorChange}
        />
      </section>

      <section className="panel-section">
        <h3>Größe</h3>
        <div className="scale-selector">
          <button
            className={`scale-btn ${selectedScale === 0.2 ? 'selected' : ''}`}
            onClick={function() { onScaleChange && onScaleChange(0.2); }}
          >
            S
          </button>
          <button
            className={`scale-btn ${selectedScale === 0.5 ? 'selected' : ''}`}
            onClick={function() { onScaleChange && onScaleChange(0.5); }}
          >
            M
          </button>
          <button
            className={`scale-btn ${selectedScale === 1 ? 'selected' : ''}`}
            onClick={function() { onScaleChange && onScaleChange(1); }}
          >
            L
          </button>
        </div>
      </section>
    </div>
  );
}

export default ConfiguratorPanel
