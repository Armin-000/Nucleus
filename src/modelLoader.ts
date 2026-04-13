import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

type ColorOption = "beige" | "black" | "brown";
type BatteryType = "long" | "short";

const loader = new GLTFLoader();

export const originalMaterials = new WeakMap<
  THREE.Mesh,
  THREE.Material | THREE.Material[]
>();

export function getBodyPath(color: ColorOption): string {
  return `/cochlear/nucleus7/body/nucleus7_body_${color}.glb`;
}

export function getBatteryPath(color: ColorOption, type: BatteryType): string {
  return `/cochlear/nucleus7/battery/nucleus7_battery_${type}_${color}.glb`;
}

export function disposeMaterial(material: THREE.Material | THREE.Material[]): void {
  if (Array.isArray(material)) {
    material.forEach((mat) => mat.dispose());
    return;
  }
  material.dispose();
}

export function disposeObject(object: THREE.Object3D): void {
  object.traverse((child: THREE.Object3D) => {
    const mesh = child as THREE.Mesh;
    if ("geometry" in mesh && mesh.geometry) {
      mesh.geometry.dispose();
    }
    if ("material" in mesh && mesh.material) {
      disposeMaterial(mesh.material);
    }
  });
}

export function centerModelGroup(group: THREE.Group): void {
  const box = new THREE.Box3().setFromObject(group);
  const center = new THREE.Vector3();
  box.getCenter(center);
  group.position.sub(center);
}

export function normalizeLoadedModel(model: THREE.Object3D): THREE.Object3D {
  model.traverse((child: THREE.Object3D) => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      if (!originalMaterials.has(mesh)) {
        originalMaterials.set(mesh, mesh.material);
      }
    }
  });

  return model;
}

export function loadGLB(path: string): Promise<THREE.Object3D> {
  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf: GLTF) => {
        resolve(normalizeLoadedModel(gltf.scene));
      },
      undefined,
      (error: unknown) => {
        reject(error);
      }
    );
  });
}

export function createHighlightMaterial(
  sourceMaterial?: THREE.Material
): THREE.MeshStandardMaterial {
  const highlighted = new THREE.MeshStandardMaterial({
    color: 0x4da6ff,
    emissive: 0x123d6b,
    metalness: 0.35,
    roughness: 0.45,
  });

  if (sourceMaterial && "map" in sourceMaterial) {
    const maybeMap = (sourceMaterial as THREE.MeshStandardMaterial).map;
    if (maybeMap) {
      highlighted.map = maybeMap;
    }
  }

  return highlighted;
}

export function restoreObjectMaterials(object: THREE.Object3D): void {
  object.traverse((child: THREE.Object3D) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;

    const original = originalMaterials.get(mesh);
    if (original) {
      mesh.material = original;
    }
  });
}

export function applyHighlight(object: THREE.Object3D): void {
  object.traverse((child: THREE.Object3D) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;

    if (!originalMaterials.has(mesh)) {
      originalMaterials.set(mesh, mesh.material);
    }

    const sourceMaterial = Array.isArray(mesh.material)
      ? mesh.material[0]
      : mesh.material;

    mesh.material = createHighlightMaterial(sourceMaterial);
  });
}

export function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[_\-.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function findBestObjectByNames(
  names: string[],
  roots: Array<THREE.Object3D | null>
): THREE.Object3D | null {
  const candidates: THREE.Object3D[] = [];
  const normalizedTargets = names.map(normalizeName);

  roots.forEach((root) => {
    if (!root) return;

    root.traverse((obj: THREE.Object3D) => {
      const currentName = normalizeName(obj.name || "");
      if (!currentName) return;

      if (normalizedTargets.some((target) => currentName.includes(target))) {
        candidates.push(obj);
      }
    });
  });

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((a, b) => {
    const aMeshScore = (a as THREE.Mesh).isMesh ? 1 : 0;
    const bMeshScore = (b as THREE.Mesh).isMesh ? 1 : 0;
    return bMeshScore - aMeshScore;
  });

  return candidates[0];
}

export function setObjectVisibilityByNames(
  names: string[],
  visible: boolean,
  roots: Array<THREE.Object3D | null>
): void {
  const normalizedTargets = names.map(normalizeName);

  roots.forEach((root) => {
    if (!root) return;

    root.traverse((obj: THREE.Object3D) => {
      const currentName = normalizeName(obj.name || "");
      if (!currentName) return;

      if (normalizedTargets.some((target) => currentName.includes(target))) {
        obj.visible = visible;
      }
    });
  });
}