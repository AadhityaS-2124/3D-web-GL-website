import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';
import { state } from './state.js';

// Custom Post-Processing Shader for Cinematic Polish:
// Vignette + Chromatic Aberration (RGB shift) + Film Grain
const CustomPostShader = {
  name: 'CustomPostShader',
  uniforms: {
    tDiffuse: { value: null },
    amount: { value: 0.0018 },
    noiseAmount: { value: 0.035 },
    time: { value: 0.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float amount;
    uniform float noiseAmount;
    uniform float time;
    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      // 1. Chromatic Aberration
      vec2 rUv = vUv + vec2(amount, 0.0);
      vec2 gUv = vUv;
      vec2 bUv = vUv - vec2(amount, 0.0);
      
      float r = texture2D(tDiffuse, rUv).r;
      float g = texture2D(tDiffuse, gUv).g;
      float b = texture2D(tDiffuse, bUv).b;
      
      vec3 color = vec3(r, g, b);
      
      // 2. Film Grain
      float noise = (rand(vUv + time) - 0.5) * noiseAmount;
      color += vec3(noise);
      
      // 3. Vignette
      vec2 uvDist = vUv - 0.5;
      float vignette = smoothstep(0.85, 0.35, length(uvDist));
      color *= mix(0.35, 1.0, vignette);

      gl_FragColor = vec4(color, 1.0);
    }
  `
};

export class SceneManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.initScene();
    this.initLights();
    this.initSplinePaths();
    this.initPostProcessing();
    this.initRaycaster();
    this.initFPSCounter();

    window.addEventListener('resize', () => this.onResize());
  }

  initScene() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x08080a, 0.015);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
    this.camera.position.set(0, 1.2, 7);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false, // Turned off since we use SMAA in post-processing
      alpha: false,
      powerPreference: "high-performance",
      stencil: false,
      depth: true
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
  }

  initLights() {
    // Ambient Light
    this.ambientLight = new THREE.AmbientLight(0x0a0a0d, 0.8);
    this.scene.add(this.ambientLight);

    // Key Light (Sharp shadows)
    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    this.keyLight.position.set(12, 18, 10);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 40;
    this.keyLight.shadow.bias = -0.0005;
    this.scene.add(this.keyLight);

    // Fill Light (Sleek titanium tone)
    this.fillLight = new THREE.DirectionalLight(0x8e8e93, 0.8);
    this.fillLight.position.set(-12, -5, 5);
    this.scene.add(this.fillLight);

    // Golden Rim Glow SpotLight
    this.rimLight = new THREE.SpotLight(0xdcb44c, 8.0, 30, Math.PI / 4, 0.5, 1.0);
    this.rimLight.position.set(0, 10, -5);
    this.scene.add(this.rimLight);
  }

  initSplinePaths() {
    // Define position path of the camera through coordinate space
    this.cameraPosSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 1.2, 7.0),       // Sec 1: Hero
      new THREE.Vector3(8, -1.0, -8.0),
      new THREE.Vector3(13.2, -2.2, -13.0), // Sec 2: Lattice
      new THREE.Vector3(-8, 3.0, -26.0),
      new THREE.Vector3(-18.5, 7.8, -30.0), // Sec 3: Torus
      new THREE.Vector3(-6, 2.0, -48.0),
      new THREE.Vector3(0, 1.0, -62.0),     // Sec 4: Product Detail
      new THREE.Vector3(2, -4.0, -75.0)      // Sec 5: Epilogue/End
    ]);

    // Define target path (lookAt target points)
    this.cameraTargetSpline = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.0, 0.0),       // Sec 1 Core
      new THREE.Vector3(7.5, -2.0, -9.0),
      new THREE.Vector3(15.0, -4.0, -18.0), // Sec 2 Node Lattice
      new THREE.Vector3(-7.5, 1.0, -26.0),
      new THREE.Vector3(-15.0, 6.0, -35.0), // Sec 3 Torus Knot
      new THREE.Vector3(-7.5, 3.0, -48.0),
      new THREE.Vector3(0, 0.0, -60.0),     // Sec 4 Detail
      new THREE.Vector3(0, -6.0, -75.0)      // Sec 5 Contact
    ]);

    // Setup working vectors to avoid GC thrashing in loop
    this.currentCameraPos = new THREE.Vector3();
    this.currentCameraTarget = new THREE.Vector3();
    this.inspectCameraPos = new THREE.Vector3();
    this.inspectCameraTarget = new THREE.Vector3();
    
    this.inspectProgress = 0.0;
  }

  initPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    
    // 1. Render Pass
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // 2. Bloom Pass (emissive glows)
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.width, this.height),
      0.65, // strength
      0.45, // radius
      0.82  // threshold
    );
    this.composer.addPass(this.bloomPass);

    // 3. Custom Post Shader (Vignette + Aberration + Film Grain)
    this.customShaderPass = new ShaderPass(CustomPostShader);
    this.composer.addPass(this.customShaderPass);

    // 4. SMAA Pass for Anti-Aliasing
    this.smaaPass = new SMAAPass(this.width, this.height);
    this.composer.addPass(this.smaaPass);

    // 5. Output Color/Tone Mapping Pass
    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  initRaycaster() {
    this.raycaster = new THREE.Raycaster();
    this.mouseCoords = new THREE.Vector2();
    this.hoveredObject = null;
    this.interactiveTargets = [];
  }

  setInteractiveTargets(targets) {
    this.interactiveTargets = targets;
  }

  initFPSCounter() {
    this.frameCount = 0;
    this.lastTime = performance.now();
    this.fpsCheckInterval = 1000; // Check performance every second
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.composer.setSize(this.width, this.height);
  }

  // Updates raycasting for mouse hover effects
  updateRaycast(lerpedMouse) {
    this.mouseCoords.x = lerpedMouse.x;
    this.mouseCoords.y = lerpedMouse.y;
    this.raycaster.setFromCamera(this.mouseCoords, this.camera);

    const intersects = this.raycaster.intersectObjects(this.interactiveTargets);

    if (intersects.length > 0) {
      const hitObject = intersects[0].object;
      
      if (this.hoveredObject !== hitObject) {
        document.body.classList.add('clickable');
        
        // Trigger hover animation on the hit object group
        const group = hitObject.parent;
        
        // Hover Micro-interactions: scale up and increase emissive light
        if (group && group.scale) {
          const currentScale = group.userData.baseScale || 1.0;
          group.scale.set(currentScale * 1.12, currentScale * 1.12, currentScale * 1.12);
        }
        
        // Highlight material emission
        if (hitObject.material) {
          hitObject.userData.baseEmissive = hitObject.material.emissiveIntensity || 0.0;
          hitObject.material.emissiveIntensity = 1.0;
        }

        this.hoveredObject = hitObject;
      }
    } else {
      if (this.hoveredObject) {
        document.body.classList.remove('clickable');
        
        // Reset scale
        const group = this.hoveredObject.parent;
        if (group && group.scale) {
          const currentScale = group.userData.baseScale || 1.0;
          group.scale.set(currentScale, currentScale, currentScale);
        }

        // Reset material emission
        if (this.hoveredObject.material) {
          this.hoveredObject.material.emissiveIntensity = this.hoveredObject.userData.baseEmissive || 0;
        }

        this.hoveredObject = null;
      }
    }
  }

  // Handle clicking for Focused Inspect Mode
  handleClick() {
    if (this.hoveredObject && !state.get('inspectMode')) {
      const targetGroup = this.hoveredObject.parent;
      state.set('activeObject', targetGroup);
      state.set('inspectMode', true);

      // Define focused camera parameters relative to target object
      const objectPos = new THREE.Vector3();
      targetGroup.getWorldPosition(objectPos);

      // Camera positioned directly in front of the active model
      this.inspectCameraPos.copy(objectPos).add(new THREE.Vector3(0, 0, 3.8));
      this.inspectCameraTarget.copy(objectPos);
    }
  }

  updateFPS() {
    this.frameCount++;
    const now = performance.now();
    
    if (now >= this.lastTime + this.fpsCheckInterval) {
      const calculatedFPS = Math.round((this.frameCount * 1000) / (now - this.lastTime));
      state.set('fps', calculatedFPS);
      
      this.frameCount = 0;
      this.lastTime = now;

      // Adaptive Performance Tuning:
      // If frames drop below 45 FPS, degrade visual parameters to maintain fluid 60 FPS
      if (calculatedFPS < 45 && state.get('quality') === 'high') {
        console.warn(`Low FPS detected: ${calculatedFPS}. Scaling quality down to LOW.`);
        state.set('quality', 'low');
        
        // Downgrade rendering pipelines
        this.renderer.setPixelRatio(1.0);
        this.bloomPass.enabled = false;
        this.smaaPass.enabled = false;
        
        // Mute custom shader effects slightly
        this.customShaderPass.uniforms.noiseAmount.value = 0.01;
        this.customShaderPass.uniforms.amount.value = 0.0005;
      }
    }
  }

  render(time, scrollPercent, lerpedMouse) {
    this.updateFPS();

    // 1. Raycast Update (only when not loaded or inspecting)
    if (state.get('isLoaded') && !state.get('inspectMode')) {
      this.updateRaycast(lerpedMouse);
    }

    // 2. Camera Spline Sampling
    // Safety check and clamp scrollPercent to [0, 1] to prevent out-of-bounds sampling (e.g. from elastic bounce)
    let u = 0;
    if (typeof scrollPercent === 'number' && !isNaN(scrollPercent)) {
      u = Math.max(0, Math.min(1, scrollPercent));
    }

    // Sample camera coordinates along the Bezier spline curves
    this.cameraPosSpline.getPointAt(u, this.currentCameraPos);
    this.cameraTargetSpline.getPointAt(u, this.currentCameraTarget);

    // 3. Parallax Offset Calculation
    // Subtle rotation offset on cursor position
    const parallaxX = lerpedMouse.x * 0.45;
    const parallaxY = lerpedMouse.y * 0.45;
    
    const finalSplinePos = this.currentCameraPos.clone().add(new THREE.Vector3(parallaxX, parallaxY, 0));
    const finalSplineTarget = this.currentCameraTarget.clone().add(new THREE.Vector3(parallaxX * 0.3, parallaxY * 0.3, 0));

    // 4. Handle Inspect Mode Lerping
    const isInspecting = state.get('inspectMode');
    const targetProgress = isInspecting ? 1.0 : 0.0;
    
    // Smooth transition factor
    this.inspectProgress += (targetProgress - this.inspectProgress) * 0.06;

    // Blend standard spline path with focused close-up coordinates
    const blendedPos = new THREE.Vector3().lerpVectors(finalSplinePos, this.inspectCameraPos, this.inspectProgress);
    const blendedTarget = new THREE.Vector3().lerpVectors(finalSplineTarget, this.inspectCameraTarget, this.inspectProgress);

    this.camera.position.copy(blendedPos);
    this.camera.lookAt(blendedTarget);

    // 5. Run shader uniforms & render
    if (this.customShaderPass && this.customShaderPass.enabled) {
      this.customShaderPass.uniforms.time.value = time;
    }

    // Render loop via EffectComposer passes
    this.composer.render();
  }
}
