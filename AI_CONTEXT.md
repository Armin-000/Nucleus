
# AI_CONTEXT.md

# Cochlear 3D Viewer

An interactive web application for visualizing, exploring, and interacting with 3D Cochlear Nucleus device models using Three.js, TypeScript, and Vite.

---

## Project Overview

This application is designed as an interactive 3D product viewer for Cochlear devices. It supports dynamic model switching, component exploration, visual highlighting, documentation access, explode view behavior, theme switching, and responsive UI interaction.

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
- Explode mode with animated separation of model parts
- Light mode / dark mode switching
- Improved custom dropdown styling
- Better icon consistency and item bar polish

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

Important implementation notes:

- Model changes are asynchronous
- Request IDs are used to avoid race conditions when rapidly switching options
- Old loaded models are disposed correctly
- `modelRoot` is reset and re-centered after reload
- Explode state is reset when a new model is loaded

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
- Quick directional orbit positioning
- Theme-based visual changes for scene background, floor, and grid

Important viewer notes:

- Scene background can switch between light and dark theme variants
- Floor and grid colors can also change with theme
- Camera reset is animated with easing
- Initial camera state is stored and reused for reset

---

### 4. Component Hierarchy Sidebar

The sidebar includes two main panels.

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

The app supports two separate visual states.

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
- Modal now visually matches sidebar/itembar with border styling

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
- Orbit panel is designed to work inside item bar, not as a separate floating menu

---

### 9. Reset Functionality

Global reset currently performs:

- Close custom selects
- Remove hover highlight
- Remove selected highlight
- Close bottom modal
- Restore visibility of all model objects
- Reset explode state
- Smoothly reset camera
- Rebuild hierarchy tree

Important adjustment:

- Reset should **not automatically reopen the sidebar**
- Reset should preserve clean scene state without forcing panel expansion
- Reset button includes hover rotation animation for better visual feedback

---

### 10. Touch Support for Mobile and Tablet

Touch interaction is integrated for mobile/tablet devices.

Supported or intended behavior:

- Double tap on object opens selected component
- Long press on object also opens selected component
- Similar behavior to desktop double click
- Useful for tablets and touchscreens where standard double click is less natural

Touch support notes:

- Touch start / move / end are tracked
- Long press is cancelled if the finger moves too far
- Double tap compares time window and object name
- Raycasting is used for touch hit detection

---

## Explode System

### 11. Explode Mode

A dedicated explode system was added to separate model parts in an animated way.

Explode functionality is handled through:

- `explode.ts`
- `explodeConfig.ts`

The explode button is placed in the item bar near the main controls.

Current explode behavior supports:

- Per-object matching rules
- Direction-based movement
- Vector-based movement
- Optional second movement phase
- Optional manual offset
- Optional rotation
- Animation duration per rule
- Different movement logic for special parts

The explode button now supports active visual state:

- Normal state when explode is inactive
- Active highlighted state when explode is enabled

---

### 12. Explode Rules Structure

Each explode rule can define:

- `matchNames`
- `direction`
- `distance`
- `directionVector`
- `secondDirection`
- `secondDistance`
- `secondDirectionVector`
- `offset`
- `rotation`
- `rotationOrder`
- `animationDurationMs`
- `rotationFirst`

This allows precise control over how each component moves when exploded.

Examples of controlled components include:

- Battery group
- Connector group
- Cable
- Magnet
- Slimline
- Earhook
- Control button
- Indicator light
- Microphone 1
- Microphone 2
- Microphone cover

---

### 13. Explode Animation Behavior

The explode controller supports multi-phase movement.

Current logic:

- Objects can move in a first phase toward one target position
- Then continue into a second phase toward a final target position
- Rotation can happen before movement if `rotationFirst` is enabled
- Animation uses easing for smoother appearance

Important note:

- Explode behavior can be configured differently for different parts
- Some parts use directional offsets
- Some parts use custom vectors
- Some parts use secondary movement to better match real separation behavior

---

### 14. Reset After Explode

Exploded components can return to their original positions using reset or explode toggle.

Important implementation detail:

- Original transforms are cached using a `WeakMap`
- Reset logic now considers animated return paths
- Matching explode rules affect how objects separate and how they return
- The return path may use intermediate positions, depending on current explode rule logic

This was refined because simple linear reset did not always visually match the separation path of components that moved diagonally or in multiple phases.

---

### 15. Explode-Specific Visual Adjustments

Several components were manually tuned for better explode presentation.

Examples of tuning include:

- Earhook moving downward and outward
- Battery rotating before dropping downward
- Magnet moving right and then outward
- Small top components such as microphones, indicator, and control button moving upward with additional custom offset
- More natural part spacing and clearer exploded readability

Notes:

- Some components required custom offsets rather than simple axis movement
- Some parts visually behave better using `directionVector`
- Some parts required secondary motion phases for more realistic separation

---

## Theme System

### 16. Light / Dark Mode

A theme toggle button was added under the Rotate control in the item bar.

Theme switching supports:

- Light mode
- Dark mode

The button uses two SVG icons:

- Sun icon
- Moon icon

The icon visually changes depending on active state.

Theme system behavior:

- Toggle button changes active class
- Scene visuals are updated from viewer logic
- Grid and floor colors can change per theme
- Background color can change per theme
- UI button state is synchronized from `main.ts`

---

### 17. Theme UI Notes

The theme button:

- Lives inside the item bar
- Uses stacked icons with opacity/scale transitions
- Indicates current state using `.active`
- Updates tooltip text depending on current mode

Visual notes:

- Sun icon is shown in one state
- Moon icon is shown in the opposite state
- Icons are centered and animated

---

## UI / UX Design Notes

The interface uses a glassmorphism-inspired dark sidebar and item bar.

