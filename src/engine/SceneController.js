import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import WallBuilder from "../managers/WallBuilder.js";
import HoldManager from "../managers/HoldManager.js";
import RouteManager from "../managers/RouteManager.js";
import InputManager from "./InputManager.js";
import DemoHall from "./DemoHall.js";

class SceneController {

  constructor() {
    this.container = null;
    this.isRunning = false;
    this.isInitialized = false;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.textureLoader = new THREE.TextureLoader();

    this.holdManager = new HoldManager();
    this.wallBuilder = new WallBuilder();
    this.wall = this.wallBuilder.createSimpleWall(2, 3);
    this.routeManager = new RouteManager(this.wall);
    this.inputManager = null;
    this.demoHall = new DemoHall();

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

    this.inputManager = InputManager.getInstance();
    this.inputManager.init(this.container, this.camera);

    let self = this;
    this.holdManager.preloadAll(function() {
      self.buildScene();
      self.collectColliders();
      window.addEventListener("resize", self.boundOnResize);
      self.start();
      self.isInitialized = true;
    });
  }

  createScene() {
    this.scene = new THREE.Scene();
    // Heller Hintergrund für sauberes Weiß
    this.scene.background = new THREE.Color(0xf0f0f0);
    this.scene.fog = new THREE.Fog(0xf0f0f0, 30, 80);
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
    this.renderer.toneMappingExposure = 1.4;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.container.appendChild(this.renderer.domElement);
  }

  createLights() {
    // Helles Ambient für gleichmäßige Grundbeleuchtung
    let ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    // Hemisphere für natürlichen Himmel/Boden-Gradient
    let hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xf5f5f5, 0.7);
    this.scene.add(hemisphereLight);

    // Hauptlicht mit Schatten
    let directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(4, 10, 6);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 25;
    directionalLight.shadow.camera.left = -5;
    directionalLight.shadow.camera.right = 5;
    directionalLight.shadow.camera.top = 6;
    directionalLight.shadow.camera.bottom = -1;
    directionalLight.shadow.bias = -0.0005;
    this.scene.add(directionalLight);

    // Fülllicht von der anderen Seite
    let fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-4, 6, 4);
    this.scene.add(fillLight);
  }

  createControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enablePan = true;
    this.controls.enableZoom = true;
    this.controls.enableRotate = true;
    this.controls.minDistance = 1;
    this.controls.maxDistance = 25;
    this.controls.target.set(0, 1.5, 0);
    this.controls.update();
  }

  createHelpers() {
    this.demoHall.build(this.scene);
  }

  buildScene() {
    this.wall.setTextureLoader(this.textureLoader);
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

      let pos = { x: 0, y: 0, z: 0 };
      let mesh = hold.createMesh(this.holdManager, pos);
      if (mesh !== null) {
        boltHole.getMesh().add(mesh);
      }
    }
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
        }
      }
    }

    this.inputManager.setColliders(colliderMeshes);
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

  dispose() {
    this.stop();

    if (this.inputManager !== null) {
      this.inputManager.dispose();
    }

    this.holdManager.hidePreview();
    window.removeEventListener("resize", this.boundOnResize);
    this.wall.disposeAllMeshes();

    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);

    this.isInitialized = false;
  }
}

export default SceneController;
