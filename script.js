const canvas = document.querySelector('#bg');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// skyline buildings
for (let i = 0; i < 120; i++) {
  const height = Math.random() * 20 + 2;

  const geometry = new THREE.BoxGeometry(1, height, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x0ea5e9 });

  const building = new THREE.Mesh(geometry, material);

  building.position.x = (Math.random() - 0.5) * 60;
  building.position.y = height / 2 - 10;
  building.position.z = (Math.random() - 0.5) * 60;

  scene.add(building);
}

function animate() {
  requestAnimationFrame(animate);
  scene.rotation.y += 0.001;
  renderer.render(scene, camera);
}

animate();

