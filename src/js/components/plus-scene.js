// The brand "+" as a live 3D object, sitting in the gap of the hero wordmark.
// Its arms flare outward from a narrow centre, like the logogram in the brand
// guide ("smaller corner towards bigger shape outwards"). It idles in a slow
// turn, leans towards the cursor, and spins a quarter turn as the hero scrolls
// away. Falls back to the flat SVG "+" when WebGL is unavailable.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { gsap, reduce } from '../lib/motion.js';

function plusShape() {
  const c = 0.27; // half-width at the centre
  const t = 0.42; // half-width at the tips
  const pts = [
    [-c, c], [-t, 1], [t, 1], [c, c],
    [1, t], [1, -t], [c, -c],
    [t, -1], [-t, -1], [-c, -c],
    [-1, -t], [-1, t],
  ];
  const s = new THREE.Shape();
  pts.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  return s;
}

export function initPlus() {
  const canvas = document.querySelector('[data-plus-canvas]');
  if (!canvas) return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    document.documentElement.classList.add('no-webgl');
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0, 11.5);

  const geo = new THREE.ExtrudeGeometry(plusShape(), {
    depth: 0.42,
    bevelEnabled: true,
    bevelThickness: 0.12,
    bevelSize: 0.07,
    bevelSegments: 10,
    curveSegments: 4,
  });
  geo.center();

  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xc8ff00,
    roughness: 0.22,
    metalness: 0.0,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    emissive: 0x3d5200,
    emissiveIntensity: 0.35,
  });

  const mesh = new THREE.Mesh(geo, mat);
  const tilt = new THREE.Group(); // cursor lean
  const spin = new THREE.Group(); // idle turn + scroll spin
  spin.add(mesh);
  tilt.add(spin);
  scene.add(tilt);

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 4, 6);
  scene.add(key);
  const rim = new THREE.PointLight(0xc8ff00, 30, 20);
  rim.position.set(-4, -2, 3);
  scene.add(rim);

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  new ResizeObserver(resize).observe(canvas);

  // State that other modules drive (intro scale, scroll spin).
  const state = { scale: reduce ? 1 : 0, scroll: 0 };
  const pointer = { x: 0, y: 0 };
  const lean = { x: 0, y: 0 };

  if (!reduce) {
    window.addEventListener('pointermove', (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });
  }

  // Only render while the hero is on screen.
  let visible = true;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(canvas);

  const render = (time) => {
    if (!visible) return;
    lean.x += (pointer.y * 0.35 - lean.x) * 0.06;
    lean.y += (pointer.x * 0.55 - lean.y) * 0.06;
    tilt.rotation.x = lean.x;
    tilt.rotation.y = lean.y;
    spin.rotation.y = reduce ? 0.4 : time * 0.35;
    spin.rotation.z = 0.12 + state.scroll * Math.PI * 0.5;
    const s = state.scale * (1 + state.scroll * 0.25);
    spin.scale.setScalar(Math.max(0.0001, s));
    renderer.render(scene, camera);
  };

  if (reduce) render(0);
  else gsap.ticker.add(render);

  return state;
}
