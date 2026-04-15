
# Cochlear 3D Viewer

An interactive web application for visualizing, exploring, and interacting with 3D Cochlear Nucleus device models using Three.js, TypeScript, and Vite.

---

## Project Overview

Cochlear 3D Viewer is a product-style interactive viewer built for exploring Cochlear Nucleus device models in a more intuitive and visually polished way.

The application currently supports:

- Visualization of 3D cochlear device models in GLB format
- Dynamic selection of device color
- Dynamic selection of battery type
- Sidebar-based component hierarchy
- Camera focus on selected components
- Visibility toggling for individual parts
- Hover highlight and selection highlight
- Bottom documentation modal for selected components
- Smooth camera reset
- Orbit quick-view controls
- Explode mode for animated part separation
- Light mode / dark mode switching
- Better touch interaction for mobile and tablet devices

---

## Main Features

### 1. Model Customization

The viewer allows switching between different visual and structural variants of the device.

Supported options:

#### Device colors
- Beige
- Black
- Brown

#### Battery types
- Long
- Short
- Disposable

When the main device color is changed, the battery is automatically loaded in the same selected color.

---

### 2. Interactive 3D Viewer

The application uses Three.js to render and control the scene.

Supported interactions:

- Rotation using mouse drag
- Zoom using scroll wheel
- Panning using middle mouse button
- Automatic camera focus on selected components
- Smooth animated camera reset
- Quick orbit directional views

---

### 3. Component Hierarchy

A sidebar-based hierarchy allows the user to explore device structure in a more organized way.

Supported hierarchy behavior:

- Expandable and collapsible tree structure
- Click on node to focus matching 3D object
- Checkbox-based visibility toggling
- Friendly component labels instead of raw GLB mesh names

---

### 4. Hover and Selection Highlighting

The viewer distinguishes between:

#### Hover highlight
- Triggered when the pointer moves over an object
- Used for lightweight visual feedback

#### Selection highlight
- Triggered when the object is selected
- Remains active until the modal closes or the scene resets

---

### 5. Component Documentation Modal

When a component is selected, a bottom modal opens with contextual information.

The modal can include:

- Component title
- Short component description
- Documentation links:
  - Schematics
  - Manual
  - Maintenance

---

### 6. Explode View

The viewer includes an explode feature for separating device parts with animated transitions.

Explode system capabilities:

- Per-component explode rules
- Direction-based movement
- Vector-based movement
- Optional multi-phase movement
- Optional rotation before movement
- Configurable animation duration
- Reset back to original state

This logic is separated into dedicated files for easier maintenance.

---

### 7. Theme Switching

The viewer supports:

- Light mode
- Dark mode

Theme switching affects:

- Scene background
- Grid appearance
- Floor appearance
- Theme toggle button state

The mode switch uses dedicated sun and moon SVG icons in the item bar.

---

### 8. Orbit Quick Controls

A compact orbit control panel is integrated into the item bar.

Supported quick directions:

- Up
- Left
- Right
- Down

These controls are useful for quickly jumping to specific viewing angles.

---

### 9. Touch Support

The application includes touch interaction support for mobile and tablet devices.

Supported or intended behavior:

- Double tap to select component
- Long press to open component
- Touch-based raycasting into the scene
- Better compatibility with touch devices than standard double-click-only behavior

---

## Technologies

The project is built using:

- TypeScript
- Three.js
- Vite
- HTML5
- CSS3
- GLTF / GLB 3D models

---

## Project Structure

```text
cochlear-viewer/
│
├── public/
│   └── cochlear/
│       └── nucleus7/
│           ├── body/
│           │   ├── nucleus7_body_beige.glb
│           │   ├── nucleus7_body_black.glb
│           │   └── nucleus7_body_brown.glb
│           │
│           └── battery/
│               ├── nucleus7_battery_long_beige.glb
│               ├── nucleus7_battery_short_beige.glb
│               ├── nucleus7_battery_disposable_beige.glb
│               └── ...
│
├── public/
│   └── docs/
│       ├── battery-schematics.pdf
│       ├── battery-manual.pdf
│       ├── battery-maintenance.pdf
│       └── ...
│
├── src/
│   ├── main.ts
│   ├── viewer.ts
│   ├── modelLoader.ts
│   ├── tree.ts
│   ├── ui.ts
│   ├── explode.ts
│   ├── explodeConfig.ts
│   ├── style.css
│
├── index.html
├── README.md
├── AI_CONTEXT.md
├── LICENSE.md
├── package.json
└── tsconfig.json
````

---

## File Responsibilities

| File               | Description                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| `main.ts`          | Main application integration, event listeners, selection logic, modal behavior, theme sync, explode sync |
| `viewer.ts`        | Scene creation, camera, renderer, controls, theme-related scene changes                                  |
| `modelLoader.ts`   | GLB loading, highlight logic, material restore helpers, object lookup utilities                          |
| `tree.ts`          | Component hierarchy rendering and behavior                                                               |
| `ui.ts`            | Sidebar logic, panel switching, custom dropdown behavior                                                 |
| `explode.ts`       | Explode controller and animated transform logic                                                          |
| `explodeConfig.ts` | Explode configuration rules per component                                                                |
| `style.css`        | Application layout, responsive styles, button styles, modal styles, theme and dropdown visuals           |
| `index.html`       | Main application structure                                                                               |

---

## Getting Started

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

Default local address:

```text
http://localhost:5173/
```

---

## Interaction Flow

### Desktop

* Move mouse over object → hover highlight
* Double click object → select component
* Click hierarchy node → focus and open component
* Click explode button → toggle exploded model view
* Click theme button → switch between dark and light mode
* Click reset → restore scene state
* Use orbit panel → jump to directional views

### Mobile / Tablet

* Double tap object → select component
* Long press object → select component
* Use touch orbit interaction
* Open documentation modal from selected component

---

## 3D Models

All 3D models are stored under:

```text
public/cochlear/nucleus7/
```

Format:

* GLB

The application supports multiple combinations of:

* Device color
* Battery type

---

## Documentation Assets

Documentation links are currently mapped to public PDF files.

Examples include:

* Battery schematics
* Battery manual
* Battery maintenance
* Connector-related documentation
* Microphone-related documentation
* Control button documentation

If no specific component mapping is found, a default documentation set can be used.

---

## UI Notes

The current interface includes:

* Floating sidebar
* Floating item bar
* Bottom component modal
* Fullscreen loading screen
* Custom dropdown fields
* SVG-based icon buttons
* Glassmorphism-inspired dark UI panels
* Border-enhanced panel styling
* Active-state visual feedback for controls such as explode and theme toggle

---

## Current Improvements Added

Compared to the earlier version, the viewer now includes:

* Hover highlight
* Persistent selection highlight
* Bottom documentation modal
* Explode animation system
* Separate explode configuration file
* Theme toggle with light/dark switching
* Orbit quick-view control panel
* Touch support improvements
* Better reset behavior
* Improved item bar icon consistency
* Styled color dropdown trigger based on selected color
* Better overall responsive UI polish

---

## Future Improvements

Possible future upgrades:

* More advanced explode animation paths
* Better symmetry between explode and reset movement
* Pivot-based rotation for specific parts
* Built-in PDF preview inside the app
* Search inside the component hierarchy
* Better accessibility and keyboard interaction
* Stronger mobile optimization
* Additional metadata-driven component descriptions
* Better branded loader animation

---

## Author

Armin Lišić

---

## License

This project is intended for educational purposes.