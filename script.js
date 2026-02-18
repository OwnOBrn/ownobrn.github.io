import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

const canvas = document.getElementById('bg');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);

camera.position.set(-160, 22, 200);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

scene.fog = new THREE.FogExp2(0x02040a, 0.01);
renderer.setClearColor(0x02040a, 1);

scene.add(new THREE.AmbientLight(0x6fbaff, 0.25));

const moon = new THREE.DirectionalLight(0xbfe7ff, 0.9);
moon.position.set(220, 240, 140);
scene.add(moon);

const waterMat = new THREE.MeshStandardMaterial({
  color: 0x020b22,
  roughness: 0.25,
  metalness: 0.35
});

const islandMat = new THREE.MeshStandardMaterial({
  color: 0x020617,
  roughness: 1
});

const buildingMat = new THREE.MeshStandardMaterial({
  color: 0x0ea5e9,
  roughness: 0.55,
  metalness: 0.25,
  emissive: 0x04121f,
  emissiveIntensity: 0.8
});

// water
const waterGeo = new THREE.PlaneGeometry(900, 900);

[-220, 220].forEach(x => {
  const w = new THREE.Mesh(waterGeo, waterMat);
  w.rotation.x = -Math.PI / 2;
  w.position.set(x, -24, 0);
  scene.add(w);
});

// island
const island = new THREE.Mesh(
  new THREE.PlaneGeometry(210, 760),
  islandMat
);
island.rotation.x = -Math.PI / 2;
island.position.set(0, -24, 0);
scene.add(island);

// skyline
function peak(z, c, s) {
  return Math.exp(-((z - c) ** 2) / (2 * s ** 2));
}

for (let i = 0; i < 900; i++) {
  const z = (Math.random() - 0.5) * 700;
  const x = (Math.random() - 0.5) * 80;

  if (Math.abs(z - 260) < 80 && Math.abs(x) < 40 && Math.random() < 0.8)
    continue;

  const h = Math.min(
    10 + 55 * peak(z, 140, 95) +
    70 * peak(z, -260, 75) +
    Math.random() * 12,
    140
  );

  const w = 1.2 + Math.random() * 2.6;
  const d = 1.2 + Math.random() * 2.6;

  const box = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    buildingMat
  );

  box.position.set(x, -24 + h / 2, z);
  scene.add(box);
}

// iconic towers
function tower(x, z, w, d, h) {
  const t = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    buildingMat
  );
  t.position.set(x, -24 + h / 2, z);
  scene.add(t);
}

tower(0, -270, 8, 8, 150);
tower(-12, 135, 6.3, 6.3, 125);
tower(18, 160, 5, 5, 110);

// animation
function animate() {
  requestAnimationFrame(animate);
  scene.rotation.y += 0.0009;
  camera.lookAt(0, 8, 0);
  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});



