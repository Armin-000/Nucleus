import "./style.css";
import * as THREE from "three";
import { createViewer } from "./viewer";
import {
  applyHighlight,
  applyHoverHighlight,
  centerModelGroup,
  disposeObject,
  findBestObjectByNames,
  getBatteryPath,
  getBodyPath,
  loadGLB,
  loadingManager,
  normalizeName,
  restoreObjectMaterials,
  setObjectVisibilityByNames,
} from "./modelLoader";
import {
  bindGlobalCustomSelectClose,
  closeSidebar,
  setupCustomSelect,
  showPanel,
} from "./ui";
import { renderTree, type TreeNode } from "./tree";

type ColorOption = "beige" | "black" | "brown";
type BatteryType = "long" | "short" | "disposable";

type ComponentDoc = {
  title: string;
  subtitle: string;
  schematics?: string;
  manual?: string;
  maintenance?: string;
};

const appEl = document.getElementById("app") as HTMLDivElement | null;
const viewer = document.getElementById("viewer") as HTMLDivElement | null;
const loadingEl = document.getElementById("loading") as HTMLDivElement | null;

const colorSelect = document.getElementById("colorSelect") as HTMLInputElement | null;
const batteryTypeSelect = document.getElementById("batteryType") as HTMLInputElement | null;

const sidebarWrapper = document.getElementById("sidebarWrapper") as HTMLDivElement | null;
const closeSidebarBtn = document.getElementById("closeSidebar") as HTMLButtonElement | null;
const helpBtn = document.getElementById("helpBtn") as HTMLButtonElement | null;
const resetBtn = document.getElementById("resetBtn") as HTMLButtonElement | null;
const treeContainer = document.getElementById("tree") as HTMLDivElement | null;

const itemBarButtons = Array.from(
  document.querySelectorAll<HTMLButtonElement>(".itembar-btn[data-panel]")
);

const panelBody = document.getElementById("panel-body") as HTMLDivElement | null;
const panelComponents = document.getElementById("panel-components") as HTMLDivElement | null;

const componentModal = document.getElementById("componentModal") as HTMLDivElement | null;
const componentModalTitle = document.getElementById("componentModalTitle") as HTMLHeadingElement | null;
const componentModalSubtitle = document.getElementById("componentModalSubtitle") as HTMLParagraphElement | null;
const componentModalClose = document.getElementById("componentModalClose") as HTMLButtonElement | null;

const docSchematics = document.getElementById("docSchematics") as HTMLAnchorElement | null;
const docManual = document.getElementById("docManual") as HTMLAnchorElement | null;
const docMaintenance = document.getElementById("docMaintenance") as HTMLAnchorElement | null;

const orbitToggle = document.getElementById("orbitToggle") as HTMLButtonElement | null;
const orbitPanel = document.getElementById("orbitPanel") as HTMLDivElement | null;

if (
  !appEl ||
  !viewer ||
  !loadingEl ||
  !colorSelect ||
  !batteryTypeSelect ||
  !sidebarWrapper ||
  !closeSidebarBtn ||
  !helpBtn ||
  !resetBtn ||
  !treeContainer ||
  !panelBody ||
  !panelComponents ||
  !componentModal ||
  !componentModalTitle ||
  !componentModalSubtitle ||
  !componentModalClose ||
  !docSchematics ||
  !docManual ||
  !docMaintenance ||
  !orbitToggle ||
  !orbitPanel
) {
  throw new Error("Nedostaje jedan ili više HTML elemenata.");
}

const appElement = appEl;
const viewerEl = viewer;
const loadingElement = loadingEl;
const colorInput = colorSelect;
const batteryTypeInput = batteryTypeSelect;
const sidebarWrapperEl = sidebarWrapper;
const closeSidebarButton = closeSidebarBtn;
const helpButton = helpBtn;
const resetButton = resetBtn;
const treeRoot = treeContainer;
const panelBodyEl = panelBody;
const panelComponentsEl = panelComponents;

