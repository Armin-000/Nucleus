export type TreeNode = {
  label: string;
  objectNames?: string[];
  children?: TreeNode[];
  defaultExpanded?: boolean;
};

type RenderTreeOptions = {
  container: HTMLDivElement;
  data: TreeNode[];
  onNodeClick: (node: TreeNode) => void;
  onVisibilityChange: (node: TreeNode, visible: boolean) => void;
};

function createTreeNodeElement(
  node: TreeNode,
  onNodeClick: (node: TreeNode) => void,
  onVisibilityChange: (node: TreeNode, visible: boolean) => void,
  depth = 0
): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "tree-group";

  const row = document.createElement("div");
  row.className = `tree-row depth-${Math.min(depth, 3)}`;

  const hasChildren = !!node.children?.length;
  const isExpanded = node.defaultExpanded ?? false;

  let childrenContainer: HTMLDivElement | null = null;

  if (hasChildren) {
    const toggle = document.createElement("button");
    toggle.className = "tree-toggle";
    toggle.type = "button";
    toggle.textContent = isExpanded ? "−" : "+";
    row.appendChild(toggle);

    toggle.addEventListener("click", () => {
      if (!childrenContainer) return;
      const collapsed = childrenContainer.classList.toggle("collapsed");
      toggle.textContent = collapsed ? "+" : "−";
    });
  } else {
    const spacer = document.createElement("div");
    spacer.className = "tree-spacer";
    row.appendChild(spacer);
  }

  const label = document.createElement("div");
  label.className = "tree-label";
  label.textContent = node.label;
  label.addEventListener("click", () => {
    onNodeClick(node);
  });
  row.appendChild(label);

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "tree-check";
  checkbox.checked = true;
  checkbox.addEventListener("change", () => {
    onVisibilityChange(node, checkbox.checked);
  });
  row.appendChild(checkbox);

  wrapper.appendChild(row);

  if (hasChildren) {
    childrenContainer = document.createElement("div");
    childrenContainer.className = "children";

    if (!isExpanded) {
      childrenContainer.classList.add("collapsed");
    }

    node.children!.forEach((childNode) => {
      childrenContainer!.appendChild(
        createTreeNodeElement(childNode, onNodeClick, onVisibilityChange, depth + 1)
      );
    });

    wrapper.appendChild(childrenContainer);
  }

  return wrapper;
}

export function renderTree({
  container,
  data,
  onNodeClick,
  onVisibilityChange,
}: RenderTreeOptions): void {
  container.innerHTML = "";

  data.forEach((node) => {
    container.appendChild(
      createTreeNodeElement(node, onNodeClick, onVisibilityChange, 0)
    );
  });
}