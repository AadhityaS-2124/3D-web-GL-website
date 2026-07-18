import * as THREE from 'three';
import './style.css';
import gsap from 'gsap';
import { state } from './state.js';
import { SceneManager } from './scene.js';
import { create3DObjects, updateObjects } from './objects.js';

// DOM elements
const canvas = document.getElementById('webgl-canvas');
const cursor = document.getElementById('custom-cursor');
const cursorRing = document.getElementById('custom-cursor-ring');
const preloader = document.getElementById('preloader');
const preloaderBar = document.getElementById('preloader-bar');
const preloaderPercent = document.getElementById('preloader-percentage');
const scrollProgressBar = document.getElementById('scroll-progress-bar');
const fpsDisplay = document.getElementById('fps-display');
const qualityDisplay = document.getElementById('quality-display');

// Inspect Overlay DOM elements
const inspectOverlay = document.getElementById('inspect-overlay');
const inspectTitle = document.getElementById('inspect-object-title');
const inspectDesc = document.getElementById('inspect-object-desc');
const inspectRough = document.getElementById('inspect-object-rough');
const inspectTrans = document.getElementById('inspect-object-trans');
const inspectLabel = document.getElementById('inspect-object-label');
const inspectCloseBtn = document.getElementById('inspect-close');
const inspectActionBtn = document.getElementById('inspect-action-btn');
const inspectPromptBtn = document.getElementById('inspect-prompt-btn');

// Oscilloscope elements
const inspectCanvas = document.getElementById('inspect-graph-canvas');
let inspectCtx = null;

let sceneManager;
let objects;

// Initialize components
function init() {
  // 1. Scene setup
  sceneManager = new SceneManager(canvas);
  objects = create3DObjects(sceneManager.scene);
  
  // Set raycast targets
  sceneManager.setInteractiveTargets(objects.interactiveTargets);

  if (inspectCanvas) {
    inspectCtx = inspectCanvas.getContext('2d');
  }

  // 2. Wire up state subscribers
  setupStateSubscribers();

  // 3. Register input events
  registerEvents();

  // 4. Handle preloading lifecycle
  runPreloader();

  // 5. Start main animation loop
  requestAnimationFrame(tick);
}

// Subscribe UI elements to changes in the global state
function setupStateSubscribers() {
  // Section index change -> transition text overlays in/out
  state.subscribe('currentSection', (sectionIdx) => {
    const sections = document.querySelectorAll('.scroll-section');
    sections.forEach((sec, idx) => {
      if (idx === sectionIdx) {
        sec.classList.add('in-view');
      } else {
        sec.classList.remove('in-view');
      }
    });

    // Update section nav dots
    const dots = document.querySelectorAll('.section-dot');
    dots.forEach((dot, idx) => {
      if (idx === sectionIdx) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  });

  // Scroll progress -> update side tracker bar height
  state.subscribe('scrollPercent', (percent) => {
    scrollProgressBar.style.height = `${percent * 100}%`;
  });

  // Inspect mode change -> toggle overlay and body scrolling
  state.subscribe('inspectMode', (isInspecting) => {
    if (isInspecting) {
      document.body.classList.add('inspect-active');
      const activeObj = state.get('activeObject');
      populateInspectCard(activeObj);
      inspectOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('inspect-active');
      inspectOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // FPS display output
  state.subscribe('fps', (fps) => {
    fpsDisplay.textContent = fps;
  });

  // Render quality state update
  state.subscribe('quality', (quality) => {
    qualityDisplay.textContent = quality === 'high' ? 'HIGH-PBR' : 'LOW-ECO';
  });
}

// Populate the inspect panel with metadata based on selected object
function populateInspectCard(activeObject) {
  if (!activeObject) return;

  if (activeObject.name === 'quantum_core') {
    inspectLabel.textContent = 'IMPLANT // CEREBRAL_NEXUS_NODE';
    inspectTitle.textContent = 'CEREBRAL NEXUS CORE';
    inspectDesc.textContent = 'Trans-cortical neural processor implant interface. Measures local field potential (LFP) fluctuations and distributes computing tasks across 64,000 synaptic nodes.';
    inspectRough.textContent = '8.4 GHz FREQ';
    inspectTrans.textContent = '98% CLEAR PBR';
    inspectActionBtn.textContent = 'INITIALIZE CEREBRAL OVERCLOCK';
  } else if (activeObject.name === 'kinetic_torus') {
    inspectLabel.textContent = 'INSTRUMENT // CORTICAL_CALIBRATION_ENGINE';
    inspectTitle.textContent = 'CALIBRATION SCANNER';
    inspectDesc.textContent = 'External high-resonance magnetic flux calibrator. Resolves spatial drift offsets on trans-cortical Nodes to ensure continuous signal alignment.';
    inspectRough.textContent = '4.2 TESLA FLUX';
    inspectTrans.textContent = '0.04 ms LATENCY';
    inspectActionBtn.textContent = 'ENGAGE CALIBRATION SEQUENCE';
  }
}

// Hook up event listeners for user input
function registerEvents() {
  // Cursor Tracking
  window.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Direct cursor movement
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;

    // Dampened trailing cursor ring using GSAP
    gsap.to(cursorRing, {
      left: mouseX,
      top: mouseY,
      duration: 0.25,
      ease: 'power2.out',
    });

    // Normalized mouse coordinate tracking for WebGL parallax (-1 to 1)
    const targetX = (e.clientX / window.innerWidth) * 2 - 1;
    const targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    state.set('targetMouse', { x: targetX, y: targetY });
  });

  // Scrolling logic
  window.addEventListener('scroll', () => {
    if (state.get('inspectMode')) return;

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const rawPercent = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    const percent = Math.max(0, Math.min(1, rawPercent));
    state.set('targetScrollPercent', percent);

    // Update section active indicator index
    let sectionIdx = 0;
    if (percent < 0.12) sectionIdx = 0;
    else if (percent < 0.38) sectionIdx = 1;
    else if (percent < 0.68) sectionIdx = 2;
    else if (percent < 0.90) sectionIdx = 3;
    else sectionIdx = 4;

    if (state.get('currentSection') !== sectionIdx) {
      state.set('currentSection', sectionIdx);
    }
  });

  // Raycasting mouse clicks on WebGL items
  window.addEventListener('click', () => {
    sceneManager.handleClick();
  });

  // Close Inspect Panel
  inspectCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Avoid raycasting clicks immediately
    state.set('inspectMode', false);
    state.set('activeObject', null);
  });

  // Inspect mode button on section 4
  inspectPromptBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    state.set('activeObject', objects.quantumCore);
    state.set('inspectMode', true);
  });

  // Side Dot navigation scrolling click handlers
  const dots = document.querySelectorAll('.section-dot');
  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const secIdx = parseInt(dot.getAttribute('data-section'), 10);
      scrollToSection(secIdx);
    });
  });

  // Top Nav scrolling click handlers
  const navLinks = document.querySelectorAll('.nav-link, .scroll-to-btn');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const href = link.getAttribute('href');
      if (href) {
        const targetSec = document.querySelector(href);
        if (targetSec) {
          scrollToOffset(targetSec.offsetTop);
        }
      }
    });
  });
}