const componentModalEl = componentModal;
const componentModalTitleEl = componentModalTitle;
const componentModalSubtitleEl = componentModalSubtitle;
const componentModalCloseEl = componentModalClose;

const docSchematicsEl = docSchematics;
const docManualEl = docManual;
const docMaintenanceEl = docMaintenance;

const orbitToggleEl = orbitToggle;
const orbitPanelEl = orbitPanel;
const orbitContainerEl = orbitToggleEl.parentElement as HTMLDivElement;

const loadingTextEl = loadingElement.querySelector(".loading-text") as HTMLDivElement | null;

const hierarchyData: TreeNode[] = [
  {
    label: "Main Body",
    objectNames: ["Main Body", "Body", "Nucleus Body"],
    defaultExpanded: true,
    children: [
      {
        label: "Batteries",
        objectNames: ["Batteries", "Battery"],
        defaultExpanded: true,
        children: [
          {
            label: "Battery Module",
            objectNames: ["Battery Module", "Battery"],
          },
        ],
      },
      {
        label: "Mechanism",
        objectNames: ["Mechanism"],
        defaultExpanded: true,
        children: [
          { label: "Control Button", objectNames: ["Control Button", "Button"] },
          { label: "Indicator Light", objectNames: ["Indicator Light", "Light", "Indicator"] },
          { label: "Microphone 1", objectNames: ["Microphone 1", "Microphone1", "Mic 1"] },
          { label: "Microphone 2", objectNames: ["Microphone 2", "Microphone2", "Mic 2"] },
          { label: "Microphone Cover", objectNames: ["Microphone Cover", "Mic Cover"] },
        ],
      },
      { label: "Earhook", objectNames: ["Earhook", "Ear Hook"] },
    ],
  },
  {
    label: "Connector",
    objectNames: ["Connector"],
    defaultExpanded: true,
    children: [
      { label: "Cable", objectNames: ["Cable"] },
      { label: "Magnet", objectNames: ["Magnet"] },
      { label: "Slimline", objectNames: ["Slimline", "Slim Line"] },
    ],
  },
];

const viewerContext = createViewer(viewerEl);
const {
  modelRoot,
  fitCameraToObject,
  resetCameraSmooth,
  start,
  resize,
  camera,
  renderer,
  controls,
} = viewerContext;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let currentBody: THREE.Object3D | null = null;
let currentBattery: THREE.Object3D | null = null;
let latestRequestId = 0;
let selectedObject: THREE.Object3D | null = null;
let hoveredObject: THREE.Object3D | null = null;

/* TOUCH STATE */
let touchStartX = 0;
let touchStartY = 0;
let touchMoved = false;
let lastTapTime = 0;
let lastTapObjectName = "";
let longPressTimer: number | null = null;

const LONG_PRESS_DURATION = 550;
const DOUBLE_TAP_DELAY = 300;
const TOUCH_MOVE_TOLERANCE = 12;

function setLoading(isLoading: boolean): void {
  loadingElement.classList.toggle("show", isLoading);
  appElement.classList.toggle("app-hidden", isLoading);
}

function setLoadingText(text: string): void {
  if (loadingTextEl) {
    loadingTextEl.textContent = text;
  }
}

function closeAllCustomSelects(): void {
  document.querySelectorAll(".custom-select.open").forEach((select) => {
    select.classList.remove("open");
  });
}

function setDocLink(element: HTMLAnchorElement, href?: string): void {
  if (href) {
    element.href = href;
    element.style.display = "flex";
  } else {
    element.removeAttribute("href");
    element.style.display = "none";
  }
}

function openBottomModal(data: ComponentDoc): void {
  componentModalTitleEl.textContent = data.title;
  componentModalSubtitleEl.textContent = data.subtitle;

  setDocLink(docSchematicsEl, data.schematics);
  setDocLink(docManualEl, data.manual);
  setDocLink(docMaintenanceEl, data.maintenance);

  componentModalEl.classList.add("show");
}

