/**
 * Zentrale Farbdefinitionen für Boulder-Routen
 * Wird von ColorPicker und BoulderRoute verwendet
 */

let ROUTE_COLORS = [
  { id: 'red', hex: '#FF6B6B', name: 'Rot' },
  { id: 'yellow', hex: '#FFE66D', name: 'Gelb' },
  { id: 'blue', hex: '#0984E3', name: 'Blau' },
  { id: 'orange', hex: '#FF9F43', name: 'Orange' },
  { id: 'purple', hex: '#6C5CE7', name: 'Violett' },
  { id: 'green', hex: '#2ECC71', name: 'Grün' }
];

/**
 * Gibt den deutschen Farbnamen für einen Hex-Wert zurück
 */
function getColorName(hex) {
  for (let i = 0; i < ROUTE_COLORS.length; i++) {
    if (ROUTE_COLORS[i].hex === hex) {
      return ROUTE_COLORS[i].name;
    }
  }
  return null;
}

/**
 * Gibt die Farb-ID für einen Hex-Wert zurück
 */
function getColorId(hex) {
  for (let i = 0; i < ROUTE_COLORS.length; i++) {
    if (ROUTE_COLORS[i].hex === hex) {
      return ROUTE_COLORS[i].id;
    }
  }
  return null;
}

export { ROUTE_COLORS, getColorName, getColorId };
