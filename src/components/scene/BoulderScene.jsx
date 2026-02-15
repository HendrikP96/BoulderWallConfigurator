import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Grid } from '@react-three/drei'
import Hold from './Hold'
import Wall from './Wall'

// Farben für die Routen
const ROUTE_COLORS = [
  '#FF6B6B', // Rot
  '#4ECDC4', // Türkis
  '#FFE66D', // Gelb
  '#6C5CE7', // Violett
  '#00B894', // Grün
]

// Bohrloch-Raster Konfiguration (T-Nut Standard ~15cm)
const HOLE_SPACING = 0.15 // 15cm Abstand
const HOLE_RADIUS = 0.004 // 4mm Radius
const HOLE_DEPTH = 0.01

// Generiere Bohrloch-Positionen auf der Wand
function generateHoleGrid(wallWidth, wallHeight) {
  const holes = []
  
  // Anzahl Löcher berechnen
  const cols = Math.floor(wallWidth / HOLE_SPACING)
  const rows = Math.floor(wallHeight / HOLE_SPACING)
  
  // Grid zentrieren - gleicher Abstand zu allen Rändern
  const gridWidth = (cols - 1) * HOLE_SPACING
  const gridHeight = (rows - 1) * HOLE_SPACING
  const marginX = (wallWidth - gridWidth) / 2
  const marginY = (wallHeight - gridHeight) / 2
  
  const startX = -wallWidth / 2 + marginX
  const startY = marginY
  
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      holes.push({
        x: startX + col * HOLE_SPACING,
        y: startY + row * HOLE_SPACING,
        gridCol: col,
        gridRow: row
      })
    }
  }
  return holes
}

// Finde nächstes Bohrloch zu einer Position
function snapToGrid(x, y, holes) {
  let closest = holes[0]
  let minDist = Infinity
  
  for (const hole of holes) {
    const dist = Math.sqrt((hole.x - x) ** 2 + (hole.y - y) ** 2)
    if (dist < minDist) {
      minDist = dist
      closest = hole
    }
  }
  return closest
}

// Generiere sinnvolle Boulder-Routen (nur auf Bohrloch-Positionen)
function generateRoutes(wallWidth, wallHeight, holeGrid, wallDepth) {
  const holds = []
  let holdCounter = 0
  const usedHoles = new Set()
  
  // 3 Routen nebeneinander auf der Wand
  const routes = [
    { color: ROUTE_COLORS[0], xOffset: -0.5 },  // Linke Route (Rot)
    { color: ROUTE_COLORS[1], xOffset: 0 },      // Mittlere Route (Türkis)
    { color: ROUTE_COLORS[2], xOffset: 0.5 },    // Rechte Route (Gelb)
  ]
  
  routes.forEach((route, routeIndex) => {
    const gripCount = 5 + Math.floor(Math.random() * 2)
    const heightStep = (wallHeight - 0.5) / (gripCount - 1)
    
    for (let i = 0; i < gripCount; i++) {
      const xVariation = (Math.random() - 0.5) * 0.2
      const targetX = route.xOffset + xVariation
      const targetY = 0.25 + i * heightStep
      
      // Finde nächstes freies Bohrloch
      const hole = snapToGrid(targetX, targetY, holeGrid)
      const holeKey = `${hole.gridCol},${hole.gridRow}`
      
      // Überspringe wenn Loch bereits belegt
      if (usedHoles.has(holeKey)) continue
      usedHoles.add(holeKey)
      
      holds.push({
        id: holdCounter++,
        holdId: Math.floor(Math.random() * 7) + 1,
        position: [hole.x, hole.y, wallDepth / 2],
        rotation: [0, 0, Math.random() * Math.PI * 2],
        scale: i === 0 ? 0.4 : 0.25 + Math.random() * 0.15,
        color: route.color,
        routeIndex: routeIndex
      })
    }
  })
  
  return holds
}

