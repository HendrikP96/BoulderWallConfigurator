/**
 * WallTypeSelector
 * 
 * Zeigt verfügbare Wand-Typen mit Vorschau-Bildern an.
 */

const WALL_TYPES = [
  {
    id: 'classic',
    name: 'Klassisch',
    preview: '/textures/Wall/Wall1_Color.png'
  },
  {
    id: 'plywood',
    name: 'Sperrholz',
    preview: '/textures/Wall/plywood_color.png'
  }
]

function WallTypeSelector({ selectedType, onSelect }) {
  return (
    <div className="wall-type-selector">
      {WALL_TYPES.map(type => (
        <button
          key={type.id}
          className={`wall-type-item ${selectedType === type.id ? 'selected' : ''}`}
          onClick={() => onSelect?.(type.id)}
          title={type.name}
        >
          <img
            src={type.preview}
            alt={type.name}
            className="wall-type-preview"
          />
          <span className="wall-type-name">{type.name}</span>
        </button>
      ))}
    </div>
  )
}

export default WallTypeSelector
