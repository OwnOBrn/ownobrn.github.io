const canvas = document.querySelector('#bg');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.set(0, 10, 55);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

scene.fog = new THREE.FogExp2(0x00040f, 0.02);

const ambient = new THREE.AmbientLight(0x66ccff, 0.25);
scene.add(ambient);

const key = new THREE.DirectionalLight(0x38bdf8, 0.9);
key.position.set(40, 60, 30);
scene.add(key);

const groundGeo = new THREE.PlaneGeometry(400, 400);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 1 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -12;
scene.add(ground);

const mat = new THREE.MeshStandardMaterial({
  color: 0x0ea5e9,
  emissive: 0x02131f,
  roughness: 0.6,
  metalness: 0.2
});

for (let i = 0; i < 220; i++) {
  const w = Math.random() * 1.4 + 0.6;
  const d = Math.random() * 1.4 + 0.6;
  const h = Math.random() * 26 + 3;

  const geo = new THREE.BoxGeometry(w, h, d);
  const b = new THREE.Mesh(geo, mat);

  const r = (Math.random() ** 0.55) * 85;
  const a = Math.random() * Math.PI * 2;

  b.position.x = Math.cos(a) * r;
  b.position.z = Math.sin(a) * r;
  b.position.y = h / 2 - 12;

  scene.add(b);
}

let mx = 0, my = 0;
window.addEventListener('mousemove', (e) => {
  mx = (e.clientX / window.innerWidth) * 2 - 1;
  my = (e.clientY / window.innerHeight) * 2 - 1;
});

function animate() {
  requestAnimationFrame(animate);
  scene.rotation.y += 0.0012;

  camera.position.x += (mx * 6 - camera.position.x) * 0.02;
  camera.position.y += (10 + (-my) * 2 - camera.position.y) * 0.02;

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

