/**
 * ThreeBioHologram Component
 * Real-time interactive 3D Patient Bio-Monitor for the Doctor Dashboard.
 * Dynamically visualizes clinical severity, heart rate, and patient status
 * via an illuminated, pulsing anatomical bio-core with dynamic telemetry particles.
 */

let bioScene = null;
let bioCamera = null;
let bioRenderer = null;
let bioAnimFrameId = null;
let bioCoreMesh = null;
let bioInnerMesh = null;
let bioRingsGroup = null;
let bioParticles = null;
let bioLight = null;
let mouseX = 0;
let mouseY = 0;
let isHovered = false;

export function initBioHologram(container, patient) {
  if (!container || typeof window.THREE === 'undefined') return;

  cleanupBioHologram();

  const width = container.clientWidth || 240;
  const height = container.clientHeight || 200;

  // 1. Scene & Camera
  bioScene = new THREE.Scene();
  bioCamera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
  bioCamera.position.set(0, 0, 10);

  // 2. WebGL Renderer
  bioRenderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  bioRenderer.setSize(width, height);
  bioRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  container.appendChild(bioRenderer.domElement);

  // 3. Color mapping based on triage band
  const bandId = patient?.band?.id || 'routine';
  let primaryColor = 0x0ea5e9;
  let emissiveColor = 0x0284c7;

  if (bandId === 'critical') {
    primaryColor = 0xef4444;
    emissiveColor = 0xb91c1c;
  } else if (bandId === 'high') {
    primaryColor = 0xf97316;
    emissiveColor = 0xc2410c;
  } else if (bandId === 'moderate') {
    primaryColor = 0xeab308;
    emissiveColor = 0xa16207;
  } else if (bandId === 'routine') {
    primaryColor = 0x22c55e;
    emissiveColor = 0x15803d;
  } else if (bandId === 'needs_assessment') {
    primaryColor = 0xa855f7;
    emissiveColor = 0x7e22ce;
  }

  // 4. Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.8);
  bioScene.add(ambient);

  bioLight = new THREE.PointLight(primaryColor, 2.5, 20);
  bioLight.position.set(0, 0, 5);
  bioScene.add(bioLight);

  // 5. Outer Bio-Core (Icosahedron Crystal Lattice)
  const coreGeo = new THREE.IcosahedronGeometry(1.7, 1);
  const coreMat = new THREE.MeshPhongMaterial({
    color: primaryColor,
    emissive: emissiveColor,
    emissiveIntensity: 0.6,
    wireframe: true,
    transparent: true,
    opacity: 0.85
  });
  bioCoreMesh = new THREE.Mesh(coreGeo, coreMat);
  bioScene.add(bioCoreMesh);

  // 6. Inner Glowing Nucleus
  const innerGeo = new THREE.SphereGeometry(0.85, 16, 16);
  const innerMat = new THREE.MeshStandardMaterial({
    color: primaryColor,
    emissive: primaryColor,
    emissiveIntensity: 0.8,
    roughness: 0.2,
    metalness: 0.8
  });
  bioInnerMesh = new THREE.Mesh(innerGeo, innerMat);
  bioScene.add(bioInnerMesh);

  // 7. Telemetry Orbit Rings
  bioRingsGroup = new THREE.Group();
  const ringMat = new THREE.MeshBasicMaterial({
    color: primaryColor,
    transparent: true,
    opacity: 0.4
  });

  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.03, 8, 48), ringMat);
  ring1.rotation.x = Math.PI / 3;
  bioRingsGroup.add(ring1);

  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.0, 0.02, 8, 48), ringMat);
  ring2.rotation.y = Math.PI / 2.5;
  ring2.rotation.z = Math.PI / 4;
  bioRingsGroup.add(ring2);

  bioScene.add(bioRingsGroup);

  // 8. Orbital Particles (30 particles)
  const pCount = 30;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(pCount * 3);

  for (let i = 0; i < pCount; i++) {
    const angle = (i / pCount) * Math.PI * 2;
    const radius = 2.4 + Math.random() * 1.2;
    pPos[i * 3] = Math.cos(angle) * radius;
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 2;
    pPos[i * 3 + 2] = Math.sin(angle) * radius;
  }

  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({
    color: primaryColor,
    size: 0.14,
    transparent: true,
    opacity: 0.85
  });
  bioParticles = new THREE.Points(pGeo, pMat);
  bioScene.add(bioParticles);

  // 9. Heart Rate Synchronization
  const hr = Number(patient?.vitals?.heart_rate) || (bandId === 'critical' ? 120 : 75);
  const pulseSpeed = (hr / 60) * Math.PI * 2; // Radians per second matching HR bpm

  // 10. Mouse interaction
  const onMouseMove = (e) => {
    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  };

  container.addEventListener('mousemove', onMouseMove, { passive: true });
  container.addEventListener('mouseenter', () => { isHovered = true; });
  container.addEventListener('mouseleave', () => {
    isHovered = false;
    mouseX = 0;
    mouseY = 0;
  });

  // 11. Render loop
  let clock = new THREE.Clock();

  function animate() {
    bioAnimFrameId = requestAnimationFrame(animate);
    if (!bioRenderer || !bioScene || !bioCamera) return;

    const elapsedTime = clock.getElapsedTime();

    // Rhythmic vital heartbeat pulse
    const pulseFactor = 1 + 0.12 * Math.sin(elapsedTime * pulseSpeed);
    if (bioCoreMesh) {
      bioCoreMesh.scale.set(pulseFactor, pulseFactor, pulseFactor);
      bioCoreMesh.rotation.y += 0.012;
      bioCoreMesh.rotation.x += 0.007;

      // Mouse tilt parallax
      bioCoreMesh.rotation.y += (mouseX * 0.5 - bioCoreMesh.rotation.y) * 0.05;
      bioCoreMesh.rotation.x += (-mouseY * 0.5 - bioCoreMesh.rotation.x) * 0.05;
    }

    if (bioInnerMesh) {
      const innerPulse = 1 + 0.18 * Math.sin(elapsedTime * pulseSpeed * 2);
      bioInnerMesh.scale.set(innerPulse, innerPulse, innerPulse);
    }

    if (bioRingsGroup) {
      bioRingsGroup.rotation.z += 0.008;
      bioRingsGroup.rotation.x += 0.005;
    }

    if (bioParticles) {
      bioParticles.rotation.y += 0.006;
    }

    bioRenderer.render(bioScene, bioCamera);
  }

  animate();
}

export function cleanupBioHologram() {
  if (bioAnimFrameId) {
    cancelAnimationFrame(bioAnimFrameId);
    bioAnimFrameId = null;
  }

  if (bioRenderer) {
    if (bioRenderer.domElement && bioRenderer.domElement.parentNode) {
      bioRenderer.domElement.parentNode.removeChild(bioRenderer.domElement);
    }
    bioRenderer.dispose();
    bioRenderer = null;
  }

  bioScene = null;
  bioCamera = null;
  bioCoreMesh = null;
  bioInnerMesh = null;
  bioRingsGroup = null;
  bioParticles = null;
  bioLight = null;
}
