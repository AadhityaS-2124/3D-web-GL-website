import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Helper to generate a soft circular texture programmatically
function createParticleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.5)');
  gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.08)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  
  return new THREE.CanvasTexture(canvas);
}

// 1. Particle Field / Dust Motes
function createParticleField() {
  const count = 2000;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const randoms = new Float32Array(count * 3); // For individual motion offsets

  for (let i = 0; i < count * 3; i += 3) {
    // Spread particles in a large cube
    positions[i] = (Math.random() - 0.5) * 80;
    positions[i + 1] = (Math.random() - 0.5) * 80;
    positions[i + 2] = (Math.random() - 0.5) * 80;

    randoms[i] = Math.random();
    randoms[i + 1] = Math.random();
    randoms[i + 2] = Math.random();
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('randoms', new THREE.BufferAttribute(randoms, 3));

  const material = new THREE.PointsMaterial({
    color: 0xdcb44c, // Warm gold particles
    size: 0.15,
    transparent: true,
    opacity: 0.6,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    map: createParticleTexture(),
  });

  return new THREE.Points(geometry, material);
}

// 2. Undulating Topological Background Grid
function createBackgroundGrid() {
  const width = 100;
  const height = 100;
  const segments = 40;
  const geometry = new THREE.PlaneGeometry(width, height, segments, segments);
  
  // Rotate to lie flat
  geometry.rotateX(-Math.PI / 2);
  
  // Custom properties for vertex animation in update loop
  const positionAttribute = geometry.attributes.position;
  const initialY = new Float32Array(positionAttribute.count);
  for (let i = 0; i < positionAttribute.count; i++) {
    initialY[i] = positionAttribute.getY(i);
  }
  geometry.userData = { initialY };

  const material = new THREE.MeshStandardMaterial({
    color: 0x1f2023, // Muted gray wireframe
    wireframe: true,
    transparent: true,
    opacity: 0.18,
    roughness: 0.9,
    metalness: 0.1
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = -10;
  return mesh;
}

// 3. Section 1 Asset: The Quantum Core
function createQuantumCore() {
  const group = new THREE.Group();
  group.name = "quantum_core";

  // Inner Core (Pulsing Emissive Gold)
  const coreGeom = new THREE.IcosahedronGeometry(1.0, 1);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xdcb44c,
    emissive: 0xff9f0a,
    emissiveIntensity: 0.8,
    metalness: 0.9,
    roughness: 0.1,
  });
  const innerCore = new THREE.Mesh(coreGeom, coreMat);
  innerCore.name = "inner_core";
  group.add(innerCore);

  // Middle Glass Shell (Refractive Physical Material)
  const glassGeom = new THREE.IcosahedronGeometry(1.6, 2);
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.4,
    metalness: 0.1,
    roughness: 0.15,
    transmission: 0.9, // Glass transparency
    ior: 1.5, // Index of refraction
    thickness: 1.2, // Refraction thickness
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });
  const glassShell = new THREE.Mesh(glassGeom, glassMat);
  glassShell.name = "glass_shell";
  group.add(glassShell);

  // Outer Orbital Rings (Gold Wireframe/Toruses)
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xdcb44c,
    metalness: 1.0,
    roughness: 0.25,
  });

  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.1, 0.025, 8, 64), ringMat);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.025, 8, 64), ringMat);
  const ring3 = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.025, 8, 64), ringMat);

  ring1.rotation.x = Math.PI / 3;
  ring2.rotation.y = Math.PI / 4;
  ring3.rotation.z = Math.PI / 6;

  ring1.name = "ring1";
  ring2.name = "ring2";
  ring3.name = "ring3";

  group.add(ring1, ring2, ring3);

  // Embedded Point Light (Orange-Gold)
  const coreLight = new THREE.PointLight(0xff9f0a, 8, 15);
  coreLight.castShadow = true;
  coreLight.shadow.bias = -0.002;
  coreLight.name = "light";
  group.add(coreLight);

  return group;
}

