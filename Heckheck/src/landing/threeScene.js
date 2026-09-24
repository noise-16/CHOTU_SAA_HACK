/**
 * Three.js Interactive 3D Medical Bio-Nexus Scene
 * High-performance 3D DNA helix with orbiting clinical satellite hubs,
 * electrical nerve impulses, mouse drag & parallax orbit physics,
 * theme synchronization, and zero memory leaks.
 */

let scene = null;
let camera = null;
let renderer = null;
let animationFrameId = null;
let isVisible = true;
let intersectionObserver = null;

let dnaGroup = null;
let particlesGroup = null;
let ringsGroup = null;
let shockwavesGroup = null;
let satellitesGroup = null;
let impulseParticlesGroup = null;

let strandMatA = null;
let strandMatB = null;
let barMat = null;
let ringMat1 = null;
let ringMat2 = null;
let particleMat = null;
let primaryLight = null;
let secondaryLight = null;
let pointGlow = null;
let mousePointLight = null;

let mouseX = 0;
let mouseY = 0;
let targetRotationX = 0;
let targetRotationY = 0;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let currentTheme = 'dark';
let clock = null;

export function initThreeScene(container, theme = 'dark') {
  if (!container || typeof window.THREE === 'undefined') {
    return;
  }

  cleanupThreeScene();
  currentTheme = theme;
  clock = new THREE.Clock();

  const width = container.clientWidth || 480;
  const height = container.clientHeight || 420;

  // 1. Scene & Camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
  camera.position.set(0, 0, 32);

  // 2. WebGL Renderer
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = false;
  container.appendChild(renderer.domElement);

  // 3. Lighting Setup
  const isDark = theme === 'dark';
  const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.75 : 0.95);
  scene.add(ambientLight);

  primaryLight = new THREE.DirectionalLight(isDark ? 0x00f0ff : 0x0284c7, isDark ? 1.8 : 1.3);
  primaryLight.position.set(15, 20, 15);
  scene.add(primaryLight);

  secondaryLight = new THREE.DirectionalLight(isDark ? 0x3b82f6 : 0x0891b2, isDark ? 1.4 : 1.1);
  secondaryLight.position.set(-15, -10, 10);
  scene.add(secondaryLight);

  pointGlow = new THREE.PointLight(isDark ? 0x00f0ff : 0x38bdf8, isDark ? 2.2 : 1.6, 45);
  pointGlow.position.set(0, 0, 12);
  scene.add(pointGlow);

  mousePointLight = new THREE.PointLight(isDark ? 0x00f0ff : 0x38bdf8, isDark ? 2.0 : 1.3, 25);
  mousePointLight.position.set(0, 0, 10);
  scene.add(mousePointLight);

  // 4. Materials
  strandMatA = new THREE.MeshPhongMaterial({
    color: isDark ? 0x00f0ff : 0x0284c7,
    emissive: isDark ? 0x0369a1 : 0x0284c7,
    emissiveIntensity: isDark ? 0.55 : 0.25,
    shininess: 90
  });

  strandMatB = new THREE.MeshPhongMaterial({
    color: isDark ? 0x38bdf8 : 0x0891b2,
    emissive: isDark ? 0x0e7490 : 0x0891b2,
    emissiveIntensity: isDark ? 0.55 : 0.25,
    shininess: 90
  });

  barMat = new THREE.MeshPhongMaterial({
    color: isDark ? 0x7dd3fc : 0xbae6fd,
    transparent: true,
    opacity: 0.85,
    shininess: 70
  });

  // 5. Construct 3D DNA Double Helix (24 base pairs)
  dnaGroup = new THREE.Group();
  const numBasePairs = 24;
  const helixRadius = 3.6;
  const helixHeight = 18;
  const strandTurns = 2.2;

  const sphereGeometry = new THREE.SphereGeometry(0.34, 12, 12);
  const barGeometry = new THREE.CylinderGeometry(0.08, 0.08, 1, 8);

  for (let i = 0; i < numBasePairs; i++) {
    const t = i / numBasePairs;
    const y = (t - 0.5) * helixHeight;
    const angle = t * Math.PI * 2 * strandTurns;

    const x1 = Math.cos(angle) * helixRadius;
    const z1 = Math.sin(angle) * helixRadius;

    const x2 = Math.cos(angle + Math.PI) * helixRadius;
    const z2 = Math.sin(angle + Math.PI) * helixRadius;

    const sphere1 = new THREE.Mesh(sphereGeometry, strandMatA);
    sphere1.position.set(x1, y, z1);
    dnaGroup.add(sphere1);

    const sphere2 = new THREE.Mesh(sphereGeometry, strandMatB);
    sphere2.position.set(x2, y, z2);
    dnaGroup.add(sphere2);

    const bar = new THREE.Mesh(barGeometry, barMat);
    const p1 = new THREE.Vector3(x1, y, z1);
    const p2 = new THREE.Vector3(x2, y, z2);
    const dist = p1.distanceTo(p2);

    bar.scale.set(1, dist, 1);
    bar.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
    bar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
    dnaGroup.add(bar);
  }

  dnaGroup.rotation.z = 0.2;
  scene.add(dnaGroup);

  // 6. Orbital Clinical Satellite Nodes (Cardiac, Pulmonary, Triage, Genomics)
  satellitesGroup = new THREE.Group();
  const satelliteConfigs = [
    { label: 'Cardiac', color: 0xef4444, radius: 6.5, speed: 0.015, yOffset: 3 },
    { label: 'Pulmonary', color: 0x06b6d4, radius: 7.8, speed: -0.012, yOffset: -2 },
    { label: 'Triage', color: 0xf59e0b, radius: 8.5, speed: 0.018, yOffset: 1 },
    { label: 'Genomics', color: 0x8b5cf6, radius: 6.0, speed: -0.014, yOffset: -4 }
  ];

  satelliteConfigs.forEach(cfg => {
    const nodeGeo = new THREE.SphereGeometry(0.5, 14, 14);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: cfg.color,
      emissive: cfg.color,
      emissiveIntensity: 0.7,
      roughness: 0.2,
      metalness: 0.6
    });
    const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);

    // Orbit halo around node
    const haloMat = new THREE.MeshBasicMaterial({ color: cfg.color, transparent: true, opacity: 0.35, wireframe: true });
    const haloMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.8, 1), haloMat);
    nodeMesh.add(haloMesh);

    nodeMesh.userData = {
      angle: Math.random() * Math.PI * 2,
      radius: cfg.radius,
      speed: cfg.speed,
      yOffset: cfg.yOffset
    };

    satellitesGroup.add(nodeMesh);
  });
  scene.add(satellitesGroup);

  // 7. Electrical Nerve Impulse Wave Particles
  impulseParticlesGroup = new THREE.Group();
  const impulseGeo = new THREE.SphereGeometry(0.18, 8, 8);
  const impulseMat = new THREE.MeshBasicMaterial({
    color: isDark ? 0xffffff : 0x00f0ff,
    transparent: true,
    opacity: 0.95
  });

  for (let i = 0; i < 4; i++) {
    const impulse = new THREE.Mesh(impulseGeo, impulseMat);
    impulse.userData = {
      progress: i * 0.25,
      speed: 0.008
    };
    impulseParticlesGroup.add(impulse);
  }
  dnaGroup.add(impulseParticlesGroup);

  // 8. Orbital Bio-Energy Rings
  ringsGroup = new THREE.Group();
  ringMat1 = new THREE.MeshBasicMaterial({ color: isDark ? 0x00f0ff : 0x38bdf8, transparent: true, opacity: isDark ? 0.45 : 0.3 });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(5.8, 0.06, 12, 60), ringMat1);
  ring1.rotation.x = Math.PI / 2.3;
  ringsGroup.add(ring1);

  ringMat2 = new THREE.MeshBasicMaterial({ color: isDark ? 0x38bdf8 : 0x0891b2, transparent: true, opacity: isDark ? 0.35 : 0.2 });
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(7.2, 0.05, 12, 60), ringMat2);
  ring2.rotation.y = Math.PI / 3;
  ring2.rotation.x = Math.PI / 4;
  ringsGroup.add(ring2);

  scene.add(ringsGroup);

  // 9. Shockwaves Group
  shockwavesGroup = new THREE.Group();
  scene.add(shockwavesGroup);

  // 10. Floating Nanoparticles Field (75 particles)
  particlesGroup = new THREE.Group();
  const particleCount = 75;
  const particleGeo = new THREE.SphereGeometry(0.1, 6, 6);
  particleMat = new THREE.MeshBasicMaterial({ color: isDark ? 0x38bdf8 : 0x0ea5e9, transparent: true, opacity: isDark ? 0.75 : 0.55 });

  for (let i = 0; i < particleCount; i++) {
    const particle = new THREE.Mesh(particleGeo, particleMat);
    particle.position.set(
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 26,
      (Math.random() - 0.5) * 20
    );
    particle.userData = {
      speedY: 0.008 + Math.random() * 0.014,
      rotAngle: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.012
    };
    particlesGroup.add(particle);
  }
  scene.add(particlesGroup);

  // 11. Interactive Mouse Parallax & Drag Controls
  const onMouseMove = (e) => {
    if (isDragging) {
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;
      targetRotationY += deltaX * 0.008;
      targetRotationX += deltaY * 0.008;
      previousMousePosition = { x: e.clientX, y: e.clientY };
      return;
    }

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX = Math.max(-1, Math.min(1, x * 2));
    mouseY = Math.max(-1, Math.min(1, y * 2));

    if (mousePointLight) {
      mousePointLight.position.x = mouseX * 8;
      mousePointLight.position.y = -mouseY * 8;
    }
  };

  const onMouseDown = (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  };

  const onMouseUp = () => {
    isDragging = false;
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  container.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);

  // 12. Click Shockwave Trigger
  container.addEventListener('click', (e) => {
    if (!isDragging) triggerShockwave();
  });

  // 13. Viewport Resize Handler
  let resizeTimeout = null;
  const onResize = () => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth || 480;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }, 100);
  };
  window.addEventListener('resize', onResize, { passive: true });

  // 14. IntersectionObserver
  if ('IntersectionObserver' in window) {
    intersectionObserver = new IntersectionObserver((entries) => {
      isVisible = entries[0].isIntersecting;
    }, { threshold: 0.05 });
    intersectionObserver.observe(container);
  }

  // 15. Animation Render Loop (60 FPS)
  function animate() {
    animationFrameId = requestAnimationFrame(animate);

    if (!isVisible || !renderer || !scene || !camera) return;

    // Continuous DNA Rotation
    if (dnaGroup) {
      dnaGroup.rotation.y += 0.008;
    }

    // Outer Energy Rings Rotation
    if (ringsGroup) {
      ringsGroup.rotation.z += 0.003;
      ringsGroup.rotation.x += 0.002;
    }

    // Orbit clinical satellites
    if (satellitesGroup) {
      satellitesGroup.children.forEach(sat => {
        sat.userData.angle += sat.userData.speed;
        sat.position.x = Math.cos(sat.userData.angle) * sat.userData.radius;
        sat.position.z = Math.sin(sat.userData.angle) * sat.userData.radius;
        sat.position.y = sat.userData.yOffset + Math.sin(sat.userData.angle * 2) * 0.8;
      });
    }

    // Travel electrical impulses along helix
    if (impulseParticlesGroup) {
      impulseParticlesGroup.children.forEach(p => {
        p.userData.progress = (p.userData.progress + p.userData.speed) % 1;
        const t = p.userData.progress;
        const y = (t - 0.5) * helixHeight;
        const angle = t * Math.PI * 2 * strandTurns;
        p.position.x = Math.cos(angle) * helixRadius;
        p.position.z = Math.sin(angle) * helixRadius;
        p.position.y = y;
      });
    }

    // Float nanoparticles
    if (particlesGroup) {
      const children = particlesGroup.children;
      for (let i = 0; i < children.length; i++) {
        const p = children[i];
        p.position.y += p.userData.speedY;
        p.userData.rotAngle += p.userData.rotSpeed;
        p.position.x += Math.cos(p.userData.rotAngle) * 0.004;
        if (p.position.y > 15) p.position.y = -15;
      }
    }

    // Animate shockwaves
    if (shockwavesGroup && shockwavesGroup.children.length > 0) {
      for (let i = shockwavesGroup.children.length - 1; i >= 0; i--) {
        const sw = shockwavesGroup.children[i];
        sw.scale.x += 0.05;
        sw.scale.y += 0.05;
        sw.scale.z += 0.05;
        sw.material.opacity -= 0.025;

        if (sw.material.opacity <= 0) {
          shockwavesGroup.remove(sw);
          if (sw.geometry) sw.geometry.dispose();
          if (sw.material) sw.material.dispose();
        }
      }
    }

    // Smooth Parallax Lerp
    if (!isDragging) {
      targetRotationY += (mouseX * 0.3 - targetRotationY) * 0.05;
      targetRotationX += (-mouseY * 0.2 - targetRotationX) * 0.05;
    }

    if (dnaGroup) {
      dnaGroup.rotation.x = targetRotationX;
      if (!isDragging) {
        dnaGroup.position.x = mouseX * 0.6;
        dnaGroup.position.y = -mouseY * 0.6;
      }
    }

    renderer.render(scene, camera);
  }

  animate();
}

