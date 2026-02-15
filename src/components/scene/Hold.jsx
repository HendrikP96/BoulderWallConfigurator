import { useGLTF, Clone } from '@react-three/drei'

/**
 * Hold Komponente - Lädt und rendert einen einzelnen Klettergriff
 * @param {string} holdId - ID des Holds (1-7)
 * @param {Array} position - [x, y, z] Position
 * @param {Array} rotation - [x, y, z] Rotation in Radians
 * @param {number} scale - Skalierungsfaktor
 * @param {string} color - Farbe des Holds (optional) - TODO: implementieren
 */
export default function Hold({ 
  holdId = 1, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  scale = 1,
  color = '#ffffff'
}) {
  const modelPath = `/models/Holds/Hold_${holdId}/Hold_${holdId}.glb`
  const { scene } = useGLTF(modelPath)

  return (
    <Clone 
      object={scene}
      position={position} 
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
    />
  )
}

// Preload für bessere Performance
for (let i = 1; i <= 7; i++) {
  useGLTF.preload(`/models/Holds/Hold_${i}/Hold_${i}.glb`)
}