// 4. Section 2 Asset: Neural Lattice
function createNeuralLattice() {
  const group = new THREE.Group();
  group.name = "neural_lattice";

  const nodeCount = 30;
  const nodes = [];
  const radius = 2.8;

  // Materials
  const nodeMat = new THREE.MeshStandardMaterial({
    color: 0x8e8e93, // Muted titanium
    metalness: 0.85,
    roughness: 0.2,
  });
  
  const activeNodeMat = new THREE.MeshStandardMaterial({
    color: 0xdcb44c,
    emissive: 0xdcb44c,
    emissiveIntensity: 0.4,
    metalness: 0.9,
    roughness: 0.1,
  });

  // Create nodes randomly distributed in a sphere
  for (let i = 0; i < nodeCount; i++) {
    const geom = new THREE.DodecahedronGeometry(0.12 + Math.random() * 0.08, 0);
    const mesh = new THREE.Mesh(geom, i % 6 === 0 ? activeNodeMat : nodeMat);

    // Spherical coordinates distribution
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = radius * (0.3 + 0.7 * Math.random());

    mesh.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );

    // Save velocity and offset for animation
    mesh.userData = {
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.005
      ),
      initialPos: mesh.position.clone(),
      pulseSpeed: 1 + Math.random() * 2,
      pulseOffset: Math.random() * Math.PI
    };

    group.add(mesh);
    nodes.push(mesh);
  }

  // Create connections (lines between nearby nodes)
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x545456,
    transparent: true,
    opacity: 0.4
  });

  const lineGeometry = new THREE.BufferGeometry();
  const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
  lineMesh.name = "lattice_lines";
  group.add(lineMesh);

  // Expose nodes array for loop updates
  group.userData = { nodes, lineMesh, maxDistance: 2.0 };

  return group;
}

// Helper to update connection lines in the lattice
function updateLatticeLines(latticeGroup) {
  const { nodes, lineMesh, maxDistance } = latticeGroup.userData;
  const positions = [];
  
  for (let i = 0; i < nodes.length; i++) {
    const nodeA = nodes[i];
    for (let j = i + 1; j < nodes.length; j++) {
      const nodeB = nodes[j];
      const dist = nodeA.position.distanceTo(nodeB.position);
      if (dist < maxDistance) {
        positions.push(
          nodeA.position.x, nodeA.position.y, nodeA.position.z,
          nodeB.position.x, nodeB.position.y, nodeB.position.z
        );
      }
    }
  }

  lineMesh.geometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  );
  lineMesh.geometry.attributes.position.needsUpdate = true;
}

// 5. Section 3 Asset: Kinetic Torus / Ring
function createKineticTorus() {
  const group = new THREE.Group();
  group.name = "kinetic_torus";

  // Central Torus Knot (Titanium Charcoal Clearcoat PBR)
  const torusGeom = new THREE.TorusKnotGeometry(1.2, 0.32, 100, 16, 2, 3);
  const torusMat = new THREE.MeshPhysicalMaterial({
    color: 0x121214, // Deep obsidian / titanium
    metalness: 0.95,
    roughness: 0.12,
    clearcoat: 1.0,
    clearcoatRoughness: 0.08,
    reflectivity: 1.0
  });
  const mainTorus = new THREE.Mesh(torusGeom, torusMat);
  mainTorus.name = "torus_knot";
  group.add(mainTorus);

  // Outer Flat Disc / Rings
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xdcb44c,
    metalness: 0.9,
    roughness: 0.2,
    side: THREE.DoubleSide
  });

  const discGeom1 = new THREE.RingGeometry(2.0, 2.05, 64);
  const disc1 = new THREE.Mesh(discGeom1, ringMat);
  disc1.rotation.x = Math.PI / 2;
  disc1.name = "disc1";
  group.add(disc1);

  const discGeom2 = new THREE.RingGeometry(2.3, 2.32, 64);
  const disc2 = new THREE.Mesh(discGeom2, ringMat);
  disc2.rotation.y = Math.PI / 2;
  disc2.name = "disc2";
  group.add(disc2);

  // Orbital satellites
  const satGroup = new THREE.Group();
  satGroup.name = "satellites";
  const satCount = 4;
  const satellites = [];

  const satMat = new THREE.MeshStandardMaterial({
    color: 0xff9f0a,
    emissive: 0xff9f0a,
    emissiveIntensity: 0.5,
    metalness: 0.8,
    roughness: 0.2
  });

  for (let i = 0; i < satCount; i++) {
    const satMesh = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), satMat);
    satGroup.add(satMesh);
    satellites.push(satMesh);
  }
  group.add(satGroup);
  group.userData = { satellites };

  return group;
}

