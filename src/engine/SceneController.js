import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import WallBuilder from "../components/Classes/WallBuilder.js";
import HoldFactory from "../components/Classes/HoldFactory.js";
import RouteManager from "../components/Classes/RouteManager.js";
import InteractionManager from "../components/Classes/InteractionManager.js";
import InputManager from "./InputManager.js";

/**
 * SceneController - Zentrale Klasse für die Verwaltung aller 3D-Engine-Komponenten:
 * Verwaltet Scene, Camera, Renderer und verbindet alle Komponenten.
 */
class SceneController {

  constructor() {
    this.container = null;
    this.isRunning = false;
    this.isInitialized = false;
    this.updateCallbacks = [];

    // Three.js Core
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.textureLoader = new THREE.TextureLoader();

    // Manager für Interaktionen und Logik
    this.holdFactory = new HoldFactory();
    this.wallBuilder = new WallBuilder();

    this.wall = this.wallBuilder.createSimpleWall(2, 3);    // zu bearbeitende Wand erstellen

    this.routeManager = new RouteManager(this.wall);
    this.interactionManager = new InteractionManager(
      this.wall,
      this.holdFactory,
      this.routeManager,
      this.wallBuilder
    );
    this.inputManager = null;

    // Confirmation
    this.confirmMesh = null;
    this.confirmParent = null;
    this.confirmTimeout = null;

    this.boundAnimate = this.animate.bind(this);
    this.boundOnResize = this.onResize.bind(this);
  }

  init(container) {
    if (this.isInitialized) {
      console.warn("SceneController ist bereits initialisiert.");
      return;
    }

    if (container === null) {
      console.error("Container ist null.");
      return;
    }

    this.container = container;

    this.createScene();
    this.createCamera();
    this.createRenderer();
    this.createLights();
    this.createControls();
    this.createHelpers();

    this.inputManager = new InputManager(
      this.container,
      this.camera
    );

    // Prefabs vorladen, dann Scene bauen
    let self = this;
    this.holdFactory.preloadAll(function() {
      self.buildScene();
      self.collectColliders();
      window.addEventListener("resize", self.boundOnResize);
      self.start();
      self.isInitialized = true;
    });
  }

  collectColliders() {
    let boltHoles = this.wall.getAllBoltHoles();
    let colliderMeshes = [];

    for (let i = 0; i < boltHoles.length; i++) {
      let boltHole = boltHoles[i];
      let collider = boltHole.getCollider();

      if (collider !== null) {
        let mesh = collider.getMesh();
        if (mesh !== null) {
          colliderMeshes.push(mesh);
          // Nicht zur Scene hinzufügen - Collider sind schon Children der BoltHoles
        }
      }
    }

    this.inputManager.setColliders(colliderMeshes);
    console.log("Colliders gesammelt:", colliderMeshes.length);
  }

  createScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x2a2a3e);
    this.scene.fog = new THREE.Fog(0x2a2a3e, 15, 30);
  }

  createCamera() {
    let width = this.container.clientWidth;
    let height = this.container.clientHeight;
    let aspect = width / height;

    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000);
    this.camera.position.set(0, 2, 5);
  }

  createRenderer() {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.container.appendChild(this.renderer.domElement);
  }

  createLights() {
    let ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    let hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x362d26, 0.5);
    this.scene.add(hemisphereLight);

    let directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = false;
    this.scene.add(directionalLight);

    let fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-5, 5, -5);
    this.scene.add(fillLight);
  }

  createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enablePan = true;
    this.controls.enableZoom = true;
    this.controls.enableRotate = true;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 20;
    this.controls.target.set(0, 1.5, 0);
    this.controls.update();
  }

  createHelpers() {
    // Boden-Grid (1m Kästchen)
    let gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x333333);
    gridHelper.position.y = 0;
    this.scene.add(gridHelper);

    // Vertikale Höhenskala neben der Wand
    this.createHeightScale();

    let groundGeometry = new THREE.PlaneGeometry(50, 50);
    let groundMaterial = new THREE.ShadowMaterial({ opacity: 0.3 });
    let ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  createHeightScale() {
    let scaleGroup = new THREE.Group();
    scaleGroup.position.set(-1.5, 0, 0);  // Links neben der Wand

    // Vertikale Linie
    let lineMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });
    let linePoints = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 3, 0)
    ];
    let lineGeometry = new THREE.BufferGeometry().setFromPoints(linePoints);
    let line = new THREE.Line(lineGeometry, lineMaterial);
    scaleGroup.add(line);

    // Horizontale Markierungen bei jedem Meter
    for (let i = 0; i <= 3; i++) {
      let tickPoints = [
        new THREE.Vector3(-0.1, i, 0),
        new THREE.Vector3(0.1, i, 0)
      ];
      let tickGeometry = new THREE.BufferGeometry().setFromPoints(tickPoints);
      let tick = new THREE.Line(tickGeometry, lineMaterial);
      scaleGroup.add(tick);

      // Text-Label (Sprite)
      let canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 32;
      let ctx = canvas.getContext('2d');
      ctx.fillStyle = '#888888';
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

  buildScene() {
    this.wall.createAllMeshes(this.textureLoader);
    this.scene.add(this.wall.getGroup());
    this.rebuildHoldMeshes();
  }

  rebuildHoldMeshes() {
    let boltHoles = this.wall.getAllBoltHoles();

    for (let i = 0; i < boltHoles.length; i++) {
      let boltHole = boltHoles[i];
      let hold = boltHole.getHold();

      if (hold === null) {
        continue;
      }

      let existingMesh = hold.getMesh();
      if (existingMesh !== null) {
        continue;
      }

      // Hold-Position relativ zum BoltHole (0,0,0)
      let pos = { x: 0, y: 0, z: 0 };
      let mesh = hold.createMesh(this.holdFactory, pos);
      if (mesh !== null) {
        boltHole.getMesh().add(mesh);
      }
    }
  }

  showConfirmation(boltHole) {
    if (this.confirmMesh !== null && this.confirmParent !== null) {
      this.confirmParent.remove(this.confirmMesh);
      this.confirmMesh.geometry.dispose();
      this.confirmMesh.material.dispose();
      this.confirmMesh = null;
      this.confirmParent = null;
    }

    if (this.confirmTimeout !== null) {
      clearTimeout(this.confirmTimeout);
    }

    let geometry = new THREE.RingGeometry(0.025, 0.035, 16);
    let material = new THREE.MeshBasicMaterial({
      color: 0x22c55e,
      side: THREE.DoubleSide
    });

    this.confirmMesh = new THREE.Mesh(geometry, material);
    this.confirmMesh.position.set(0, 0, 0.03);
    this.confirmParent = boltHole.getMesh();
    this.confirmParent.add(this.confirmMesh);

    let self = this;
    this.confirmTimeout = setTimeout(function() {
      if (self.confirmMesh !== null && self.confirmParent !== null) {
        self.confirmParent.remove(self.confirmMesh);
        self.confirmMesh.geometry.dispose();
        self.confirmMesh.material.dispose();
        self.confirmMesh = null;
        self.confirmParent = null;
      }
    }, 500);
  }

  start() {
    if (this.isRunning === false) {
      this.isRunning = true;
      this.animate();
    }
  }

  stop() {
    this.isRunning = false;
  }

  animate() {
    if (this.isRunning === false) {
      return;
    }

    requestAnimationFrame(this.boundAnimate);

    this.inputManager.update();
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  onResize() {
    let width = this.container.clientWidth;
    let height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  update() {
    for (let i = 0; i < this.updateCallbacks.length; i++) {
      this.updateCallbacks[i]();
    }
  }

  onUpdate(callback) {
    this.updateCallbacks.push(callback);

    let self = this;
    return function() {
      let index = self.updateCallbacks.indexOf(callback);
      if (index !== -1) {
        self.updateCallbacks.splice(index, 1);
      }
    };
  }

  dispose() {
    this.stop();

    if (this.confirmTimeout !== null) {
      clearTimeout(this.confirmTimeout);
    }

    if (this.inputManager !== null) {
      this.inputManager.dispose();
    }

    this.holdFactory.hidePreview();

    window.removeEventListener("resize", this.boundOnResize);

    this.wall.disposeAllMeshes();

    if (this.confirmMesh !== null && this.confirmParent !== null) {
      this.confirmParent.remove(this.confirmMesh);
      this.confirmMesh.geometry.dispose();
      this.confirmMesh.material.dispose();
    }

    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);

    this.updateCallbacks = [];
    this.isInitialized = false;
  }
}

export default SceneController;
