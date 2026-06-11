# App Graph Builder

A beautiful, interactive, and fully-featured application graph visualizer and configuration manager built using **React**, **TypeScript**, **Vite**, **@xyflow/react (React Flow)**, **Zustand**, and **TanStack React Query**.

This web application allows DevOps and platform engineers to inspect microservice topologies, monitor service health, scale replicas dynamically with synced slider/number inputs, and verify upstream resilience.

---

## 🚀 Key Features

1. **Interactive Node Canvas (@xyflow/react)**:
   - Dotted grid layout with custom styling, controls (zoom, pan, lock), and minimap.
   - Nodes can be selected to open detail configurations.
   - Pressing `Delete` or `Backspace` deletes a selected node dynamically from the local layout.

2. **Custom Status-Coded Service Nodes**:
   - Distinct double-handled layout (Left = Target, Right = Source).
   - Color-coded borders and glows indicating health status:
     - `Healthy` (Emerald)
     - `Degraded` (Amber)
     - `Down` (Rose)
   - Integrated live replicas indicator and truncated service labels.

3. **Synced Configuration Controls (Config Tab)**:
   - Live editable fields: Service name and description.
   - Dual-synced replicas controller: scaling between 0 and 100 via a smooth slider and numerical input side-by-side. Both inputs stay perfectly in sync.

4. **Detailed Performance Metrics (Runtime Tab)**:
   - Interactive deterministic charts showing CPU & Memory usage based on the unique Service ID.
   - Real-time uptime stats and last deployment timestamp logs.

5. **Fault Tolerance & Simulated API Failures**:
   - Simulated network query failures (~20% failure rate for "Auth Gateway").
   - Integrated canvas overlay with warning graphics and a "Retry Query" trigger to recover cleanly.

6. **Responsive Double Drawer Shell**:
   - Desktop layout: Left navigation rail, top control bar, central canvas, and a fixed right inspector column.
   - Mobile layout (<768px): Header actions open a custom slide-over drawer (`radix-ui` sheets) to manage applications and inspect services without clutter.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + TypeScript 6
- **Tooling**: Vite (ESModules, HMR, LightningCSS)
- **Canvas Engine**: `@xyflow/react` (v12)
- **State Management**: `zustand` (UI & global triggers)
- **Server Cache**: `@tanstack/react-query` (API hooks)
- **Styling**: TailwindCSS v3 + `postcss` + `autoprefixer`
- **UI Components**: Radix UI (Sheet, Tabs, Slider, Separator, Dialog)
- **Icons**: `lucide-react`

---

## 🏃 Getting Started

### 1. Installation
Install project dependencies using your preferred package manager:
```bash
npm install
```

### 2. Development Server
Start the local development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
Compile TypeScript code and build the production bundle:
```bash
npm run build
```
This minifies files and outputs compile assets into the `dist/` directory.

---

## 📁 Architecture Overview

- `src/types/`: Strict TypeScript declarations and graph schemas.
- `src/api/`: Mock database endpoints simulating API fetch delays and Gateway timeouts.
- `src/store/`: Zustand interface coordinates for UI panels, node selection, and fitView triggers.
- `src/hooks/`: TanStack Query cache loaders for applications list and graph structures.
- `src/components/canvas/`: Canvas containers, custom node handlers, grid lines, and minimaps.
- `src/components/inspector/`: Configuration sliders, metrics indicators, and tab shells.
- `src/components/layout/`: Top navigation, Left rail bars, Right Panels, and Mobile sheets.
