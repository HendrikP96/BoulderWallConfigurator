import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Center } from '@react-three/drei'

// Verfügbare Hold-Typen
const HOLD_TYPES = [1, 2, 4, 5, 6, 7]

/**
 * HoldPreview3D
 * 
 * Rendert ein kleines 3D-Vorschau des Hold-Modells
 */
function HoldPreview3D({ holdId }) {
  const modelPath = `/models/Holds/Hold_${holdId}/Hold_${holdId}.glb`
  const { scene } = useGLTF(modelPath)

  return (
    <Center>
      <primitive object={scene.clone()} scale={15} />
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
      title={`Hold ${holdId}`}
    >
      <div className="hold-preview-canvas">
        <Canvas
          camera={{ position: [0, 0, 3], fov: 40 }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[2, 2, 2]} intensity={0.8} />
          <Suspense fallback={null}>
            <HoldPreview3D holdId={holdId} />
          </Suspense>
        </Canvas>
      </div>
      <span className="hold-type-name">Hold {holdId}</span>
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