// Custom browser-independent scroll animation using GSAP updates
function scrollToOffset(targetOffset) {
  const scrollObj = { y: window.scrollY };
  gsap.to(scrollObj, {
    y: targetOffset,
    duration: 1.5,
    ease: 'power3.inOut',
    onUpdate: () => {
      window.scrollTo(0, scrollObj.y);
    }
  });
}

// Scroll page directly to target section
function scrollToSection(sectionIdx) {
  const sections = document.querySelectorAll('.scroll-section');
  if (sections[sectionIdx]) {
    scrollToOffset(sections[sectionIdx].offsetTop);
  }
}

// Preloader simulation combined with Three.js resources compiled status
function runPreloader() {
  let progress = 0;
  
  const timer = setInterval(() => {
    progress += Math.floor(Math.random() * 8) + 4;
    
    if (progress >= 100) {
      progress = 100;
      clearInterval(timer);
      
      // Animate preloader overlay fade out
      setTimeout(() => {
        preloader.classList.add('fade-out');
        state.set('isLoaded', true);
        
        // Scale in initial landing text overlays
        gsap.from('#hero .section-content > *', {
          opacity: 0,
          y: 30,
          duration: 1.2,
          stagger: 0.15,
          ease: 'power3.out'
        });
      }, 500);
    }
    
    preloaderBar.style.width = `${progress}%`;
    preloaderPercent.textContent = `${progress}%`;
  }, 100);
}

// Frame loops ticking at 60 FPS
const clock = new THREE.Clock();
function tick() {
  const time = clock.getElapsedTime();

  // 1. Lerping scroll percent for dampened camera transitions
  const targetScroll = state.get('targetScrollPercent');
  let currentScroll = state.get('scrollPercent');
  currentScroll += (targetScroll - currentScroll) * 0.055; // dampening
  state.set('scrollPercent', currentScroll);

  // 2. Lerping mouse parallax coordinates
  const targetMouse = state.get('targetMouse');
  const currentMouse = state.get('mouse');
  const nextMouseX = currentMouse.x + (targetMouse.x - currentMouse.x) * 0.08;
  const nextMouseY = currentMouse.y + (targetMouse.y - currentMouse.y) * 0.08;
  state.set('mouse', { x: nextMouseX, y: nextMouseY });

  // 3. Update objects coordinate meshes and lines
  updateObjects(objects, time, state.get('mouse'));

  // 4. Render Three.js scene through post-processing EffectComposer pipeline
  sceneManager.render(time, currentScroll, state.get('mouse'));

  // 5. Live inspect mode oscilloscope rendering and diagnostic readings
  if (state.get('inspectMode')) {
    const activeObj = state.get('activeObject');
    updateLiveReadings(time, activeObj);
    drawOscilloscope(time);
  }

  requestAnimationFrame(tick);
}

