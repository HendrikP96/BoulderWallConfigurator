import * as THREE from "three";
import EventBus from "./EventBus.js";
import Singleton from "../utils/Singleton.js";

class InputManager extends Singleton {

  constructor() {
    super();
    if (this._isInitialized) return;
    this._isInitialized = true;

    this.container = null;
    this.camera = null;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.colliders = [];
    this.hoveredTarget = null;

    this.boundOnMouseMove = this.onMouseMove.bind(this);
    this.boundOnClick = this.onClick.bind(this);
  }

  init(container, camera) {
    this.container = container;
    this.camera = camera;
    this.addEventListeners();
  }

  addEventListeners() {
    if (this.container === null) return;
    this.container.addEventListener("mousemove", this.boundOnMouseMove);
    this.container.addEventListener("click", this.boundOnClick);
  }

  removeEventListeners() {
    if (this.container === null) return;
    this.container.removeEventListener("mousemove", this.boundOnMouseMove);
    this.container.removeEventListener("click", this.boundOnClick);
  }

  onMouseMove(event) {
    let rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  onClick(event) {
    if (this.hoveredTarget === null) {
      return;
    }

    if (typeof this.hoveredTarget.onClick === "function") {
      this.hoveredTarget.onClick();
      EventBus.getInstance().emit("interaction:click", this.hoveredTarget);
    }
  }

  update() {
    if (this.colliders.length === 0) {
      return;
    }

    this.raycaster.setFromCamera(this.mouse, this.camera);

    let intersects = this.raycaster.intersectObjects(this.colliders);
    let newTarget = null;

    if (intersects.length > 0) {
      newTarget = intersects[0].object.userData.owner;
    }

    if (newTarget !== this.hoveredTarget) {
      if (this.hoveredTarget !== null && typeof this.hoveredTarget.onHoverExit === "function") {
        this.hoveredTarget.onHoverExit();
        EventBus.getInstance().emit("interaction:hoverEnd", this.hoveredTarget);
      }

      if (newTarget !== null && typeof newTarget.onHover === "function") {
        newTarget.onHover();
        EventBus.getInstance().emit("interaction:hover", newTarget);
      }

      this.hoveredTarget = newTarget;
    }
  }

  dispose() {
    this.removeEventListeners();
    this.hoveredTarget = null;
    this.colliders = [];
  }

  setColliders(colliders) {
    this.colliders = colliders;
  }

  addCollider(collider) {
    let mesh = collider.getMesh();
    if (mesh !== null) {
      this.colliders.push(mesh);
    }
  }

  clearColliders() {
    this.colliders = [];
  }

  getHoveredTarget() {
    return this.hoveredTarget;
  }
}

export default InputManager;
