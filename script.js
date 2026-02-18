const canvas = document.querySelector('#bg');
const scene = new THREE.Scene();

// -------------------------
// CAMERA + RENDERER
// -------------------------
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 4000);
camera.position.set(-220, 22, 260); // start out over water

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// -------------------------
// "NYC" PARAMETERS
// -------------------------
const ISLAND_W = 210;        // narrow Manhattan strip
const ISLAND_L = 760;        // long north-south
const ISLAND_Y = -24;

const MIDTOWN_Z = 140;       // midtown cluster center
const DOWNTOWN_Z = -260;     // downtown cluster center
const CENTRAL_PARK_Z = 260;  // park-ish gap center

// -------------------------
// SCENE OBJECTS
// -------------------------
const world = new THREE.Group();
scene.add(world);

// Materials will be set by theme (day/night)
let mats = {};
let lights = {};
let theme = "night"; // "day" or "night"

// -------------------------
// HELPERS
// -------------------------
function smoothstep(a, b, x) {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

// Manhattan footprint taper: island is slightly thinner at ends
function islandHalfWidthAtZ(z) {
  const t = 1 - Math.min(1, Math.abs(z) / (ISLAND_L / 2));
  const taper = 0.70 + 0.30 * t; // thicker near center
  return (ISLAND_W / 2) * taper;
}

function randn() {
  // quick pseudo-normal
  return (Math.random() + Math.random() + Math.random() + Math.random() - 2) / 2;
}

function addBuilding(x, z, w, d, h, opts = {}) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const b = new THREE.Mesh(geo, mats.building);
  b.position.set(x, ISLAND_Y + h / 2, z);

  // silhouette edge highlight (thin "rim" plate on top)
  if (opts.crown) {
    const crownGeo = new THREE.BoxGeometry(w * 0.98, Math.max(1.2, h * 0.03), d * 0.98);
    const crown = new THREE.Mesh(crownGeo, mats.crown);
    crown.position.set(0, h / 2 - (Math.max(1.2, h * 0.03) / 2), 0);
    b.add(crown);
  }

  // spire for iconic buildings
  if (opts.spire) {
    const spireGeo = new THREE.CylinderGeometry(0.35, 0.9, opts.spire, 10);
    const spire = new THREE.Mesh(spireGeo, mats.spire);
    spire.position.set(0, h / 2 + opts.spire / 2, 0);
    b.add(spire);
  }

  world.add(b);
  return b;
}

function clearWorld() {
  // remove all children from world
  while (world.children.length) world.remove(world.children[0]);
}

// -------------------------
// THEME (DAY/NIGHT)
// -------------------------
function setTheme(which) {
  theme = which;

  // remove old lights
  Object.values(lights).forEach(l => l && scene.remove(l));
  lights = {};

  // fog + background feel
  if (theme === "day") {
    scene.fog = new THREE.FogExp2(0xf3d8b6, 0.0032); // warm haze
    renderer.setClearColor(0xf3d8b6, 1);

    mats = {
      water: new THREE.MeshStandardMaterial({ color: 0x7aa7c7, roughness: 0.25, metalness: 0.25 }),
      island: new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 1, metalness: 0 }),
      building: new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.85, metalness: 0.05 }),
      crown: new THREE.MeshStandardMaterial({ color: 0x0b1220, roughness: 0.7, metalness: 0.1 }),
      spire: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.5 }),
      stars: new THREE.PointsMaterial({ color: 0xffffff, size: 0.0, opacity: 0.0, transparent: true })
    };

    // warm sun + fill
    lights.sun = new THREE.DirectionalLight(0xffd29c, 1.2);
    lights.sun.position.set(260, 240, 160);
    scene.add(lights.sun);

    lights.fill = new THREE.DirectionalLight(0xb8d9ff, 0.45);
    lights.fill.position.set(-240, 120, -220);
    scene.add(lights.fill);

    lights.ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(lights.ambient);
  } else {
    scene.fog = new THREE.FogExp2(0x02040a, 0.012);
    renderer.setClearColor(0x02040a, 1);

    mats = {
      water: new THREE.MeshStandardMaterial({
        color: 0x020b22, roughness: 0.25, metalness: 0.35,
        emissive: 0x01040b, emissiveIntensity: 0.6
      }),
      island: new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 1, metalness: 0 }),
      building: new THREE.MeshStandardMaterial({
        color: 0x0ea5e9, roughness: 0.55, metalness: 0.25,
        emissive: 0x04121f, emissiveIntensity: 0.85
      }),
      crown: new THREE.MeshStandardMaterial({
        color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 1.4,
        roughness: 0.2, metalness: 0.4
      }),
      spire: new THREE.MeshStandardMaterial({
        color: 0xdbeafe, emissive: 0x93c5fd, emissiveIntensity: 1.0,
        roughness: 0.25, metalness: 0.6
      }),
      stars: new THREE.PointsMaterial({ color: 0x9bdcff, size: 0.95, transparent: true, opacity: 0.55 })
    };

    lights.moon = new THREE.DirectionalLight(0xbfe7ff, 0.85);
    lights.moon.position.set(220, 260, 140);
    scene.add(lights.moon);

    lights.rim = new THREE.DirectionalLight(0x38bdf8, 0.35);
    lights.rim.position.set(-260, 120, -240);
    scene.add(lights.rim);

    lights.ambient = new THREE.AmbientLight(0x6fbaff, 0.22);
    scene.add(lights.ambient);
  }
}

// Toggle day/night with "D"
window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "d") {
    setTheme(theme === "day" ? "night" : "day");
    buildCity(); // rebuild with new materials
  }
});

