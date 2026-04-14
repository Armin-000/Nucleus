
# AI_CONTEXT.md

# Cochlear 3D Viewer

An interactive web application for visualizing, exploring, and interacting with 3D Cochlear Nucleus device models using Three.js, TypeScript, and Vite.

---

## Project Overview

This application is designed as an interactive 3D product viewer for Cochlear devices. It supports dynamic model switching, component exploration, visual highlighting, documentation access, and responsive UI behavior.

The viewer currently includes:

- Visualization of 3D cochlear device models in GLB format
- Dynamic switching of device body color
- Dynamic switching of battery type
- Sidebar-based component hierarchy
- Camera focus on selected objects
- Visibility toggling of individual model parts
- Hover highlight and selection highlight
- Bottom component documentation modal
- Fullscreen preload overlay with animated SVG/logo support
- Orbit quick-view controls in the item bar
- Smooth camera reset
- Better mobile and touch interaction support

---

## Current Functional Features

### 1. Model Loading

The application dynamically loads:

- Cochlear body model
- Matching battery model

The model depends on:

- Selected color
- Selected battery type

Supported color options:

- Beige
- Black
- Brown

Supported battery types:

- Long
- Short
- Disposable

The battery is loaded automatically in the same selected color as the main device body.

---

### 2. Fullscreen Preloader

A fullscreen loading overlay is shown while all required resources are loading.

Current preload behavior:

- Covers the full viewport
- Uses dark blurred background
- Prevents interaction until loading completes
- Supports animated SVG/logo instead of only percentage text
- Can display loading text such as `Loading model...`

Implementation notes:

- Loading uses `THREE.LoadingManager`
- Overlay visibility is controlled with `.loading` and `.loading.show`
- App root can be hidden with `#app.app-hidden` during initial load

---

### 3. Viewer and Scene

The Three.js scene includes:

- Perspective camera
- WebGL renderer
- OrbitControls
- Ambient light
- Directional lights
- Floor mesh
- Grid helper
- Root group for loaded models

Viewer logic is centralized in `viewer.ts`.

Main supported camera interactions:

- Mouse drag rotation
- Scroll zoom
- Middle mouse panning
- Auto-focus on chosen object
- Smooth animated reset

---

### 4. Component Hierarchy Sidebar

The sidebar includes two main panels:

#### Model settings panel
Contains:
- Color Cochlear custom dropdown
- Battery Type custom dropdown
- Informational text box

#### Components panel
Contains:
- Expandable component hierarchy tree
- Object selection by hierarchy node
- Visibility toggles by checkbox

Hierarchy selection behavior:

- Clicking a node focuses the camera on the matching model object
- Selected object gets highlighted
- Documentation modal opens with the correct title and links

Visibility behavior:

- Checkboxes toggle object visibility
- Visibility works by matching node object names to real model object names

---

### 5. Hover and Selection Highlighting

The app supports two separate visual states:

#### Hover highlight
- Triggered when mouse moves over a mesh
- Uses lighter highlight effect
- Removed when pointer leaves object

#### Selection highlight
- Triggered on double click or hierarchy click
- Uses stronger persistent highlight
- Removed when modal closes or scene resets

Material restoration is handled via stored original materials using a `WeakMap`.

---

### 6. Bottom Component Modal

A bottom modal is displayed when a component is selected.

The modal currently includes:

- Title of selected component
- Subtitle / description
- Three documentation action buttons:
  - Schematics
  - Manual
  - Maintenance

Important behavior:

- Modal opens on component selection
- Modal closes via SVG close button
- On close, current selected highlight is also removed
- Modal stays positioned at the bottom of the screen
- Modal size has been reduced and visually refined
- Close button was fixed to properly react to cursor/touch input

---

### 7. Correct Display Labels for Components

Raw GLB mesh names such as:

- `Cylinder019_1`
- `Cylinder009_3`

should not be shown to users.

Instead, the app maps selected mesh names to friendly hierarchy labels such as:

- Main Body
- Battery Module
- Control Button
- Indicator Light
- Microphone 1
- Connector
- Cable
- Magnet
- Slimline
- Earhook

This mapping is resolved by comparing normalized object names against hierarchy node definitions.

---

### 8. Orbit Quick View Controls

Orbit quick controls were added into the item bar.

Behavior:

- Rotation button is located above Help and Reset buttons
- Clicking the orbit button opens a vertical mini-panel
- The panel contains arrow buttons only
- Panel remains open until user explicitly closes it
- Buttons trigger quick camera view changes

Supported directions:

- Left
- Right
- Top
- Bottom

Notes:

- Left/right side views should remain stable and aligned
- Top/bottom views were adjusted to avoid camera flipping and upside-down orientation
- Bottom view can be kept or removed depending on current project preference
- Orbit panel is designed to work inside item bar, not as a separate top-right floating menu anymore

---

### 9. Reset Functionality

Global reset currently performs:

- Close custom selects
- Remove hover highlight
- Remove selected highlight
- Close bottom modal
- Restore visibility of all model objects
- Smoothly reset camera
- Rebuild hierarchy tree

