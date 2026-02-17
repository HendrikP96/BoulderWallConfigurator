import Singleton from '../utils/Singleton.js';

class EventBus extends Singleton {

  constructor() {
    super();
    if (this._isInitialized) return;
    this._isInitialized = true;
    
    this.listeners = {};
  }

  on(event, callback) {
    if (this.listeners[event] === undefined) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event] === undefined) {
      return;
    }

    let index = -1;
    for (let i = 0; i < this.listeners[event].length; i++) {
      if (this.listeners[event][i] === callback) {
        index = i;
        break;
      }
    }

    if (index !== -1) {
      this.listeners[event].splice(index, 1);
    }
  }

  emit(event, data) {
    if (this.listeners[event] === undefined) {
      return;
    }

    for (let i = 0; i < this.listeners[event].length; i++) {
      this.listeners[event][i](data);
    }
  }

  clear() {
    this.listeners = {};
  }
}

export default EventBus;
