/**
 * Three.js Interactive 3D Medical Scene for CareWell Hospital Hero Section
 * Renders an illuminated, rotating 3D DNA Double Helix and floating nanoparticle field
 * with responsive mouse-parallax tracking and smooth 60 FPS animation.
 */

let scene, camera, renderer, animationFrameId;
let dnaGroup, particlesGroup, ringsGroup;
let mouseX = 0, mouseY = 0;
let targetRotationX = 0, targetRotationY = 0;
let resizeHandler = null, mouseMoveHandler = null;

export function initThreeScene(container) {
  if (!container || typeof window.THREE === 'undefined') {
    console.warn('Three.js not loaded or container missing');
    return;
  }

  // Clear previous canvas if any
  cleanupThreeScene();

  const width = container.clientWidth || 500;
  const height = container.clientHeight || 460;

  // 1. Scene & Camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 0, 32);

  // 2. WebGL Renderer
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = false;
  container.appendChild(renderer.domElement);

  // 3. Lighting (Medical Teal & Soft White)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
  scene.add(ambientLight);

  const primaryLight = new THREE.DirectionalLight(0x0284c7, 1.4);
  primaryLight.position.set(15, 20, 15);
  scene.add(primaryLight);

  const secondaryLight = new THREE.DirectionalLight(0x0891b2, 1.2);
  secondaryLight.position.set(-15, -10, 10);
  scene.add(secondaryLight);

  const pointGlow = new THREE.PointLight(0x38bdf8, 1.8, 40);
  pointGlow.position.set(0, 0, 12);
  scene.add(pointGlow);

  // 4. Build 3D DNA Double Helix
  dnaGroup = new THREE.Group();
  
  const numBasePairs = 28;
  const helixRadius = 3.8;
  const helixHeight = 18;
  const strandTurns = 2.4;

  const sphereGeometry = new THREE.SphereGeometry(0.38, 16, 16);
  const barGeometry = new THREE.CylinderGeometry(0.09, 0.09, 1, 12);

  const strandMatA = new THREE.MeshPhongMaterial({
    color: 0x0284c7,
    emissive: 0x0369a1,
    shininess: 90,
    specular: 0xffffff
  });

  const strandMatB = new THREE.MeshPhongMaterial({
    color: 0x0891b2,
    emissive: 0x0e7490,
    shininess: 90,
    specular: 0xffffff
  });

  const barMat = new THREE.MeshPhongMaterial({
    color: 0xbae6fd,
    transparent: true,
    opacity: 0.85,
    shininess: 60
  });

  for (let i = 0; i < numBasePairs; i++) {
    const t = i / numBasePairs;
    const y = (t - 0.5) * helixHeight;
    const angle = t * Math.PI * 2 * strandTurns;

    const x1 = Math.cos(angle) * helixRadius;
    const z1 = Math.sin(angle) * helixRadius;

    const x2 = Math.cos(angle + Math.PI) * helixRadius;
    const z2 = Math.sin(angle + Math.PI) * helixRadius;

    // Node Sphere 1
    const sphere1 = new THREE.Mesh(sphereGeometry, strandMatA);
    sphere1.position.set(x1, y, z1);
    dnaGroup.add(sphere1);

    // Node Sphere 2
    const sphere2 = new THREE.Mesh(sphereGeometry, strandMatB);
    sphere2.position.set(x2, y, z2);
    dnaGroup.add(sphere2);

    // Connecting Bar
    const bar = new THREE.Mesh(barGeometry, barMat);
    const p1 = new THREE.Vector3(x1, y, z1);
    const p2 = new THREE.Vector3(x2, y, z2);
    const dist = p1.distanceTo(p2);

    bar.scale.set(1, dist, 1);
    bar.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
    bar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
    dnaGroup.add(bar);
  }

  dnaGroup.rotation.z = 0.25;
  scene.add(dnaGroup);

  // 5. Bio-Waveform Outer Rings
  ringsGroup = new THREE.Group();
  const ringGeo = new THREE.TorusGeometry(6.2, 0.08, 16, 80);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 });

  const ring1 = new THREE.Mesh(ringGeo, ringMat);
  ring1.rotation.x = Math.PI / 2.3;
  ringsGroup.add(ring1);

  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(7.4, 0.06, 16, 80), new THREE.MeshBasicMaterial({ color: 0x0891b2, transparent: true, opacity: 0.25 }));
  ring2.rotation.y = Math.PI / 3;
  ring2.rotation.x = Math.PI / 4;
  ringsGroup.add(ring2);

  scene.add(ringsGroup);

  // 6. Floating Nanoparticles Field
  particlesGroup = new THREE.Group();
  const particleCount = 120;
  const particleGeo = new THREE.SphereGeometry(0.12, 8, 8);
  const particleMat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.65 });

  for (let i = 0; i < particleCount; i++) {
    const particle = new THREE.Mesh(particleGeo, particleMat);
    particle.position.set(
      (Math.random() - 0.5) * 26,
      (Math.random() - 0.5) * 24,
      (Math.random() - 0.5) * 18
    );
    particle.userData = {
      speedY: 0.005 + Math.random() * 0.015,
      speedRot: (Math.random() - 0.5) * 0.02
    };
    particlesGroup.add(particle);
  }
  scene.add(particlesGroup);

  // 7. Mouse Parallax Events
  mouseMoveHandler = (e) => {
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX = x * 2;
    mouseY = y * 2;
  };
  window.addEventListener('mousemove', mouseMoveHandler);

  // 8. Responsive Viewport Resize
  resizeHandler = () => {
    if (!container || !renderer || !camera) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', resizeHandler);

  // 9. Animation Render Loop (60 FPS)
  function animate() {
    animationFrameId = requestAnimationFrame(animate);

    // Continuous DNA Rotation
    if (dnaGroup) {
      dnaGroup.rotation.y += 0.009;
    }

    // Outer Energy Rings Rotation
    if (ringsGroup) {
      ringsGroup.rotation.z += 0.004;
      ringsGroup.rotation.x += 0.003;
    }

    // Float particles
    if (particlesGroup) {
      particlesGroup.children.forEach(p => {
        p.position.y += p.userData.speedY;
        if (p.position.y > 14) p.position.y = -14;
      });
    }

    // Smooth Mouse Parallax Lerp
    targetRotationY += (mouseX * 0.4 - targetRotationY) * 0.05;
    targetRotationX += (-mouseY * 0.3 - targetRotationX) * 0.05;

    if (dnaGroup) {
      dnaGroup.rotation.x = targetRotationX;
      dnaGroup.position.x = mouseX * 0.8;
      dnaGroup.position.y = -mouseY * 0.8;
    }

    renderer.render(scene, camera);
  }

  animate();
}

export function cleanupThreeScene() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (mouseMoveHandler) {
    window.removeEventListener('mousemove', mouseMoveHandler);
    mouseMoveHandler = null;
  }
  if (resizeHandler) {
    window.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
  }
  if (renderer && renderer.domElement && renderer.domElement.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement);
    renderer.dispose();
  }
  scene = null;
  camera = null;
  renderer = null;
}
