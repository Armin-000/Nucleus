import * as THREE from "three";
import { normalizeName } from "./modelLoader";

export type ExplodeDirection =
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "front"
  | "back";

export type ExplodeRule = {
  matchNames: string[];
  enabled?: boolean;

  direction?: ExplodeDirection;
  distance?: number;
  directionVector?: THREE.Vector3;

  secondDirection?: ExplodeDirection;
  secondDistance?: number;
  secondDirectionVector?: THREE.Vector3;

  offset?: THREE.Vector3;

  rotation?: THREE.Euler;
  rotationOrder?: THREE.EulerOrder;

  label?: string;

  animationDurationMs?: number;
  rotationFirst?: boolean;
};

type OriginalTransform = {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
};

type ExplodeTarget = {
  object: THREE.Object3D;
  original: OriginalTransform;
  firstTargetPosition: THREE.Vector3;
  finalTargetPosition: THREE.Vector3;
  targetRotation: THREE.Euler;
  duration: number;
  rotationFirst: boolean;
};

type ResetTarget = {
  object: THREE.Object3D;
  original: OriginalTransform;
  startPosition: THREE.Vector3;
  startRotation: THREE.Euler;
  duration: number;
};

export class ExplodeController {
  private readonly originalTransforms = new WeakMap<
    THREE.Object3D,
    OriginalTransform
  >();

  private exploded = false;
  private animationFrameId: number | null = null;
  private readonly rules: ExplodeRule[];

  constructor(rules: ExplodeRule[]) {
    this.rules = rules;
  }

  public isExploded(): boolean {
    return this.exploded;
  }

  public setExploded(value: boolean): void {
    this.exploded = value;
  }

  public clearCache(): void {
    this.exploded = false;
  }

  public cacheOriginalTransforms(roots: THREE.Object3D[]): void {
    roots.forEach((root) => {
      root.traverse((obj) => {
        if (!this.originalTransforms.has(obj)) {
          this.originalTransforms.set(obj, {
            position: obj.position.clone(),
            rotation: obj.rotation.clone(),
            scale: obj.scale.clone(),
          });
        }
      });
    });
  }

  public refreshOriginalTransforms(roots: THREE.Object3D[]): void {
    roots.forEach((root) => {
      root.traverse((obj) => {
        this.originalTransforms.set(obj, {
          position: obj.position.clone(),
          rotation: obj.rotation.clone(),
          scale: obj.scale.clone(),
        });
      });
    });

    this.exploded = false;
  }