function closeBottomModal(clearSelected = true): void {
  componentModalEl.classList.remove("show");

  if (clearSelected) {
    clearSelection();
    clearHover();
  }
}

function clearHover(): void {
  if (hoveredObject && hoveredObject !== selectedObject) {
    restoreObjectMaterials(hoveredObject);
  }
  hoveredObject = null;
}

function clearSelection(): void {
  if (selectedObject) {
    restoreObjectMaterials(selectedObject);
    selectedObject = null;
  }
}

function clearCurrentModels(): void {
  clearHover();
  clearSelection();

  if (currentBody) {
    modelRoot.remove(currentBody);
    disposeObject(currentBody);
    currentBody = null;
  }

  if (currentBattery) {
    modelRoot.remove(currentBattery);
    disposeObject(currentBattery);
    currentBattery = null;
  }
}

function setSelectedObject(object: THREE.Object3D): void {
  if (selectedObject === object) return;

  if (selectedObject) {
    restoreObjectMaterials(selectedObject);
  }

  selectedObject = object;
  applyHighlight(object);
}

function setHoveredObject(object: THREE.Object3D | null): void {
  if (hoveredObject === object) return;

  if (hoveredObject && hoveredObject !== selectedObject) {
    restoreObjectMaterials(hoveredObject);
  }

  hoveredObject = object;

  if (hoveredObject && hoveredObject !== selectedObject) {
    applyHoverHighlight(hoveredObject);
  }
}

function rotateCamera(direction: string): void {
  const targetObject = modelRoot;
  if (!targetObject) return;

  const box = new THREE.Box3().setFromObject(targetObject);
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();

  box.getCenter(center);
  box.getSize(size);

  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  const distance = Math.max(maxDim * 2.4, 1.4);

  const newPosition = new THREE.Vector3();
  const newUp = new THREE.Vector3(0, 1, 0);

  switch (direction) {
    case "left":
      newPosition.set(center.x - distance, center.y, center.z);
      newUp.set(0, 1, 0);
      break;

    case "right":
      newPosition.set(center.x + distance, center.y, center.z);
      newUp.set(0, 1, 0);
      break;

    case "up":
      newPosition.set(center.x, center.y + distance, center.z + distance * 0.35);
      newUp.set(0, 1, 0);
      break;

    case "down":
      newPosition.set(center.x, center.y - distance, center.z + distance * 0.35);
      newUp.set(0, 1, 0);
      break;

    default:
      return;
  }

  controls.enabled = false;

  camera.up.copy(newUp);
  controls.object.up.copy(newUp);

  camera.position.copy(newPosition);
  controls.target.copy(center);

  camera.lookAt(center);
  camera.updateProjectionMatrix();
  controls.update();

  requestAnimationFrame(() => {
    controls.enabled = true;
  });
}

