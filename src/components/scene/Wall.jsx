import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

// Verfügbare Wand-Texturen
const WALL_TEXTURES = {
  classic: {
    color: '/textures/Wall/Wall1_Color.png',
    normal: '/textures/Wall/Wall1_Normal.png',
  },
  plywood: {
    color: '/textures/Wall/plywood_color.png',
    normal: '/textures/Wall/Wall1_Normal.png', // Fallback Normal-Map
  }
}

/**
 * Wall Komponente - Rendert die Boulderwand mit Texturen
 * @param {number} width - Breite der Wand in Metern
 * @param {number} height - Höhe der Wand in Metern
 * @param {number} depth - Tiefe der Wand in Metern
 * @param {Array} position - [x, y, z] Position
 * @param {string} textureType - 'classic' oder 'plywood'
 */
export default function Wall({ 
  width = 2, 
  height = 3, 
  depth = 0.15,
  position = [0, 0, 0],
  textureType = 'classic'
}) {
  const texturePaths = WALL_TEXTURES[textureType] || WALL_TEXTURES.classic
  
  // Lade beide Texturen
  const [colorMap, normalMap] = useTexture([texturePaths.color, texturePaths.normal])

  // Textur-Wiederholung basierend auf Wandgröße
  colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping
  colorMap.repeat.set(width, height)
  normalMap.repeat.set(width, height)

  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial 
        map={colorMap}
        normalMap={normalMap}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  )
}