  public apply(roots: THREE.Object3D[]): void {
    if (roots.length === 0) return;

    this.cacheOriginalTransforms(roots);

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    const targets: ExplodeTarget[] = [];

    roots.forEach((root) => {
      root.traverse((obj) => {
        const rule = this.findRuleForObject(obj);
        if (!rule || rule.enabled === false) return;

        const original = this.originalTransforms.get(obj);
        if (!original) return;

        const firstOffset = this.resolveOffset(
          rule.direction,
          rule.distance,
          rule.directionVector
        );

        const secondOffset = this.resolveOffset(
          rule.secondDirection,
          rule.secondDistance,
          rule.secondDirectionVector
        );

        const customOffset = rule.offset
          ? rule.offset.clone()
          : new THREE.Vector3();

        const firstTargetPosition = original.position.clone().add(firstOffset);
        const finalTargetPosition = firstTargetPosition
          .clone()
          .add(secondOffset)
          .add(customOffset);

        const targetRotation = original.rotation.clone();

        if (rule.rotationOrder) {
          targetRotation.order = rule.rotationOrder;
        }

        if (rule.rotation) {
          targetRotation.x += rule.rotation.x;
          targetRotation.y += rule.rotation.y;
          targetRotation.z += rule.rotation.z;
        }

        targets.push({
          object: obj,
          original,
          firstTargetPosition,
          finalTargetPosition,
          targetRotation,
          duration: rule.animationDurationMs ?? 650,
          rotationFirst: rule.rotationFirst ?? false,
        });
      });
    });

    if (targets.length === 0) {
      this.exploded = true;
      return;
    }

    const startTime = performance.now();
    const maxDuration = Math.max(...targets.map((target) => target.duration));

    const animate = (now: number) => {
      const elapsed = now - startTime;

      targets.forEach((item) => {
        const t = Math.min(elapsed / item.duration, 1);
        const eased = this.easeInOutCubic(t);

        if (item.rotationFirst) {
          const rotationPhase = Math.min(eased / 0.45, 1);
          const movementPhase = eased <= 0.45 ? 0 : (eased - 0.45) / 0.55;

          item.object.rotation.set(
            THREE.MathUtils.lerp(
              item.original.rotation.x,
              item.targetRotation.x,
              rotationPhase
            ),
            THREE.MathUtils.lerp(
              item.original.rotation.y,
              item.targetRotation.y,
              rotationPhase
            ),
            THREE.MathUtils.lerp(
              item.original.rotation.z,
              item.targetRotation.z,
              rotationPhase
            ),
            item.targetRotation.order
          );

          let phase1 = 0;
          let phase2 = 0;

          if (movementPhase <= 0.5) {
            phase1 = movementPhase / 0.5;
            phase2 = 0;
          } else {
            phase1 = 1;
            phase2 = (movementPhase - 0.5) / 0.5;
          }

          const intermediateX = THREE.MathUtils.lerp(
            item.original.position.x,
            item.firstTargetPosition.x,
            phase1
          );
          const intermediateY = THREE.MathUtils.lerp(
            item.original.position.y,
            item.firstTargetPosition.y,
            phase1
          );
          const intermediateZ = THREE.MathUtils.lerp(
            item.original.position.z,
            item.firstTargetPosition.z,
            phase1
          );

          item.object.position.set(
            THREE.MathUtils.lerp(
              intermediateX,
              item.finalTargetPosition.x,
              phase2
            ),
            THREE.MathUtils.lerp(
              intermediateY,
              item.finalTargetPosition.y,
              phase2
            ),
            THREE.MathUtils.lerp(
              intermediateZ,
              item.finalTargetPosition.z,
              phase2
            )
          );
        } else {
          item.object.rotation.set(
            THREE.MathUtils.lerp(
              item.original.rotation.x,
              item.targetRotation.x,
              eased
            ),
            THREE.MathUtils.lerp(
              item.original.rotation.y,
              item.targetRotation.y,
              eased
            ),
            THREE.MathUtils.lerp(
              item.original.rotation.z,
              item.targetRotation.z,
              eased
            ),
            item.targetRotation.order
          );

          let phase1 = 0;
          let phase2 = 0;

          if (eased <= 0.5) {
            phase1 = eased / 0.5;
            phase2 = 0;
          } else {
            phase1 = 1;
            phase2 = (eased - 0.5) / 0.5;
          }

          const intermediateX = THREE.MathUtils.lerp(
            item.original.position.x,
            item.firstTargetPosition.x,
            phase1
          );
          const intermediateY = THREE.MathUtils.lerp(
            item.original.position.y,
            item.firstTargetPosition.y,
            phase1
          );
          const intermediateZ = THREE.MathUtils.lerp(
            item.original.position.z,
            item.firstTargetPosition.z,
            phase1
          );

          item.object.position.set(
            THREE.MathUtils.lerp(
              intermediateX,
              item.finalTargetPosition.x,
              phase2
            ),
            THREE.MathUtils.lerp(
              intermediateY,
              item.finalTargetPosition.y,
              phase2
            ),
            THREE.MathUtils.lerp(
              intermediateZ,
              item.finalTargetPosition.z,
              phase2
            )
          );
        }

        item.object.scale.copy(item.original.scale);
      });

      if (elapsed < maxDuration) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        this.animationFrameId = null;
        this.exploded = true;
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  public reset(roots: THREE.Object3D[]): void {
    if (roots.length === 0) {
      this.exploded = false;
      return;
    }

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    const targets: ResetTarget[] = [];

    roots.forEach((root) => {
      root.traverse((obj) => {
        const original = this.originalTransforms.get(obj);
        if (!original) return;

        targets.push({
          object: obj,
          original,
          startPosition: obj.position.clone(),
          startRotation: obj.rotation.clone(),
          duration: 500,
        });
      });
    });

    if (targets.length === 0) {
      this.exploded = false;
      return;
    }

    const startTime = performance.now();
    const maxDuration = Math.max(...targets.map((target) => target.duration));

    const animate = (now: number) => {
      const elapsed = now - startTime;

      targets.forEach((item) => {
        const t = Math.min(elapsed / item.duration, 1);
        const eased = this.easeInOutCubic(t);

        item.object.position.set(
          THREE.MathUtils.lerp(
            item.startPosition.x,
            item.original.position.x,
            eased
          ),
          THREE.MathUtils.lerp(
            item.startPosition.y,
            item.original.position.y,
            eased
          ),
          THREE.MathUtils.lerp(
            item.startPosition.z,
            item.original.position.z,
            eased
          )
        );

        item.object.rotation.set(
          THREE.MathUtils.lerp(
            item.startRotation.x,
            item.original.rotation.x,
            eased
          ),
          THREE.MathUtils.lerp(
            item.startRotation.y,
            item.original.rotation.y,
            eased
          ),
          THREE.MathUtils.lerp(
            item.startRotation.z,
            item.original.rotation.z,
            eased
          ),
          item.original.rotation.order
        );

        item.object.scale.copy(item.original.scale);
      });

      if (elapsed < maxDuration) {
        this.animationFrameId = requestAnimationFrame(animate);
      } else {
        this.animationFrameId = null;
        this.exploded = false;
      }
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  public toggle(roots: THREE.Object3D[]): boolean {
    if (this.exploded) {
      this.reset(roots);
    } else {
      this.apply(roots);
    }

    return this.exploded;
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  private findRuleForObject(object: THREE.Object3D): ExplodeRule | null {
    let current: THREE.Object3D | null = object;

    while (current) {
      const normalized = normalizeName(current.name || "");

      for (const rule of this.rules) {
        const matches = rule.matchNames.some((name) =>
          normalized.includes(normalizeName(name))
        );

        if (matches) {
          return rule;
        }
      }

      current = current.parent;
    }

    return null;
  }

  private resolveOffset(
    direction: ExplodeDirection | undefined,
    distance: number | undefined,
    directionVector: THREE.Vector3 | undefined
  ): THREE.Vector3 {
    if (typeof distance !== "number") {
      return new THREE.Vector3();
    }

    if (directionVector) {
      return directionVector.clone().normalize().multiplyScalar(distance);
    }

    if (direction) {
      return this.getDirectionOffset(direction, distance);
    }

    return new THREE.Vector3();
  }

  private getDirectionOffset(
    direction: ExplodeDirection,
    distance: number
  ): THREE.Vector3 {
    switch (direction) {
      case "left":
        return new THREE.Vector3(-distance, 0, 0);
      case "right":
        return new THREE.Vector3(distance, 0, 0);
      case "top":
        return new THREE.Vector3(0, distance, 0);
      case "bottom":
        return new THREE.Vector3(0, -distance, 0);
      case "front":
        return new THREE.Vector3(0, 0, distance);
      case "back":
        return new THREE.Vector3(0, 0, -distance);
      default:
        return new THREE.Vector3();
    }
  }
}