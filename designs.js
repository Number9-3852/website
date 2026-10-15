import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const stage = document.getElementById('designsStage');
const counter = document.getElementById('designsCounter');
const slides = Array.from(document.querySelectorAll('.design-slide'));

const viewers = slides.map((slide) => {
  const canvas = slide.querySelector('.model-canvas');
  const fileInput = slide.querySelector('.model-file-input');
  const viewer = createViewer(canvas, canvas.dataset.model);

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    viewer.loadModel(URL.createObjectURL(file), true);
  });

  return viewer;
});

function createViewer(canvas, modelUrl) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0.6, 3.2);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  scene.add(new THREE.HemisphereLight(0xffffff, 0x22242a, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(3, 4, 2);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x66ffcc, 0.55);
  rim.position.set(-3, -1, -2);
  scene.add(rim);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.enableZoom = false; // keep mouse wheel free to scroll the page between designs
  controls.mouseButtons = {
    LEFT: null,
    MIDDLE: null,
    RIGHT: THREE.MOUSE.ROTATE,
  };
  controls.touches = {
    ONE: THREE.TOUCH.ROTATE,
    TWO: null,
  };

  // stop the browser's right-click menu from popping up over the model
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  // basic drag-and-drop of a .glb/.gltf straight onto the canvas
  canvas.addEventListener('dragover', (e) => e.preventDefault());
  canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) viewer.loadModel(URL.createObjectURL(file), true);
  });

  const loader = new GLTFLoader();
  let currentModel = null;

  function frameObject(object) {
    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 1.6 / maxDim;

    object.scale.setScalar(scale);
    object.position.sub(center.multiplyScalar(scale));

    camera.position.set(0, maxDim * scale * 0.35, maxDim * scale * 1.9 + 1.4);
    controls.target.set(0, 0, 0);
    controls.update();
  }

  function loadModel(url, isBlob) {
    if (!url) return;
    loader.load(
      url,
      (gltf) => {
        if (currentModel) scene.remove(currentModel);
        currentModel = gltf.scene;
        scene.add(currentModel);
        frameObject(currentModel);
        if (isBlob) URL.revokeObjectURL(url);
      },
      undefined,
      (err) => console.error('Could not load model:', url, err)
    );
  }

  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  let animating = false;
  function tick() {
    if (!animating) return;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  const viewer = {
    start() {
      if (animating) return;
      animating = true;
      resize();
      tick();
    },
    stop() {
      animating = false;
    },
    loadModel,
    resize,
  };

  window.addEventListener('resize', resize);
  if (modelUrl) loadModel(modelUrl);

  return viewer;
}

// Only render the slide currently on screen, and keep the counter in sync
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const idx = slides.indexOf(entry.target);
      if (entry.isIntersecting) {
        viewers[idx].start();
        counter.textContent =
          String(idx + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
      } else {
        viewers[idx].stop();
      }
    });
  },
  { root: stage, threshold: 0.6 }
);

slides.forEach((slide) => observer.observe(slide));
