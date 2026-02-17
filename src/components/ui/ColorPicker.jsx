/**
 * ColorPicker
 * 
 * Einfache Farbauswahl mit vordefinierten Route-Farben
 */

const ROUTE_COLORS = [
  { id: 'red', hex: '#FF6B6B', name: 'Rot' },
  { id: 'yellow', hex: '#FFE66D', name: 'Gelb' },
  { id: 'blue', hex: '#0984E3', name: 'Blau' },
  { id: 'orange', hex: '#FF9F43', name: 'Orange' },
  { id: 'purple', hex: '#6C5CE7', name: 'Violett' },
  { id: 'green', hex: '#2ECC71', name: 'Grün' },
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