// -------------------------
// BUILD THE "NYC" SCENE
// -------------------------
let stars;

function buildCity() {
  clearWorld();

  // Water on both sides (Hudson + East River vibe)
  const waterGeo = new THREE.PlaneGeometry(1300, 1300);
  const waterL = new THREE.Mesh(waterGeo, mats.water);
  waterL.rotation.x = -Math.PI / 2;
  waterL.position.set(-260, ISLAND_Y, 0);
  world.add(waterL);

  const waterR = new THREE.Mesh(waterGeo, mats.water);
  waterR.rotation.x = -Math.PI / 2;
  waterR.position.set(260, ISLAND_Y, 0);
  world.add(waterR);

  // Island strip (Manhattan)
  const islandGeo = new THREE.PlaneGeometry(ISLAND_W, ISLAND_L);
  const island = new THREE.Mesh(islandGeo, mats.island);
  island.rotation.x = -Math.PI / 2;
  island.position.set(0, ISLAND_Y, 0);
  world.add(island);

  // Silhouette skyline generation:
  // - narrow x range (Manhattan)
  // - two height peaks (downtown + midtown)
  // - a gap band (Central Park-ish)
  // - high-rise density near peaks
  for (let i = 0; i < 1100; i++) {
    const z = (Math.random() - 0.5) * (ISLAND_L * 0.92);

    const halfW = islandHalfWidthAtZ(z);
    const x = randn() * (halfW * 0.55);

    // Central Park gap band
    const park = Math.abs(z - CENTRAL_PARK_Z) < 85 && Math.abs(x) < 42;
    if (park && Math.random() < 0.80) continue;

    // Height profile peaks
    const midtownBoost = Math.exp(-((z - MIDTOWN_Z) ** 2) / (2 * 95 ** 2));
    const downtownBoost = Math.exp(-((z - DOWNTOWN_Z) ** 2) / (2 * 75 ** 2));

    const base = 6 + Math.random() * 10;
    let h = base + 60 * midtownBoost + 72 * downtownBoost + Math.max(0, randn()) * 10;

    // More "silhouette" look: snap some heights into bands
    const band = Math.random();
    if (band < 0.25) h *= 0.65;
    else if (band < 0.55) h *= 0.85;
    else h *= 1.05;

    h = Math.min(h, 130);

    // footprints: mostly slender rectangles
    const w = 1.2 + Math.random() * 2.6;
    const d = 1.2 + Math.random() * 2.6;

    // crown accent occasionally
    const crown = Math.random() < 0.05;

    addBuilding(x, z, w, d, h, { crown });
  }

  // Iconic towers (stylized, not exact, but instantly "NYC-feeling")
  // One World Trade-ish: downtown, tall, spire
  addBuilding(0, DOWNTOWN_Z - 10, 8.0, 8.0, 150, { crown: true, spire: 26 });

  // Empire State-ish: midtown, stepped crown + spire
  addBuilding(-12, MIDTOWN_Z - 5, 6.3, 6.3, 125, { crown: true, spire: 16 });

  // Chrysler-ish: slightly east, thinner with taller spire
  addBuilding(20, MIDTOWN_Z + 25, 5.0, 5.0, 108, { crown: true, spire: 22 });

  // Skinny supertall vibe (432 Park-ish)
  addBuilding(38, MIDTOWN_Z + 55, 3.6, 3.6, 140, { crown: false });

  // Stars (night only)
  if (stars) world.remove(stars);
  const starsGeo = new THREE.BufferGeometry();
  const starCount = 850;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 600 * Math.random();
    const a = Math.random() * Math.PI * 2;
    starPos[i * 3 + 0] = Math.cos(a) * r;
    starPos[i * 3 + 1] = 70 + Math.random() * 260;
    starPos[i * 3 + 2] = Math.sin(a) * r;
  }
  starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  stars = new THREE.Points(starsGeo, mats.stars);
  world.add(stars);
}

// -------------------------
// CAMERA FLY-IN INTRO
// -------------------------
let startTime = performance.now();
const flyDuration = 4200; // ms

function flyIn(t) {
  const u = Math.min(1, (t - startTime) / flyDuration);
  // smooth easing
  const e = u * u * (3 - 2 * u);

  // Start over water, fly toward Manhattan, settle at a nice hero angle
  const from = new THREE.Vector3(-220, 22, 260);
  const to   = new THREE.Vector3(-35, 22, 120);

  camera.position.lerpVectors(from, to, e);
  camera.lookAt(0, 8, 0);

  return u >= 1;
}

// -------------------------
// MOUSE PARALLAX (after fly-in)
// -------------------------
let mx = 0, my = 0;
window.addEventListener('mousemove', (e) => {
  mx = (e.clientX / window.innerWidth) * 2 - 1;
  my = (e.clientY / window.innerHeight) * 2 - 1;
});

// -------------------------
// ANIMATE
// -------------------------
let finishedFly = false;

function animate(t) {
  requestAnimationFrame(animate);

  if (!finishedFly) {
    finishedFly = flyIn(t);
  } else {
    // slow cinematic pan
    world.rotation.y += 0.0009;

    // subtle parallax
    camera.position.x += (mx * 10 - camera.position.x) * 0.02;
    camera.position.y += (22 + (-my) * 2.8 - camera.position.y) * 0.02;
    camera.lookAt(0, 8, 0);

    if (stars) stars.rotation.y += 0.00025;
  }

  renderer.render(scene, camera);
}

// -------------------------
// RESIZE
// -------------------------
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Init
setTheme("night");  // start at night (press D for day)
buildCity();
animate();