// Draw a live medical oscilloscope wave on HTML5 canvas
function drawOscilloscope(time) {
  if (!inspectCtx) return;
  
  const width = inspectCanvas.clientWidth;
  const height = inspectCanvas.clientHeight;
  if (inspectCanvas.width !== width || inspectCanvas.height !== height) {
    inspectCanvas.width = width;
    inspectCanvas.height = height;
  }
  
  inspectCtx.clearRect(0, 0, width, height);
  
  // Grid Lines
  inspectCtx.strokeStyle = 'rgba(220, 180, 76, 0.05)';
  inspectCtx.lineWidth = 1;
  for (let y = 10; y < height; y += 15) {
    inspectCtx.beginPath();
    inspectCtx.moveTo(0, y);
    inspectCtx.lineTo(width, y);
    inspectCtx.stroke();
  }
  for (let x = 10; x < width; x += 20) {
    inspectCtx.beginPath();
    inspectCtx.moveTo(x, 0);
    inspectCtx.lineTo(x, height);
    inspectCtx.stroke();
  }
  
  // Glowing Bio-electrical Wave
  inspectCtx.strokeStyle = '#dcb44c';
  inspectCtx.shadowColor = '#dcb44c';
  inspectCtx.shadowBlur = 6;
  inspectCtx.lineWidth = 1.5;
  inspectCtx.beginPath();
  
  const centerY = height / 2;
  for (let x = 0; x < width; x++) {
    const angle1 = (x * 0.028) + (time * 6.0);
    const angle2 = (x * 0.065) - (time * 4.0);
    const noise = (Math.sin(x * 0.15 + time * 12.0) * 1.5) * (Math.random() * 0.2 + 0.9);
    
    const wave = Math.sin(angle1) * 12.0 + Math.cos(angle2) * 6.0 + noise;
    const y = centerY + wave;
    
    if (x === 0) {
      inspectCtx.moveTo(x, y);
    } else {
      inspectCtx.lineTo(x, y);
    }
  }
  inspectCtx.stroke();
  inspectCtx.shadowBlur = 0;
}

// Flicker values dynamically to look like real active sensors
function updateLiveReadings(time, activeObject) {
  if (!activeObject) return;
  
  const stateValEl = document.getElementById('inspect-object-state');
  
  if (activeObject.name === 'quantum_core') {
    const freq = (8.4 + Math.sin(time * 6.0) * 0.022 + (Math.random() - 0.5) * 0.005).toFixed(4);
    const coherence = (98.4 + Math.cos(time * 3.5) * 0.14 + (Math.random() - 0.5) * 0.04).toFixed(3);
    inspectRough.textContent = `${freq} GHz FREQ`;
    inspectTrans.textContent = `${coherence}% SYNC`;
    
    const stateCycle = Math.sin(time * 2.0);
    inspectLabel.textContent = 'IMPLANT // CEREBRAL_NEXUS_NODE';
    if (stateValEl) {
      stateValEl.textContent = stateCycle > 0.88 ? 'CALIBRATING' : 'NOMINAL';
      stateValEl.style.color = stateCycle > 0.88 ? '#ff9f0a' : '#30d158';
    }
  } else if (activeObject.name === 'kinetic_torus') {
    const flux = (4.2 + Math.sin(time * 5.0) * 0.045 + (Math.random() - 0.5) * 0.01).toFixed(3);
    const latency = (0.04 + Math.cos(time * 7.0) * 0.0025 + (Math.random() - 0.5) * 0.0004).toFixed(5);
    inspectRough.textContent = `${flux} TESLA FLUX`;
    inspectTrans.textContent = `${latency} ms LATENCY`;
    
    const stateCycle = Math.sin(time * 1.5);
    inspectLabel.textContent = 'INSTRUMENT // CORTICAL_CALIBRATION_ENGINE';
    if (stateValEl) {
      stateValEl.textContent = stateCycle > 0.8 ? 'ADJUSTING' : 'CALIBRATED';
      stateValEl.style.color = stateCycle > 0.8 ? '#ff9f0a' : '#30d158';
    }
  }
}

// Initialize on DOM loaded
window.addEventListener('DOMContentLoaded', init);