function updatePointerFromEvent(event: MouseEvent): void {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

function updatePointerFromTouch(touch: Touch): void {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
}

function findHitObject(event: MouseEvent): THREE.Object3D | null {
  updatePointerFromEvent(event);
  raycaster.setFromCamera(pointer, camera);

  const roots = [currentBody, currentBattery].filter(Boolean) as THREE.Object3D[];
  const intersects = raycaster.intersectObjects(roots, true);

  if (intersects.length === 0) return null;

  return intersects[0].object;
}

function findHitObjectFromTouch(touch: Touch): THREE.Object3D | null {
  updatePointerFromTouch(touch);
  raycaster.setFromCamera(pointer, camera);

  const roots = [currentBody, currentBattery].filter(Boolean) as THREE.Object3D[];
  const intersects = raycaster.intersectObjects(roots, true);

  if (intersects.length === 0) return null;

  return intersects[0].object;
}

function openObjectFromHit(hit: THREE.Object3D): void {
  setSelectedObject(hit);
  fitCameraToObject(hit);

  const doc = getComponentDocForObject(hit);
  openBottomModal(doc);
}

function findHierarchyNodeByObjectName(
  objectName: string,
  nodes: TreeNode[]
): TreeNode | null {
  const normalizedObjectName = normalizeName(objectName);

  for (const node of nodes) {
    const matchesCurrentNode =
      node.objectNames?.some((name) =>
        normalizedObjectName.includes(normalizeName(name))
      ) ?? false;

    if (matchesCurrentNode) {
      return node;
    }

    if (node.children && node.children.length > 0) {
      const childMatch = findHierarchyNodeByObjectName(objectName, node.children);
      if (childMatch) {
        return childMatch;
      }
    }
  }

  return null;
}

function getDisplayLabelForObject(object: THREE.Object3D): string {
  let current: THREE.Object3D | null = object;

  while (current) {
    const match = findHierarchyNodeByObjectName(current.name || "", hierarchyData);
    if (match) {
      return match.label;
    }

    current = current.parent;
  }

  return object.name || "Selected component";
}

function getComponentDocForObject(object: THREE.Object3D): ComponentDoc {
  const displayLabel = getDisplayLabelForObject(object);
  const normalizedLabel = normalizeName(displayLabel);

  if (normalizedLabel.includes("battery")) {
    return {
      title: displayLabel,
      subtitle: "Power supply component",
      schematics: "/docs/battery-schematics.pdf",
      manual: "/docs/battery-manual.pdf",
      maintenance: "/docs/battery-maintenance.pdf",
    };
  }

  if (normalizedLabel.includes("connector")) {
    return {
      title: displayLabel,
      subtitle: "Connection element",
      schematics: "/docs/connector-schematics.pdf",
      manual: "/docs/connector-manual.pdf",
      maintenance: "/docs/connector-maintenance.pdf",
    };
  }

  if (normalizedLabel.includes("button")) {
    return {
      title: displayLabel,
      subtitle: "User control component",
      schematics: "/docs/control-button-schematics.pdf",
      manual: "/docs/control-button-manual.pdf",
      maintenance: "/docs/control-button-maintenance.pdf",
    };
  }

  if (normalizedLabel.includes("indicator")) {
    return {
      title: displayLabel,
      subtitle: "Status indicator component",
      schematics: "/docs/indicator-light-schematics.pdf",
      manual: "/docs/indicator-light-manual.pdf",
      maintenance: "/docs/indicator-light-maintenance.pdf",
    };
  }

  if (normalizedLabel.includes("microphone")) {
    return {
      title: displayLabel,
      subtitle: "Audio capture component",
      schematics: "/docs/microphone-schematics.pdf",
      manual: "/docs/microphone-manual.pdf",
      maintenance: "/docs/microphone-maintenance.pdf",
    };
  }

  if (normalizedLabel.includes("earhook")) {
    return {
      title: displayLabel,
      subtitle: "Support and fitting component",
      schematics: "/docs/earhook-schematics.pdf",
      manual: "/docs/earhook-manual.pdf",
      maintenance: "/docs/earhook-maintenance.pdf",
    };
  }

  if (normalizedLabel.includes("cable")) {
    return {
      title: displayLabel,
      subtitle: "Signal transfer component",
      schematics: "/docs/cable-schematics.pdf",
      manual: "/docs/cable-manual.pdf",
      maintenance: "/docs/cable-maintenance.pdf",
    };
  }

  if (normalizedLabel.includes("magnet")) {
    return {
      title: displayLabel,
      subtitle: "Magnetic connection component",
      schematics: "/docs/magnet-schematics.pdf",
      manual: "/docs/magnet-manual.pdf",
      maintenance: "/docs/magnet-maintenance.pdf",
    };
  }

  if (normalizedLabel.includes("slimline")) {
    return {
      title: displayLabel,
      subtitle: "Slimline connection component",
      schematics: "/docs/slimline-schematics.pdf",
      manual: "/docs/slimline-manual.pdf",
      maintenance: "/docs/slimline-maintenance.pdf",
    };
  }

  return {
    title: displayLabel,
    subtitle: "Selected component documentation",
    schematics: "/docs/default-schematics.pdf",
    manual: "/docs/default-manual.pdf",
    maintenance: "/docs/default-maintenance.pdf",
  };
}

function focusObjectByTreeNode(node: TreeNode): void {
  if (!node.objectNames || node.objectNames.length === 0) return;

  const target = findBestObjectByNames(node.objectNames, [currentBody, currentBattery]);
  if (!target) {
    console.warn(`Objekt nije pronađen za: ${node.label}`);
    return;
  }

  setSelectedObject(target);
  fitCameraToObject(target);

  openBottomModal({
    title: node.label,
    subtitle: "Selected component documentation",
    schematics: `/docs/${normalizeName(node.label).replace(/\s+/g, "-")}-schematics.pdf`,
    manual: `/docs/${normalizeName(node.label).replace(/\s+/g, "-")}-manual.pdf`,
    maintenance: `/docs/${normalizeName(node.label).replace(/\s+/g, "-")}-maintenance.pdf`,
  });
}

function drawTree(): void {
  renderTree({
    container: treeRoot,
    data: hierarchyData,
    onNodeClick: (node) => {
      focusObjectByTreeNode(node);
    },
    onVisibilityChange: (node, visible) => {
      if (!node.objectNames || node.objectNames.length === 0) return;

      setObjectVisibilityByNames(node.objectNames, visible, [
        currentBody,
        currentBattery,
      ]);
    },
  });
}

function resetScene(): void {
  closeAllCustomSelects();
  clearHover();
  clearSelection();
  closeBottomModal(false);
  orbitContainerEl.classList.remove("open");

  if (longPressTimer !== null) {
    window.clearTimeout(longPressTimer);
    longPressTimer = null;
  }

  if (currentBody) {
    currentBody.traverse((obj: THREE.Object3D) => {
      obj.visible = true;
    });
  }

  if (currentBattery) {
    currentBattery.traverse((obj: THREE.Object3D) => {
      obj.visible = true;
    });
  }

  if (currentBody || currentBattery) {
    camera.up.set(0, 1, 0);
    controls.object.up.set(0, 1, 0);
    controls.update();
    resetCameraSmooth();
  }

  drawTree();
}

loadingManager.onStart = () => {
  setLoading(true);
  setLoadingText("Loading model...");
};

loadingManager.onProgress = () => {
  setLoadingText("Loading model...");
};

loadingManager.onLoad = () => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setLoadingText("Loading models...");
      setLoading(false);
    });
  });
};