/**
 * Trigger an interactive shockwave pulse
 */
export function triggerShockwave() {
  if (!shockwavesGroup || !scene) return;

  const isDark = currentTheme === 'dark';
  const shockwaveGeo = new THREE.TorusGeometry(3.0, 0.12, 10, 48);
  const shockwaveMat = new THREE.MeshBasicMaterial({
    color: isDark ? 0x00f0ff : 0x0284c7,
    transparent: true,
    opacity: 0.9
  });

  const shockwave = new THREE.Mesh(shockwaveGeo, shockwaveMat);
  shockwave.rotation.x = Math.PI / 2;
  shockwave.scale.set(0.2, 0.2, 0.2);
  shockwavesGroup.add(shockwave);
}

/**
 * Trigger high-energy particle burst
 */
export function triggerParticleBurst() {
  triggerShockwave();
  if (!particlesGroup) return;

  particlesGroup.children.forEach(p => {
    p.userData.speedY *= 3;
    setTimeout(() => {
      p.userData.speedY /= 3;
    }, 1500);
  });
}

/**
 * Reset 3D camera and rotation
 */
export function resetCameraView() {
  targetRotationX = 0;
  targetRotationY = 0;
  mouseX = 0;
  mouseY = 0;
  if (camera) {
    camera.position.set(0, 0, 32);
  }
}