Important adjustment:
- Reset should **not automatically reopen the sidebar**
- Reset should preserve clean scene state without forcing panel expansion

---

### 10. Touch Support for Mobile and Tablet

Touch interaction is planned or partially integrated for mobile/tablet devices.

Desired behavior:

- Double tap on object opens selected component
- Long press on object also opens selected component
- Should behave similarly to desktop double click
- Useful for tablets and touchscreens where standard double click is less natural

This should work by detecting touch positions and raycasting into the model.

---

## UI / UX Design Notes

The interface uses a glassmorphism-inspired dark sidebar and item bar.

### Main UI elements:
- Floating sidebar wrapper
- Main sidebar
- Slim vertical item bar
- Orbit quick controls
- Fullscreen loader
- Bottom modal
- Custom dropdown menus
- Hierarchy tree with toggles and checkboxes

### Styling direction:
- Rounded corners
- Dark transparent panels
- Blurred glass background
- White icons and typography
- Minimal grayscale accent palette
- Responsive resizing for smaller screens

---

## Custom Dropdown Behavior

The project uses custom dropdowns instead of native `<select>` elements.

### Color Cochlear dropdown
Now visually supports color indicators:

- Beige option has beige dot
- Black option has black dot
- Brown option has brown dot

This is handled using:
- `.color-option-content`
- `.color-dot`
- `.color-dot.beige`
- `.color-dot.black`
- `.color-dot.brown`

---

## Sidebar Footer Logo

A footer/logo section was added or prepared for the bottom of the sidebar.

### Purpose:
- Display SVG brand-related logo
- Act as visual footer for the sidebar
- Improve polish and product identity

### Notes:
- Implemented using `.sidebar-footer`
- SVG styled via `.sidebar-logo`
- Size reduced to avoid layout breaking
- Hover and active scaling effects added

---

## Technologies

The project is built using:

- TypeScript
- Three.js
- Vite
- HTML5
- CSS3
- GLTF / GLB models

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
│   ├── style.css
│
├── index.html
├── AI_CONTEXT.md
├── README.md
├── package.json
└── tsconfig.json
````

---

## Key Files and Responsibilities

| File             | Responsibility                                                                         |
| ---------------- | -------------------------------------------------------------------------------------- |
| `main.ts`        | Main integration logic, events, modal, selection, hover, orbit control, loading states |
| `viewer.ts`      | Three.js scene, camera, renderer, controls, fit/reset logic                            |
| `modelLoader.ts` | GLB loading, highlight materials, material restore, object lookup helpers              |
| `tree.ts`        | Rendering and managing hierarchy tree                                                  |
| `ui.ts`          | Sidebar behavior, panels, custom selects                                               |
| `style.css`      | Full project styling, responsive layout, loader, modal, orbit controls                 |
| `index.html`     | Main application layout and UI DOM structure                                           |

---

## Main Interaction Flow

### Desktop

* Move mouse over object → hover highlight
* Double click object → select object, focus camera, open modal
* Click hierarchy node → select matching object, focus camera, open modal
* Click reset → restore clean scene
* Click orbit quick button → open view controls
* Click orbit arrow → switch to quick view

### Mobile / Tablet

Planned or desired:

* Tap / double tap / long press to select component
* Touch-friendly sidebar behavior
* Responsive orbit controls
* Stable bottom modal layout

---

## 3D Model Matching Strategy

Because GLB mesh names may be inconsistent or technical, the project relies on normalized matching.

Normalization currently includes:

* Lowercasing names
* Replacing `_`, `-`, `.` with spaces
* Collapsing repeated spaces
* Matching hierarchy aliases against object names

This helps connect visible UI labels with internal GLB object names.

---

## Documentation Mapping Strategy

Selected objects resolve to documentation entries.

Each component can provide:

* `title`
* `subtitle`
* `schematics`
* `manual`
* `maintenance`

Examples:

* Battery → battery PDFs
* Connector → connector PDFs
* Control Button → control button PDFs
* Microphone → microphone PDFs

Fallback behavior:

* If no specific match is found, a default documentation set is used

---

## Current Important UI Decisions

### Kept

* Bottom modal stays at bottom
* Orbit control stays inside item bar
* Sidebar has footer/logo area
* Custom selects remain visually styled
* Fullscreen preloader remains active until load finishes

### Fixed

* Modal close button click area
* Selection highlight clearing on close
* Human-readable labels instead of mesh names
* Sidebar mobile sizing
* Orbit panel shown vertically
* Top/bottom orbit stability improvements
* Reset behavior not forcing sidebar reopen

---

## Known Limitations / Future Improvements

### Possible future improvements

* Better touch double tap recognition
* Long press selection for touch devices
* Smoother orbit transition animations
* More precise top/bottom camera presets
* Integrated in-app PDF preview instead of external links
* Better synchronization between tree visibility and selected state
* Search in component hierarchy
* Per-component metadata files
* Better accessibility labels and keyboard support
* Stronger mobile layout tuning
* Branded animated SVG preload
* Sidebar footer branding refinement

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

## Author

Armin Lišić

---

## License

This project is intended for educational purposes.