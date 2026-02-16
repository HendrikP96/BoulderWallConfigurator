/**
 * ColorPicker
 * 
 * Einfache Farbauswahl mit vordefinierten Route-Farben
 */

const ROUTE_COLORS = [
  { id: 'red', hex: '#FF6B6B', name: 'Rot' },
  { id: 'turquoise', hex: '#4ECDC4', name: 'Türkis' },
  { id: 'yellow', hex: '#FFE66D', name: 'Gelb' },
  { id: 'purple', hex: '#6C5CE7', name: 'Violett' },
  { id: 'green', hex: '#00B894', name: 'Grün' },
  { id: 'orange', hex: '#FF9F43', name: 'Orange' },
  { id: 'pink', hex: '#FD79A8', name: 'Pink' },
  { id: 'blue', hex: '#0984E3', name: 'Blau' },
]

function ColorPicker({ selectedColor, onSelect }) {
  return (
    <div className="color-picker">
      {ROUTE_COLORS.map(color => (
        <button
          key={color.id}
          className={`color-item ${selectedColor === color.hex ? 'selected' : ''}`}
          style={{ backgroundColor: color.hex }}
          onClick={() => onSelect?.(color.hex)}
          title={color.name}
        />
      ))}
    </div>
  )
}

export default ColorPicker