// Master Creator function
export function create3DObjects(scene) {
  // Add particles & background grid
  const particles = createParticleField();
  const bgGrid = createBackgroundGrid();
  
  scene.add(particles);
  scene.add(bgGrid);

  // Create core section anchors
  const quantumCore = createQuantumCore();
  const neuralLattice = createNeuralLattice();
  const kineticTorus = createKineticTorus();

  // Position anchors spaced out in 3D coordinate space.
  // Section 1: Hero (Center)
  quantumCore.position.set(0, 0, 0);
  
  // Section 2: Synapse (Offset)
  neuralLattice.position.set(15, -4, -18);
  
  // Section 3: Kinetics (Offset)
  kineticTorus.position.set(-15, 6, -35);

  // Add them to the scene
  scene.add(quantumCore);
  scene.add(neuralLattice);
  scene.add(kineticTorus);

  // Return object references for updating and raycasting
  return {
    particles,
    bgGrid,
    quantumCore,
    neuralLattice,
    kineticTorus,
    interactiveTargets: [
      quantumCore.getObjectByName("glass_shell"),
      kineticTorus.getObjectByName("torus_knot")
    ]
  };
}

// 6. Hook for External GLTF Model Loading
export class ModelLoader {
  constructor(loadingManager) {
    this.loader = new GLTFLoader(loadingManager);
  }

  /**
   * Load an external model, attach PBR materials and replace placeholder
   * @param {string} url - URL path to the model
   * @param {THREE.Group} targetGroup - Scene group or placeholder object to replace
   * @param {function} onComplete - Callback once finished
   */
  loadModel(url, targetGroup, onComplete) {
    this.loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;

        // Traverse model to apply PBR shadow maps, metalness and roughness tuning
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Premium PBR material upgrades
            if (child.material) {
              child.material.roughness = Math.max(child.material.roughness, 0.15);
              child.material.metalness = Math.max(child.material.metalness, 0.8);
              child.material.envMapIntensity = 1.5;
            }
          }
        });

        // Clear existing placeholder meshes in the target group, except lights
        const placeholdersToRemove = [];
        targetGroup.children.forEach(child => {
          if (!child.isLight && child.name !== "light") {
            placeholdersToRemove.push(child);
          }
        });
        placeholdersToRemove.forEach(child => targetGroup.remove(child));

        // Add the loaded model into the group coordinates
        targetGroup.add(model);

        if (onComplete) onComplete(model);
      },
      (xhr) => {
        // Log loading progress
        if (xhr.lengthComputable) {
          const percent = Math.round((xhr.loaded / xhr.total) * 100);
          console.log(`GLTF Loading Progress: ${percent}%`);
        }
      },
      (error) => {
        console.error('An error occurred loading the GLTF asset:', error);
      }
    );
  }
}