// Bohrloch-Komponente
function BoltHole({ position, hasHold = false }) {
  return (
    <group position={position}>
      {/* Loch */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[HOLE_RADIUS, HOLE_RADIUS, HOLE_DEPTH, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Debug: Kleine Kugel um Position zu sehen */}
      {/* <mesh>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshStandardMaterial color={hasHold ? "red" : "blue"} />
      </mesh> */}
    </group>
  )
}

/**
 * BoulderScene - Hauptkomponente für die 3D-Szene des Boulderwand-Konfigurators
 * Enthält die grundlegende Three.js Scene-Struktur mit Kamera, Beleuchtung und Controls
 */
export default function BoulderScene() {
  const wallWidth = 2
  const wallHeight = 3
  const wallDepth = 0.15
  
  // Generiere Bohrloch-Grid
  const holeGrid = useMemo(() => generateHoleGrid(wallWidth, wallHeight), [wallWidth, wallHeight])
  
  // Generiere Boulder-Routen basierend auf Bohrloch-Positionen
  const routeHolds = useMemo(() => generateRoutes(wallWidth, wallHeight, holeGrid, wallDepth), [wallWidth, wallHeight, holeGrid, wallDepth])

  return (
    <Canvas
      camera={{ position: [0, 2, 6], fov: 50 }}
      shadows
      style={{ width: '100vw', height: '100vh' }}
    >
      {/* Beleuchtung */}
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      
      {/* Umgebung */}
      <Environment preset="warehouse" />
      
      {/* Boden-Grid zur Orientierung */}
      <Grid 
        infiniteGrid 
        cellSize={0.5} 
        cellThickness={0.5} 
        sectionSize={2} 
        sectionThickness={1}
        fadeDistance={30}
        fadeStrength={1}
      />
      
      {/* Wand 1 - Klassisch (links) */}
      <Suspense fallback={
        <mesh position={[-wallWidth / 2 - 0.2, wallHeight / 2, 0]}>
          <boxGeometry args={[wallWidth, wallHeight, 0.15]} />
          <meshStandardMaterial color="#888888" />
        </mesh>
      }>
        <Wall 
          width={wallWidth} 
          height={wallHeight} 
          position={[-wallWidth / 2 - 0.2, wallHeight / 2, 0]}
          textureType="classic"
        />
      </Suspense>
      
      {/* Wand 2 - Plywood (rechts) */}
      <Suspense fallback={
        <mesh position={[wallWidth / 2 + 0.2, wallHeight / 2, 0]}>
          <boxGeometry args={[wallWidth, wallHeight, 0.15]} />
          <meshStandardMaterial color="#888888" />
        </mesh>
      }>
        <Wall 
          width={wallWidth} 
          height={wallHeight} 
          position={[wallWidth / 2 + 0.2, wallHeight / 2, 0]}
          textureType="plywood"
        />
      </Suspense>
      
      {/* Bohrlöcher auf der linken Wand */}
      {holeGrid.map((hole, index) => (
        <BoltHole 
          key={`left-${index}`} 
          position={[hole.x - wallWidth / 2 - 0.2, hole.y, wallDepth / 2 + 0.001]} 
        />
      ))}
      
      {/* Bohrlöcher auf der rechten Wand */}
      {holeGrid.map((hole, index) => (
        <BoltHole 
          key={`right-${index}`} 
          position={[hole.x + wallWidth / 2 + 0.2, hole.y, wallDepth / 2 + 0.001]} 
        />
      ))}
      
      {/* Boulder-Routen - DEAKTIVIERT */}
      {/*<Suspense fallback={null}>
        {routeHolds.map((hold) => (
          <Hold
            key={hold.id}
            holdId={hold.holdId}
            position={hold.position}
            rotation={hold.rotation}
            scale={hold.scale}
            color={hold.color}
          />
        ))}
      </Suspense>*/}
      
      {/* Kamera-Steuerung */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={1}
        maxDistance={20}
        target={[0, wallHeight / 2, 0]}
      />
    </Canvas>
  )
}
