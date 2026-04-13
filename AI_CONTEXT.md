# Cochlear 3D Viewer

An interactive web application for visualizing and exploring 3D models of Cochlear Nucleus devices using Three.js.

---

## Project Overview

This application provides the following functionality:

- Visualization of 3D cochlear device models (GLB format)
- Selection of device color (beige, black, brown)
- Selection of battery type (long, short)
- Interactive component hierarchy displayed in a sidebar
- Camera focus on selected components
- Visibility control for individual parts
- Smooth reset of camera and scene state

---

## Technologies

The project is built using the following technologies:

- TypeScript
- Three.js
- Vite
- HTML5 and CSS3
- GLTF / GLB 3D models

---

## Project Structure

```

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
│               └── ...
│
├── src/
│   ├── main.ts          # Application entry point
│   ├── viewer.ts        # Scene, camera and rendering logic
│   ├── modelLoader.ts   # GLB loading and model processing
│   ├── tree.ts          # Component hierarchy (sidebar)
│   ├── ui.ts            # User interface logic
│   ├── style.css        # Application styling
│
├── index.html
├── package.json
├── tsconfig.json
└── README.md

```

---

## Getting Started

### Installation

```

npm install

```

### Run development server

```

npm run dev

```

The application will be available at:

```

[http://localhost:5173/](http://localhost:5173/)

```

---

## Features

### Model Customization

- Change device color
- Select battery type
- Models are dynamically reloaded

### Camera Controls

- Rotation using mouse drag
- Zoom using scroll
- Panning using middle mouse button
- Automatic focus on selected components

### Component Hierarchy

- Clicking a node focuses the camera on the selected component
- Checkboxes toggle visibility of parts
- Expandable and collapsible tree structure

### Reset Functionality

- Smoothly returns camera to the initial position
- Clears current selection
- Restores visibility of all components
- Resets the component tree

---

## Architecture

The project is organized into modular components:

| File              | Description |
|------------------|------------|
| viewer.ts        | Handles scene, camera and rendering |
| modelLoader.ts   | Loads and manages 3D models |
| tree.ts          | Renders the component hierarchy |
| ui.ts            | Manages user interface and interactions |
| main.ts          | Integrates all modules |

---

## 3D Models

All models are located in:

```

public/cochlear/nucleus7/

```

- Format: GLB
- Supports multiple variations of color and battery types

---

## Future Improvements

- Hover-based highlighting
- Synchronization between 3D selection and hierarchy
- Component animation
- Integrated documentation viewer (PDF or video)
- Mobile responsiveness

---

## Author

Armin Lišić

---

## License

This project is intended for educational purposes.