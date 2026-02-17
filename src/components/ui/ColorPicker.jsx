/**
 * ColorPicker
 * 
 * Einfache Farbauswahl mit vordefinierten Route-Farben
 */

import { ROUTE_COLORS } from '../../constants/colors.js'

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
