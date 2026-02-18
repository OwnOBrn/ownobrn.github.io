const back = document.querySelector(".skyline-back");
const front = document.querySelector(".skyline-front");

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function setParallax(px, py) {
  // px,py in [-1, 1]
  const bx = px * 8;   // back layer moves less
  const fx = px * 16;  // front layer moves more

  const by = py * 2;
  const fy = py * 4;

  back.style.transform = `translate3d(${bx}px, ${by}px, 0)`;
  front.style.transform = `translate3d(${fx}px, ${fy}px, 0)`;
}

// Mouse parallax
window.addEventListener("mousemove", (e) => {
  const x = (e.clientX / window.innerWidth) * 2 - 1;
  const y = (e.clientY / window.innerHeight) * 2 - 1;
  setParallax(clamp(x, -1, 1), clamp(y, -1, 1));
});

// Scroll parallax (subtle)
window.addEventListener("scroll", () => {
  const t = clamp(window.scrollY / 600, 0, 1);
  // map t -> [-0.2, 0.2]
  const py = (t - 0.5) * 0.4;
  setParallax(0, py);
});

// CTA example
document.getElementById("cta")?.addEventListener("click", () => {
  alert("Welcome to NYC mode.");
});