### Main UI elements

- Floating sidebar wrapper
- Main sidebar
- Slim vertical item bar
- Orbit quick controls
- Explode button
- Theme toggle button
- Fullscreen loader
- Bottom modal
- Custom dropdown menus
- Hierarchy tree with toggles and checkboxes

### Styling direction

- Rounded corners
- Dark transparent panels
- Blurred glass background
- White icons and typography
- Minimal grayscale accent palette
- Responsive resizing for smaller screens
- Borders added to main floating UI panels for a clearer premium look

---

## Custom Dropdown Behavior

The project uses custom dropdowns instead of native `<select>` elements.

### Color Cochlear dropdown

Supports:

- Beige option
- Black option
- Brown option

Originally the dropdown used only small dots for color indication.

This was later extended so that the selected trigger button itself can visually reflect the active color.

Current behavior:

- Beige selection colors the trigger in beige/gold tones
- Black selection colors the trigger in dark tones
- Brown selection colors the trigger in brown tones

Implementation notes:

- `main.ts` adds the selected color class to `#colorDropdown`
- `syncColorDropdownStyle()` updates class names
- CSS uses:
  - `#colorDropdown.beige .custom-select-trigger`
  - `#colorDropdown.black .custom-select-trigger`
  - `#colorDropdown.brown .custom-select-trigger`

The trigger text and arrow use inherited color so the selected theme looks consistent.

---

## Sidebar Footer Logo

A footer/logo section was added for the bottom of the sidebar.

### Purpose

- Display SVG brand-related logo
- Act as visual footer for the sidebar
- Improve polish and product identity

### Notes

- Implemented using `.sidebar-footer`
- SVG styled via `.sidebar-logo`
- Size reduced to avoid layout breaking

---

## Icon and Button Styling Notes

### 18. SVG Icon Consistency

A major styling pass was done for item bar icons so that all SVG buttons visually align better.

Improvements include:

- Unified icon sizing through shared CSS variable
- Better scaling for explode, theme, orbit, help, reset, and panel buttons
- Improved visual consistency between custom SVGs and stroke-based icons
- Better hover feedback

Current relevant style approach:

- `--itembar-icon-size`
- shared width and height rules for button SVGs
- `vector-effect: non-scaling-stroke` for more stable stroke rendering

---

### 19. Border Styling

The following major UI containers now support visible border styling:

- Sidebar
- Item bar
- Bottom modal

This was added to make the UI panels feel more defined and premium.

Examples:

- `#sidebar`
- `#itembar`
- `.component-modal-inner`

---

### 20. Reset Button Hover Animation

The reset button was enhanced with animated rotation on hover.

Behavior:

- SVG rotates on hover
- Slight scale-up on hover
- Slight press feedback on active state

This is implemented in CSS using transform transitions on `#resetBtn svg`.

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
│   ├── explode.ts
│   ├── explodeConfig.ts
│   ├── style.css
│
├── index.html
├── AI_CONTEXT.md
├── README.md
├── LICENSE.md
├── package.json
└── tsconfig.json
````

---

## Key Files and Responsibilities

| File               | Responsibility                                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `main.ts`          | Main integration logic, events, modal, selection, hover, orbit control, theme sync, explode sync, loading states |
| `viewer.ts`        | Three.js scene, camera, renderer, controls, theme switching, fit/reset logic                                     |
| `modelLoader.ts`   | GLB loading, highlight materials, material restore, object lookup helpers                                        |
| `tree.ts`          | Rendering and managing hierarchy tree                                                                            |
| `ui.ts`            | Sidebar behavior, panels, custom selects                                                                         |
| `explode.ts`       | Explode controller logic, original transform cache, animated separation/reset                                    |
| `explodeConfig.ts` | Per-component explode behavior rules                                                                             |
| `style.css`        | Full project styling, responsive layout, loader, modal, orbit controls, theme icons, dropdown visuals            |
| `index.html`       | Main application layout and UI DOM structure                                                                     |

---

## Main Interaction Flow

### Desktop

* Move mouse over object → hover highlight
* Double click object → select object, focus camera, open modal
* Click hierarchy node → select matching object, focus camera, open modal
* Click explode → toggle exploded model view
* Click theme toggle → switch between light and dark mode
* Click reset → restore clean scene
* Click orbit quick button → open view controls
* Click orbit arrow → switch to quick view

### Mobile / Tablet

* Double tap object → select component
* Long press object → select component
* Touch-friendly modal and sidebar behavior
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
* Main viewer structure remains centered around `main.ts` + `viewer.ts`

### Added

* Explode system
* Separate explode config
* Theme toggle
* Active explode button state
* Border lines for major floating UI panels
* Selected color styling for Color Cochlear dropdown trigger
* Better item bar SVG consistency
* Reset hover animation

### Fixed

* Modal close button click area
* Selection highlight clearing on close
* Human-readable labels instead of mesh names
* Sidebar mobile sizing
* Orbit panel shown vertically
* Top/bottom orbit stability improvements
* Reset behavior not forcing sidebar reopen
* Explode reset state syncing after model reload
* Better synchronization between UI button active state and internal explode/theme state

---

## Known Limitations / Future Improvements

### Possible future improvements

* Better touch double tap recognition
* Long press refinement for touch devices
* More advanced explode path symmetry between apply and reset
* True pivot-based rotation for certain parts such as battery or magnet
* More precise top/bottom camera presets
* Integrated in-app PDF preview instead of external links
* Better synchronization between tree visibility and selected state
* Search in component hierarchy
* Per-component metadata files
* Better accessibility labels and keyboard support
* Stronger mobile layout tuning
* Branded animated SVG preload refinement
* Sidebar footer branding refinement
* More advanced per-part animation sequencing

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