loadingManager.onError = (url) => {
  console.error("Greška pri učitavanju resursa:", url);
};

async function updateModel(): Promise<void> {
  const requestId = ++latestRequestId;

  const color = colorInput.value as ColorOption;
  const batteryType = batteryTypeInput.value as BatteryType;

  const bodyPath = getBodyPath(color);
  const batteryPath = getBatteryPath(color, batteryType);

  try {
    const [bodyModel, batteryModel] = await Promise.all([
      loadGLB(bodyPath),
      loadGLB(batteryPath),
    ]);

    if (requestId !== latestRequestId) {
      disposeObject(bodyModel);
      disposeObject(batteryModel);
      return;
    }

    clearCurrentModels();
    closeBottomModal(false);

    currentBody = bodyModel;
    currentBattery = batteryModel;

    modelRoot.add(currentBody);
    modelRoot.add(currentBattery);

    modelRoot.position.set(0, 0, 0);
    modelRoot.rotation.set(0, 0, 0);
    modelRoot.scale.set(1, 1, 1);

    centerModelGroup(modelRoot);
    fitCameraToObject(modelRoot);
    drawTree();

    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  } catch (error) {
    console.error("Greška pri učitavanju modela:", error);
    setLoading(true);
    setLoadingText("Greška pri učitavanju modela");

    setTimeout(() => {
      setLoading(false);
      setLoadingText("Loading models...");
    }, 1800);

    alert("Greška pri učitavanju modela. Provjeri putanje i nazive GLB datoteka.");
  }
}

