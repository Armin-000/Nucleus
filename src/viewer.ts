import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export type ViewerContext = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  modelRoot: THREE.Group;
  fitCameraToObject: (object: THREE.Object3D, saveAsInitial?: boolean) => void;
  resetCameraSmooth: () => void;
  start: () => void;
  resize: () => void;
};

export function createViewer(viewerElement: HTMLDivElement): ViewerContext {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5f5f5);

  const camera = new THREE.PerspectiveCamera(
    45,
    viewerElement.clientWidth / viewerElement.clientHeight,
    0.01,
    100
  );
  camera.position.set(0, 0.08, 1.4);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(viewerElement.clientWidth, viewerElement.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  viewerElement.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 0.05, 0);
  controls.minDistance = 0.3;
  controls.maxDistance = 4;
  controls.update();

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
  keyLight.position.set(3, 5, 4);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, 1.25);
  fillLight.position.set(-3, 2, -2);
  scene.add(fillLight);

  const backLight = new THREE.DirectionalLight(0xffffff, 1.4);
  backLight.position.set(0, 3, -5);
  scene.add(backLight);

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(2.2, 64),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.22,
      metalness: 0,
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.23;
  scene.add(floor);

  const grid = new THREE.GridHelper(2.4, 20, 0x000000, 0x444444);
  grid.position.y = -0.229;
  scene.add(grid);

  const modelRoot = new THREE.Group();
  scene.add(modelRoot);

  const initialCameraPosition = new THREE.Vector3();
  const initialControlsTarget = new THREE.Vector3();

  let isResetAnimating = false;
  let resetStartTime = 0;
  const resetDuration = 900;

  const resetFromPosition = new THREE.Vector3();
  const resetFromTarget = new THREE.Vector3();
  const resetToPosition = new THREE.Vector3();
  const resetToTarget = new THREE.Vector3();

  function easeInOutCubic(t: number): number {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function saveCurrentAsInitial(): void {
    initialCameraPosition.copy(camera.position);
    initialControlsTarget.copy(controls.target);
  }

  function fitCameraToObject(
    object: THREE.Object3D,
    saveAsInitial = false
  ): void {
    const box = new THREE.Box3().setFromObject(object);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();

    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);

    let distance = maxDim / (2 * Math.tan(fov / 2));
    if (!Number.isFinite(distance) || distance <= 0) {
      distance = 1.2;
    }

    distance *= 1.9;

    camera.position.set(
      center.x + maxDim * 0.6,
      center.y + maxDim * 0.58,
      center.z + distance * 1.1
    );

    camera.near = 0.01;
    camera.far = Math.max(100, distance * 12);
    camera.updateProjectionMatrix();

    controls.target.set(center.x, center.y + maxDim * 0.1, center.z);
    controls.update();

    if (saveAsInitial) {
      saveCurrentAsInitial();
    }
  }

  function resetCameraSmooth(): void {
    resetFromPosition.copy(camera.position);
    resetFromTarget.copy(controls.target);

    resetToPosition.copy(initialCameraPosition);
    resetToTarget.copy(initialControlsTarget);

    resetStartTime = performance.now();
    isResetAnimating = true;
  }

  function updateResetAnimation(): void {
    if (!isResetAnimating) return;

    const elapsed = performance.now() - resetStartTime;
    const progress = Math.min(elapsed / resetDuration, 1);
    const eased = easeInOutCubic(progress);

    camera.position.lerpVectors(resetFromPosition, resetToPosition, eased);
    controls.target.lerpVectors(resetFromTarget, resetToTarget, eased);
    controls.update();

    if (progress >= 1) {
      isResetAnimating = false;
    }
  }

  function resize(): void {
    const width = viewerElement.clientWidth;
    const height = viewerElement.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  function start(): void {
    function animate(): void {
      requestAnimationFrame(animate);
      updateResetAnimation();
      controls.update();
      renderer.render(scene, camera);
    }

    animate();
  }

  saveCurrentAsInitial();

  return {
    scene,
    camera,
    renderer,
    controls,
    modelRoot,
    fitCameraToObject,
    resetCameraSmooth,
    start,
    resize,
  };
}