type ShowPanelDeps = {
  panelBody: HTMLDivElement;
  panelComponents: HTMLDivElement;
  sidebarWrapper: HTMLDivElement;
  itemBarButtons: HTMLButtonElement[];
};

export function openSidebar(sidebarWrapper: HTMLDivElement): void {
  sidebarWrapper.classList.remove("collapsed");
  sidebarWrapper.classList.add("expanded");
}

export function closeSidebar(sidebarWrapper: HTMLDivElement): void {
  sidebarWrapper.classList.remove("expanded");
  sidebarWrapper.classList.add("collapsed");
}

export function showPanel(
  panelName: string,
  deps: ShowPanelDeps
): void {
  const { panelBody, panelComponents, sidebarWrapper, itemBarButtons } = deps;

  panelBody.classList.add("hidden");
  panelComponents.classList.add("hidden");

  itemBarButtons.forEach((btn) => btn.classList.remove("active"));

  const activeBtn = itemBarButtons.find((btn) => btn.dataset.panel === panelName);
  if (activeBtn) {
    activeBtn.classList.add("active");
  }

  if (panelName === "body") {
    panelBody.classList.remove("hidden");
  } else {
    panelComponents.classList.remove("hidden");
  }

  openSidebar(sidebarWrapper);
}

export function setupCustomSelect(
  rootId: string,
  hiddenInputId: string,
  onChange: () => void
): void {
  const root = document.getElementById(rootId) as HTMLDivElement | null;
  const hiddenInput = document.getElementById(hiddenInputId) as HTMLInputElement | null;

  if (!root || !hiddenInput) return;

  const trigger = root.querySelector(".custom-select-trigger") as HTMLButtonElement | null;
  const valueEl = root.querySelector(".custom-select-value") as HTMLSpanElement | null;
  const options = Array.from(
    root.querySelectorAll<HTMLButtonElement>(".custom-select-option")
  );

  if (!trigger || !valueEl || options.length === 0) return;

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();

    document.querySelectorAll(".custom-select.open").forEach((select) => {
      if (select !== root) {
        select.classList.remove("open");
      }
    });

    root.classList.toggle("open");
  });

  options.forEach((option) => {
    option.addEventListener("click", () => {
      const nextValue = option.dataset.value ?? "";
      const nextLabel = option.textContent?.trim() ?? "";

      hiddenInput.value = nextValue;
      root.dataset.value = nextValue;
      valueEl.textContent = nextLabel;

      options.forEach((btn) => btn.classList.remove("active"));
      option.classList.add("active");

      root.classList.remove("open");
      onChange();
    });
  });
}

export function bindGlobalCustomSelectClose(): void {
  document.addEventListener("click", () => {
    document.querySelectorAll(".custom-select.open").forEach((select) => {
      select.classList.remove("open");
    });
  });
}