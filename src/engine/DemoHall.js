import * as THREE from "three";

class DemoHall {

  constructor() {
    this.scene = null;
    this.textureLoader = new THREE.TextureLoader();
    this.matHeight = 0.35;  // Gesamthöhe der Matte
  }

  build(scene) {
    this.scene = scene;
    this.createRoom();
    this.createHeightScale();
  }

  createRoom() {
    let self = this;

    // Boden - weiß
    let floorGeometry = new THREE.PlaneGeometry(50, 50);
    let floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.0
    });
    let floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -this.matHeight - 0.01;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Dezentes Grid (auf Bodenhöhe)
    let gridHelper = new THREE.GridHelper(50, 50, 0x333333, 0x333333);
    gridHelper.position.y = -this.matHeight;
    gridHelper.material.opacity = 0.15;
    gridHelper.material.transparent = true;
    this.scene.add(gridHelper);

    this.createFallMat();
    this.createWalls();
  }

  createFallMat() {
    let self = this;

    // Zweiteilige Fallschutzmatte
    // Unterer Block: Plywood, 25cm hoch
    let baseWidth = 3.5;
    let baseDepth = 2.0;
    let baseHeight = 0.25;
    
    // Oberer Block: Ground+Blau, 5cm breiter auf jeder Seite
    let topWidth = baseWidth + 0.1;
    let topDepth = baseDepth + 0.1;
    let topHeight = this.matHeight - baseHeight;

    let baseGeometry = new THREE.BoxGeometry(baseWidth, baseHeight, baseDepth);
    let topGeometry = new THREE.BoxGeometry(topWidth, topHeight, topDepth);
    
    // Texturen laden
    let plywoodTexture = null;
    let groundTexture = null;
    let loadedCount = 0;

    let matHeight = this.matHeight;

    function createMatBlocks() {
      if (loadedCount < 2) return;

      // Plywood für unteren Block (alle Seiten)
      plywoodTexture.wrapS = plywoodTexture.wrapT = THREE.RepeatWrapping;
      plywoodTexture.repeat.set(2, 0.3);

      let baseMaterial = new THREE.MeshStandardMaterial({ 
        map: plywoodTexture,
        roughness: 0.85,
        metalness: 0.0
      });

      let baseBlock = new THREE.Mesh(baseGeometry, baseMaterial);
      baseBlock.position.set(0, -matHeight + baseHeight / 2, 0.85);
      baseBlock.castShadow = true;
      baseBlock.receiveShadow = true;
      self.scene.add(baseBlock);

      // Ground+Blau für oberen Block
      let matBlue = 0x4a7ab5;

      // Separate Texturen für Oben und Seiten (unterschiedliche Repeats)
      let topTexture = groundTexture.clone();
      topTexture.needsUpdate = true;
      topTexture.wrapS = topTexture.wrapT = THREE.RepeatWrapping;
      topTexture.repeat.set(2, 1.5);

      let sideTexture = groundTexture.clone();
      sideTexture.needsUpdate = true;
      sideTexture.wrapS = sideTexture.wrapT = THREE.RepeatWrapping;
      sideTexture.repeat.set(2, 0.15);

      let topMaterial = new THREE.MeshStandardMaterial({ 
        map: topTexture,
        color: matBlue,
        roughness: 0.95,
        metalness: 0.0
      });

      let sideMaterial = new THREE.MeshStandardMaterial({ 
        map: sideTexture,
        color: matBlue,
        roughness: 0.95,
        metalness: 0.0
      });

      // BoxGeometry Faces: +X, -X, +Y, -Y, +Z, -Z
      let materials = [
        sideMaterial,  // +X (rechts)
        sideMaterial,  // -X (links)
        topMaterial,   // +Y (oben)
        sideMaterial,  // -Y (unten)
        sideMaterial,  // +Z (vorne)
        sideMaterial   // -Z (hinten)
      ];

      let topBlock = new THREE.Mesh(topGeometry, materials);
      topBlock.position.set(0, -topHeight / 2, 0.85);
      topBlock.castShadow = true;
      topBlock.receiveShadow = true;
      self.scene.add(topBlock);
    }

    this.textureLoader.load('/textures/Wall/Ground.png', function(tex) {
      groundTexture = tex;
      loadedCount++;
      createMatBlocks();
    });

    this.textureLoader.load('/textures/Wall/plywood_color.png', function(tex) {
      plywoodTexture = tex;
      loadedCount++;
      createMatBlocks();
    });
  }

  createWalls() {
    // Wände - weiß im Hintergrund
    let wallMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      roughness: 0.95,
      metalness: 0.0
    });

    // Rückwand
    let backWallGeometry = new THREE.PlaneGeometry(50, 12);
    let backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    backWall.position.set(0, 6, -15);
    this.scene.add(backWall);

    // Seitenwände
    let sideWallGeometry = new THREE.PlaneGeometry(30, 12);
    
    let leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    leftWall.position.set(-18, 6, 0);
    leftWall.rotation.y = Math.PI / 2;
    this.scene.add(leftWall);

    let rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
    rightWall.position.set(18, 6, 0);
    rightWall.rotation.y = -Math.PI / 2;
    this.scene.add(rightWall);

    // Decke
    let ceilingGeometry = new THREE.PlaneGeometry(50, 30);
    let ceilingMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.0
    });
    let ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(0, 12, 0);
    this.scene.add(ceiling);
  }

  createHeightScale() {
    let scaleGroup = new THREE.Group();
    scaleGroup.position.set(-1.5, 0, 0);

    let lineMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    let linePoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 3, 0)
    ];
    let lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
    let line = new THREE.Line(lineGeometry, lineMaterial);
    scaleGroup.add(line);

    // Strich bei 0 (ohne Label)
    let zeroTickPoints = [
      new THREE.Vector3(-0.1, 0, 0),
      new THREE.Vector3(0.1, 0, 0)
    ];
    let zeroTickGeometry = new THREE.BufferGeometry().setFromPoints(zeroTickPoints);
    let zeroTick = new THREE.Line(zeroTickGeometry, lineMaterial);
    scaleGroup.add(zeroTick);

    for (let i = 1; i <= 3; i++) {
      let tickPoints = [
        new THREE.Vector3(-0.1, i, 0),
        new THREE.Vector3(0.1, i, 0)
      ];
      let tickGeometry = new THREE.BufferGeometry().setFromPoints(tickPoints);
      let tick = new THREE.Line(tickGeometry, lineMaterial);
      scaleGroup.add(tick);

      let canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 32;
      let ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000000';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(i + 'm', 32, 24);

      let texture = new THREE.CanvasTexture(canvas);
      let spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      let sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(-0.25, i, 0);
      sprite.scale.set(0.3, 0.15, 1);
      scaleGroup.add(sprite);
    }

    this.scene.add(scaleGroup);
  }
}

export default DemoHall;