/**
 * Live theme updates for Three.js scene (Dark / Light)
 */
export function updateThreeTheme(theme) {
  currentTheme = theme;
  const isDark = theme === 'dark';

  if (strandMatA) {
    strandMatA.color.setHex(isDark ? 0x00f0ff : 0x0284c7);
    strandMatA.emissive.setHex(isDark ? 0x0369a1 : 0x0284c7);
    strandMatA.emissiveIntensity = isDark ? 0.55 : 0.25;
  }

  if (strandMatB) {
    strandMatB.color.setHex(isDark ? 0x38bdf8 : 0x0891b2);
    strandMatB.emissive.setHex(isDark ? 0x0e7490 : 0x0891b2);
    strandMatB.emissiveIntensity = isDark ? 0.55 : 0.25;
  }

  if (barMat) {
    barMat.color.setHex(isDark ? 0x7dd3fc : 0xbae6fd);
  }

  if (ringMat1) {
    ringMat1.color.setHex(isDark ? 0x00f0ff : 0x38bdf8);
    ringMat1.opacity = isDark ? 0.45 : 0.3;
  }

  if (ringMat2) {
    ringMat2.color.setHex(isDark ? 0x38bdf8 : 0x0891b2);
    ringMat2.opacity = isDark ? 0.35 : 0.2;
  }

  if (particleMat) {
    particleMat.color.setHex(isDark ? 0x38bdf8 : 0x0ea5e9);
    particleMat.opacity = isDark ? 0.75 : 0.55;
  }
}

export function cleanupThreeScene() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (intersectionObserver) {
    intersectionObserver.disconnect();
    intersectionObserver = null;
  }

  if (renderer) {
    if (renderer.domElement && renderer.domElement.parentNode) {
      renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
    renderer.dispose();
    renderer = null;
  }

  scene = null;
  camera = null;
  dnaGroup = null;
  particlesGroup = null;
  ringsGroup = null;
  shockwavesGroup = null;
  satellitesGroup = null;
  impulseParticlesGroup = null;
}