// Frame animations for standard meshes
export function updateObjects(objects, time, mouse) {
  const { particles, bgGrid, quantumCore, neuralLattice, kineticTorus } = objects;

  // 1. Particle field drift
  const pPos = particles.geometry.attributes.position.array;
  const pRands = particles.geometry.attributes.randoms.array;
  const count = pPos.length;
  
  for (let i = 0; i < count; i += 3) {
    // Drifts based on mouse parallax and time offsets
    const rIndex = i;
    pPos[i] += Math.sin(time * 0.1 + pRands[rIndex] * 100) * 0.005 + mouse.x * 0.002;
    pPos[i + 1] += Math.cos(time * 0.1 + pRands[rIndex + 1] * 100) * 0.005 + mouse.y * 0.002;
  }
  particles.geometry.attributes.position.needsUpdate = true;
  particles.rotation.y = time * 0.015;

  // 2. Background Grid undulation
  const gridPos = bgGrid.geometry.attributes.position;
  const initialY = bgGrid.geometry.userData.initialY;
  
  for (let i = 0; i < gridPos.count; i++) {
    const x = gridPos.getX(i);
    const z = gridPos.getZ(i);
    // Dynamic wave equation driven by time and distance from center
    const dist = Math.sqrt(x * x + z * z);
    const wave = Math.sin(dist * 0.18 - time * 1.5) * 0.45 * Math.cos(x * 0.05);
    
    // Add mouse hover tilt
    const mouseInfluence = (mouse.x * x - mouse.y * z) * 0.02;
    
    gridPos.setY(i, initialY[i] + wave + mouseInfluence);
  }
  bgGrid.geometry.attributes.position.needsUpdate = true;

  // 3. Quantum Core animations
  if (quantumCore) {
    quantumCore.rotation.y = time * 0.15;
    quantumCore.rotation.x = time * 0.08;
    
    const innerCore = quantumCore.getObjectByName("inner_core");
    const glassShell = quantumCore.getObjectByName("glass_shell");
    const ring1 = quantumCore.getObjectByName("ring1");
    const ring2 = quantumCore.getObjectByName("ring2");
    const ring3 = quantumCore.getObjectByName("ring3");
    const light = quantumCore.getObjectByName("light");

    if (innerCore) innerCore.rotation.z = -time * 0.2;
    if (glassShell) glassShell.rotation.y = -time * 0.05;
    
    if (ring1) ring1.rotation.x += 0.005;
    if (ring2) ring2.rotation.y += 0.003;
    if (ring3) ring3.rotation.z += 0.007;

    // Pulse core light intensity and color slightly
    if (light) {
      light.intensity = 6.0 + Math.sin(time * 3.0) * 2.5;
    }
  }

  // 4. Neural Lattice animations
  if (neuralLattice) {
    const { nodes } = neuralLattice.userData;
    
    // Jitter / drift nodes
    nodes.forEach(node => {
      const uData = node.userData;
      node.position.add(uData.velocity);

      // Bounce back within bounds
      const dist = node.position.distanceTo(uData.initialPos);
      if (dist > 1.2) {
        uData.velocity.negate();
      }

      // Add delicate scale pulsing
      const pulse = 1.0 + Math.sin(time * uData.pulseSpeed + uData.pulseOffset) * 0.15;
      node.scale.set(pulse, pulse, pulse);
    });

    updateLatticeLines(neuralLattice);
    neuralLattice.rotation.y = time * 0.04;
  }

  // 5. Kinetic Torus animations
  if (kineticTorus) {
    const torusKnot = kineticTorus.getObjectByName("torus_knot");
    const disc1 = kineticTorus.getObjectByName("disc1");
    const disc2 = kineticTorus.getObjectByName("disc2");
    const { satellites } = kineticTorus.userData;

    if (torusKnot) {
      torusKnot.rotation.y = time * 0.2;
      torusKnot.rotation.z = time * 0.1;
    }

    if (disc1) disc1.rotation.z = -time * 0.15;
    if (disc2) disc2.rotation.z = time * 0.1;

    // Animate orbiting satellites
    const radius = 2.4;
    satellites.forEach((sat, idx) => {
      const angle = (time * 0.6) + (idx * (Math.PI * 2 / satellites.length));
      sat.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle * 0.5) * 0.4, // wavy orbit
        Math.sin(angle) * radius
      );
    });
  }
}