renderer.domElement.addEventListener("mousemove", (event) => {
  const hit = findHitObject(event);
  setHoveredObject(hit);
});

renderer.domElement.addEventListener("mouseleave", () => {
  clearHover();
});

renderer.domElement.addEventListener("dblclick", (event) => {
  const hit = findHitObject(event);
  if (!hit) return;

  openObjectFromHit(hit);
});

renderer.domElement.addEventListener("click", (event) => {
  const hit = findHitObject(event);
  if (!hit) {
    clearHover();
  }
});

/* TOUCH SUPPORT: DOUBLE TAP + LONG PRESS */
renderer.domElement.addEventListener(
  "touchstart",
  (event) => {
    if (event.touches.length !== 1) return;

    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    touchMoved = false;

    const hit = findHitObjectFromTouch(touch);
    if (!hit) return;

    if (longPressTimer !== null) {
      window.clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    longPressTimer = window.setTimeout(() => {
      if (!touchMoved) {
        openObjectFromHit(hit);
      }
      longPressTimer = null;
    }, LONG_PRESS_DURATION);
  },
  { passive: true }
);

renderer.domElement.addEventListener(
  "touchmove",
  (event) => {
    if (event.touches.length !== 1) return;

    const touch = event.touches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    const movedDistance = Math.sqrt(dx * dx + dy * dy);

    if (movedDistance > TOUCH_MOVE_TOLERANCE) {
      touchMoved = true;

      if (longPressTimer !== null) {
        window.clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    }
  },
  { passive: true }
);

renderer.domElement.addEventListener(
  "touchend",
  (event) => {
    if (longPressTimer !== null) {
      window.clearTimeout(longPressTimer);
      longPressTimer = null;
    }

    if (touchMoved) return;
    if (event.changedTouches.length !== 1) return;

    const touch = event.changedTouches[0];
    const hit = findHitObjectFromTouch(touch);
    if (!hit) return;

    const now = Date.now();
    const objectName = hit.name || "";

    const isDoubleTap =
      now - lastTapTime <= DOUBLE_TAP_DELAY &&
      objectName === lastTapObjectName;

    if (isDoubleTap) {
      openObjectFromHit(hit);
      lastTapTime = 0;
      lastTapObjectName = "";
      return;
    }

    lastTapTime = now;
    lastTapObjectName = objectName;
  },
  { passive: true }
);

itemBarButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const panel = btn.dataset.panel;
    if (!panel) return;

    showPanel(panel, {
      panelBody: panelBodyEl,
      panelComponents: panelComponentsEl,
      sidebarWrapper: sidebarWrapperEl,
      itemBarButtons,
    });
  });
});

closeSidebarButton.addEventListener("click", () => {
  closeSidebar(sidebarWrapperEl);
});

componentModalCloseEl.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  closeBottomModal(true);
});

helpButton.addEventListener("click", () => {
  window.open("public/cochlear/nucleus7/documentation/Cochlear_manuals.pdf", "_blank");
});

resetButton.addEventListener("click", () => {
  resetScene();
});

setupCustomSelect("colorDropdown", "colorSelect", () => {
  void updateModel();
});

setupCustomSelect("batteryDropdown", "batteryType", () => {
  void updateModel();
});

bindGlobalCustomSelectClose();

window.addEventListener("resize", () => {
  resize();
});

orbitToggleEl.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  orbitContainerEl.classList.toggle("open");
});

orbitPanelEl.querySelectorAll<HTMLButtonElement>("button").forEach((btn) => {
  btn.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const dir = btn.dataset.dir;
    if (!dir) return;

    rotateCamera(dir);
  });
});

drawTree();
void updateModel().then(() => {
  closeSidebar(sidebarWrapperEl);
});

start();