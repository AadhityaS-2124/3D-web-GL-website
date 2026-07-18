class StateEngine {
  constructor() {
    this.state = {
      scrollPercent: 0,
      targetScrollPercent: 0,
      mouse: { x: 0, y: 0 },
      targetMouse: { x: 0, y: 0 },
      currentSection: 0,
      activeObject: null,
      inspectMode: false,
      isLoaded: false,
      quality: 'high', // 'high' or 'low'
      fps: 60,
    };
    this.listeners = {};
  }

  subscribe(key, callback) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }
    this.listeners[key].push(callback);
    // Return unsubscribe function
    return () => {
      this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
    };
  }

  set(key, value) {
    const oldValue = this.state[key];
    
    // For nested objects like mouse, check deep equality or always trigger
    if (typeof value === 'object' && value !== null) {
      this.state[key] = { ...value };
      if (this.listeners[key]) {
        this.listeners[key].forEach(cb => cb(this.state[key], oldValue));
      }
      return;
    }

    if (oldValue !== value) {
      this.state[key] = value;
      if (this.listeners[key]) {
        this.listeners[key].forEach(cb => cb(value, oldValue));
      }
    }
  }

  get(key) {
    if (typeof this.state[key] === 'object' && this.state[key] !== null) {
      return { ...this.state[key] };
    }
    return this.state[key];
  }
}

export const state = new StateEngine();
