import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, Center, useTexture } from '@react-three/drei'
import * as THREE from 'three'

// Verfügbare Griff-Typen (ID -> Anzeigename)
const HOLD_TYPES = [1, 2, 3, 4, 5, 6]
const GRIFF_NAMES = {
  1: "Griff 1",
  2: "Griff 2",
  3: "Griff 3",
  4: "Griff 4",
  5: "Griff 5",
  6: "Griff 6"
}

/**
 * HoldPreview3D
 * 
 * Rendert ein kleines 3D-Vorschau des Hold-Modells mit Normal-Map
 */
function HoldPreview3D({ holdId }) {
  const modelPath = `/models/Holds/Hold_${holdId}/Hold_${holdId}.glb`
  const normalPath = `/models/Holds/Hold_${holdId}/Hold_${holdId}_Normal.png`
  
  const { scene } = useGLTF(modelPath)
  const normalMap = useTexture(normalPath)

  let clonedScene = scene.clone()
  clonedScene.traverse(function(child) {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: '#ffffff',
        normalMap: normalMap,
        side: THREE.DoubleSide
      })
    }
  })

  return (
    <Center>
      <primitive object={clonedScene} scale={12} />
    </Center>
  )
}

/**
 * HoldTypeItem
 * 
 * Einzelner Hold mit 3D-Vorschau
 */
function HoldTypeItem({ holdId, isSelected, onSelect }) {
  return (
    <button
      className={`hold-type-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect?.(holdId)}
      title={GRIFF_NAMES[holdId]}
    >
      <div className="hold-preview-canvas">
        <Canvas
          camera={{ position: [0, 0, 4], fov: 35 }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[3, 3, 3]} intensity={1.0} />
          <directionalLight position={[-2, -1, 2]} intensity={0.4} />
          <Suspense fallback={null}>
            <HoldPreview3D holdId={holdId} />
          </Suspense>
        </Canvas>
      </div>
      <span className="hold-type-name">{GRIFF_NAMES[holdId]}</span>
    </button>
  )
}

/**
 * HoldTypeSelector
 * 
 * Zeigt alle verfügbaren Hold-Typen mit 3D-Vorschau an.
 */
function HoldTypeSelector({ selectedType, onSelect }) {
  return (
    <div className="hold-type-selector">
      {HOLD_TYPES.map(holdId => (
        <HoldTypeItem
          key={holdId}
          holdId={holdId}
          isSelected={selectedType === holdId}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

export default HoldTypeSelector
