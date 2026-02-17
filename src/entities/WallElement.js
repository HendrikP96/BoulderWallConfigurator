import * as THREE from "three";
import BoltHole from './BoltHole.js';

class WallElement {

  constructor(width, height, position, holeSpacing) {
    this.width = width;
    this.height = height;
    this.position = position || { x: 0, y: 0, z: 0 };
    this.holeSpacing = holeSpacing || 0.15;
    this.depth = 0.15;
    this.boltHoles = this.generateBoltHoleGrid();
    this.group = null;
    this.mesh = null;
  }

  createMesh(textureLoader, texturePaths) {
    this.group = new THREE.Group();
    this.group.position.set(this.position.x, this.position.y, this.position.z);

    let geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);

    let colorTexture = textureLoader.load(texturePaths.color);
    let normalTexture = textureLoader.load(texturePaths.normal);

    colorTexture.wrapS = colorTexture.wrapT = THREE.RepeatWrapping;
    normalTexture.wrapS = normalTexture.wrapT = THREE.RepeatWrapping;
    colorTexture.repeat.set(this.width, this.height);
    normalTexture.repeat.set(this.width, this.height);

    let material = new THREE.MeshStandardMaterial({
      map: colorTexture,
      normalMap: normalTexture,
      roughness: 0.8,
      metalness: 0.1
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.group.add(this.mesh);

    let boltHoles = this.getAllBoltHoles();
    for (let i = 0; i < boltHoles.length; i++) {
      let boltHole = boltHoles[i];
      let mesh = boltHole.getMesh();
      if (mesh !== null) {
        this.group.add(mesh);
      }
    }

    return this.group;
  }

  /**
   * Erzeugt ein gleichmäßiges Raster von Bohrlöchern auf der Wandoberfläche.
   * Das Raster wird zentriert, sodass links/rechts und oben/unten gleiche Ränder entstehen.
   */
  generateBoltHoleGrid() {
    let holes = [];

    // Anzahl Spalten/Reihen basierend auf Wandgröße und Abstand
    let cols = Math.floor(this.width / this.holeSpacing);
    let rows = Math.floor(this.height / this.holeSpacing);

    // Gesamtgröße des Rasters (zwischen äußersten Löchern)
    let gridWidth = (cols - 1) * this.holeSpacing;
    let gridHeight = (rows - 1) * this.holeSpacing;

    // Rand links/unten, um das Raster zu zentrieren
    let marginX = (this.width - gridWidth) / 2;
    let marginY = (this.height - gridHeight) / 2;

    // Bohrlöcher liegen auf der Vorderseite der Wand
    let surfaceZ = this.depth / 2;

    for (let row = 0; row < rows; row++) {
      let rowHoles = [];
      for (let col = 0; col < cols; col++) {
        // Position relativ zum Wandzentrum berechnen
        let posX = -this.width / 2 + marginX + col * this.holeSpacing;
        let posY = -this.height / 2 + marginY + row * this.holeSpacing;
        let position = { x: posX, y: posY, z: surfaceZ };
        let boltHole = new BoltHole(position);
        rowHoles.push(boltHole);
      }
      holes.push(rowHoles);
    }
    return holes;
  }

  disposeMesh() {
    if (this.mesh !== null) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.mesh = null;
    }
    if (this.group !== null) {
      this.group = null;
    }
  }

  // --- Getter / Setter ---

  getGroup() {
    return this.group;
  }

  getMesh() {
    return this.mesh;
  }

  getWidth() {
    return this.width;
  }

  getHeight() {
    return this.height;
  }

  getDepth() {
    return this.depth;
  }

  getPosition() {
    return this.position;
  }

  getAllBoltHoles() {
    let allHoles = [];
    for (let row = 0; row < this.boltHoles.length; row++) {
      for (let col = 0; col < this.boltHoles[row].length; col++) {
        allHoles.push(this.boltHoles[row][col]);
      }
    }
    return allHoles;
  }
}

export default WallElement;
