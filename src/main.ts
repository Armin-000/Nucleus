import "./style.css";
import * as THREE from "three";
import { createViewer } from "./viewer";
import {
  applyHighlight,
  centerModelGroup,
  disposeObject,
  findBestObjectByNames,
  getBatteryPath,
  getBodyPath,
  loadGLB,
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
type BatteryType = "long" | "short";

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

if (
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
  !panelComponents
) {
  throw new Error("Nedostaje jedan ili više HTML elemenata.");
}

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
const { modelRoot, fitCameraToObject, resetCameraSmooth, start, resize } = viewerContext;

let currentBody: THREE.Object3D | null = null;
let currentBattery: THREE.Object3D | null = null;
let latestRequestId = 0;
let selectedObject: THREE.Object3D | null = null;

function setLoading(isLoading: boolean): void {
  loadingElement.classList.toggle("show", isLoading);
}

function closeAllCustomSelects(): void {
  document.querySelectorAll(".custom-select.open").forEach((select) => {
    select.classList.remove("open");
  });
}

function clearSelection(): void {
  if (selectedObject) {
    restoreObjectMaterials(selectedObject);
    selectedObject = null;
  }
}

function clearCurrentModels(): void {
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
  clearSelection();
  selectedObject = object;
  applyHighlight(object);
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
  clearSelection();

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
    resetCameraSmooth();
  }

  drawTree();

  showPanel("body", {
    panelBody: panelBodyEl,
    panelComponents: panelComponentsEl,
    sidebarWrapper: sidebarWrapperEl,
    itemBarButtons,
  });
}

async function updateModel(): Promise<void> {
  const requestId = ++latestRequestId;

  const color = colorInput.value as ColorOption;
  const batteryType = batteryTypeInput.value as BatteryType;

  setLoading(true);

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
  } catch (error) {
    console.error("Greška pri učitavanju modela:", error);
    alert("Greška pri učitavanju modela. Provjeri putanje i nazive GLB datoteka.");
  } finally {
    if (requestId === latestRequestId) {
      setLoading(false);
    }
  }
}

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

helpButton.addEventListener("click", () => {
  alert("Ovdje kasnije možeš spojiti Help dokument ili modal.");
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

drawTree();
void updateModel().then(() => {
  closeSidebar(sidebarWrapperEl);
});
start();