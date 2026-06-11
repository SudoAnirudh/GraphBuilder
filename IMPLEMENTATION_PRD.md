# Implementation PRD — App Graph Builder

> Take-home task · Frontend Intern · ReactFlow Canvas

---

## 1. Overview

A browser-based "App Graph Builder" that lets users select an application, visualise its service dependency graph on a ReactFlow canvas, and inspect/edit individual service nodes via a right-side panel. All data is served from in-memory mock APIs; no backend is required.

**Outcome:** A well-structured, strictly-typed Vite/React codebase that a reviewer can `npm install && npm run dev` and immediately evaluate against every checklist item.

---

## 2. Repository Scaffold

```
app-graph-builder/
├── public/
├── src/
│   ├── api/               # Mock API layer (setTimeout-based)
│   │   ├── apps.ts
│   │   └── graph.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TopBar.tsx
│   │   │   ├── LeftRail.tsx
│   │   │   ├── RightPanel.tsx
│   │   │   └── MobileDrawer.tsx
│   │   ├── canvas/
│   │   │   ├── AppCanvas.tsx
│   │   │   └── ServiceNode.tsx   # custom ReactFlow node
│   │   └── inspector/
│   │       ├── NodeInspector.tsx
│   │       ├── ConfigTab.tsx
│   │       └── RuntimeTab.tsx
│   ├── hooks/
│   │   ├── useApps.ts            # TanStack Query wrapper
│   │   └── useAppGraph.ts        # TanStack Query wrapper
│   ├── store/
│   │   └── useUIStore.ts         # Zustand store
│   ├── types/
│   │   └── index.ts              # shared TS interfaces
│   ├── App.tsx
│   └── main.tsx
├── .eslintrc.cjs
├── .prettierrc
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

---

## 3. Type Definitions (`src/types/index.ts`)

```ts
// App list
export interface App {
  id: string;
  name: string;
  description: string;
}

// Node statuses
export type NodeStatus = 'Healthy' | 'Degraded' | 'Down';

// Custom data attached to every ReactFlow node
export interface ServiceNodeData {
  label: string;
  description: string;
  status: NodeStatus;
  replicas: number;          // 0–100, drives the synced slider
}

// Graph API response
export interface GraphResponse {
  nodes: import('@xyflow/react').Node<ServiceNodeData>[];
  edges: import('@xyflow/react').Edge[];
}
```

All component props and hook return values must be explicitly typed. No `any`.

---

## 4. Mock API Layer (`src/api/`)

Use plain `Promise` + `setTimeout` — no MSW required.

### `apps.ts`

```ts
const APPS: App[] = [
  { id: 'app-1', name: 'Payments Service', description: 'Handles all payment flows' },
  { id: 'app-2', name: 'Auth Gateway',     description: 'OAuth2 + JWT issuer' },
  { id: 'app-3', name: 'Notification Hub', description: 'Email / SMS dispatcher' },
];

export const fetchApps = (): Promise<App[]> =>
  new Promise((res) => setTimeout(() => res(APPS), 600));
```

### `graph.ts`

Return different node sets per `appId`. App `app-2` must randomly throw ~20 % of the time so the error state is testable in normal use.

```ts
export const fetchGraph = (appId: string): Promise<GraphResponse> =>
  new Promise((res, rej) => {
    setTimeout(() => {
      if (appId === 'app-2' && Math.random() < 0.2) {
        return rej(new Error('Upstream timeout — graph unavailable'));
      }
      res(GRAPHS[appId] ?? GRAPHS['app-1']);
    }, 800);
  });
```

Each graph must contain **≥ 3 nodes** and **≥ 2 edges**.

---

## 5. Zustand Store (`src/store/useUIStore.ts`)

```ts
interface UIState {
  selectedAppId: string | null;
  selectedNodeId: string | null;
  isMobilePanelOpen: boolean;
  activeInspectorTab: 'config' | 'runtime';

  setSelectedApp: (id: string) => void;
  setSelectedNode: (id: string | null) => void;
  toggleMobilePanel: () => void;
  setMobilePanelOpen: (open: boolean) => void;
  setActiveTab: (tab: 'config' | 'runtime') => void;
}
```

**Rules:**
- No server data stored here (that lives in TanStack Query cache).
- Node data mutations (e.g. slider value, label edits) go through `useReactFlow().setNodes` inside the canvas component and are **not** duplicated in Zustand.
- `selectedAppId` defaults to `'app-1'` so the canvas is not empty on first load.

---

## 6. TanStack Query Hooks

### `useApps.ts`

```ts
export const useApps = () =>
  useQuery({ queryKey: ['apps'], queryFn: fetchApps, staleTime: 60_000 });
```

### `useAppGraph.ts`

```ts
export const useAppGraph = (appId: string | null) =>
  useQuery({
    queryKey: ['graph', appId],
    queryFn: () => fetchGraph(appId!),
    enabled: appId !== null,
    staleTime: 30_000,
    retry: 1,
  });
```

Query client must be created once in `main.tsx` and passed via `QueryClientProvider`.

---

## 7. Layout Components

### 7.1 `TopBar`

| Element | Detail |
|---|---|
| Brand mark | Icon + "GraphBuilder" text, left-aligned |
| Fit View button | Calls `reactFlowInstance.fitView()` via a ref passed up or Zustand action |
| Notification icon (placeholder) | shadcn `Button` variant ghost |
| User avatar (placeholder) | 32 px circle, initials |
| Mobile menu button | Only visible on `< md`; toggles `isMobilePanelOpen` |

Height: 48 px. Full-width. `z-50`.

### 7.2 `LeftRail`

Width: 48 px, full-height minus TopBar. Icon-only buttons using lucide-react:

- **Grid** — Apps (active state)
- **GitBranch** — Graphs (static)
- **Settings** — Settings (static)

Active item gets a subtle background highlight. No routing required; purely visual.

### 7.3 `RightPanel` (desktop) / `MobileDrawer` (mobile)

**Desktop** (`≥ md`): fixed 280 px right column.  
**Mobile** (`< md`): slide-over sheet using shadcn `Sheet`, `open` driven by `isMobilePanelOpen`.

Panel structure (top to bottom):

1. **Apps section** — list of apps from `useApps()`. Loading → skeleton rows. Each row: app name + description. Selected app highlighted. Clicking sets `selectedAppId`.

2. **Divider**

3. **Node Inspector** — only renders when `selectedNodeId` is set. See §8.

---

## 8. Node Inspector (`src/components/inspector/`)

### `NodeInspector.tsx`

Reads `selectedNodeId` from Zustand. Looks up the node from React Flow's `useNodes()` hook (or receives it as a prop from the canvas). Renders:

```
┌─────────────────────────────┐
│  api-gateway          [●Healthy] │  ← status badge
├─────────────────────────────┤
│  [Config]  [Runtime]          │  ← shadcn Tabs
├─────────────────────────────┤
│  (tab content)               │
└─────────────────────────────┘
```

**Status badge colours:**

| Status | Colour |
|---|---|
| Healthy | `bg-green-100 text-green-700` |
| Degraded | `bg-yellow-100 text-yellow-700` |
| Down | `bg-red-100 text-red-700` |

### `ConfigTab.tsx`

- **Name** — `<Input>` bound to `node.data.label`. On change → `setNodes` to update.
- **Description** — `<Textarea>` bound to `node.data.description`.
- **Replicas** — `<Slider min={0} max={100}>` + `<Input type="number">` side-by-side. Both read from and write to `node.data.replicas`. Synced: slider `onValueChange` updates state, number input `onChange` clamps to [0,100] and updates same state.

### `RuntimeTab.tsx`

Static/illustrative fields (no mutation required):
- CPU usage (progress bar mock)
- Memory usage (progress bar mock)
- Uptime (static string per node)
- Last deployed (static date)

---

## 9. Canvas (`src/components/canvas/`)

### `AppCanvas.tsx`

```
┌──────────────────────────────────────────────┐
│  ReactFlow                                    │
│   ┌──────┐        ┌──────────┐               │
│   │  DB  │───────▶│  API GW  │──────┐        │
│   └──────┘        └──────────┘      │        │
│                                ┌────▼─────┐  │
│                                │  Worker  │  │
│                                └──────────┘  │
│                                               │
│  [dots background]             [Controls]    │
└──────────────────────────────────────────────┘
```

**Initialisation flow:**
1. `useAppGraph(selectedAppId)` returns `{ nodes, edges, isLoading, isError }`.
2. On data change: `setNodes(data.nodes)`, `setEdges(data.edges)`, then `fitView({ duration: 300 })`.
3. Loading state: overlay spinner centered on canvas.
4. Error state: centered error card with message + "Retry" button calling `queryClient.invalidateQueries`.

**Interactions:**
- `onNodeClick`: calls `setSelectedNode(node.id)`.
- `onPaneClick`: calls `setSelectedNode(null)`.
- `onKeyDown` on canvas wrapper (or ReactFlow `deleteKeyCode`): delete selected node with `Delete` / `Backspace`.
- Drag: default ReactFlow dragging, no override needed.
- Zoom / pan: default.

**Background:** `<Background variant={BackgroundVariant.Dots} gap={16} size={1} />`.

**Controls:** `<Controls />` bottom-left (ReactFlow built-in).

**MiniMap:** optional, can be included.

### `ServiceNode.tsx`

Custom node type registered as `nodeTypes={{ service: ServiceNode }}`.

```
┌─────────────────────┐
│  ● api-gateway       │
│  ──────────────────  │
│  [Healthy]           │
└─────────────────────┘
```

- Border: `2px solid` with colour mapped to status (green/yellow/red).
- Selected state: ring highlight (use ReactFlow's `selected` prop).
- Source and target handles on left/right.

---

## 10. App Entry (`App.tsx`)

```tsx
<QueryClientProvider client={queryClient}>
  <div className="flex flex-col h-screen overflow-hidden">
    <TopBar />
    <div className="flex flex-1 overflow-hidden">
      <LeftRail />
      <main className="flex-1 relative overflow-hidden">
        <ReactFlowProvider>
          <AppCanvas />
        </ReactFlowProvider>
      </main>
      {/* Desktop only */}
      <aside className="hidden md:block w-[280px] border-l overflow-y-auto">
        <RightPanel />
      </aside>
    </div>
  </div>
  {/* Mobile drawer — always mounted, visibility driven by Zustand */}
  <MobileDrawer />
</QueryClientProvider>
```

---

## 11. Tooling Configuration

### `tsconfig.json` (strict flags required)

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "exactOptionalPropertyTypes": true,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

### ESLint (`.eslintrc.cjs`)

```js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/strict',
    'plugin:react-hooks/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    'react/prop-types': 'off',
  },
};
```

### `package.json` scripts

```json
{
  "scripts": {
    "dev":       "vite",
    "build":     "tsc -p tsconfig.json && vite build",
    "preview":   "vite preview",
    "lint":      "eslint src --ext .ts,.tsx --max-warnings 0",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## 12. shadcn/ui Components to Install

Run `npx shadcn-ui@latest add` for each:

- `button`
- `input`
- `textarea`
- `badge`
- `tabs`
- `slider`
- `skeleton`
- `sheet` (for mobile drawer)
- `separator`

---

## 13. Dependencies

```
@xyflow/react          ^12.x
@tanstack/react-query  ^5.x
zustand                ^4.x
lucide-react           ^0.x
tailwindcss            ^3.x
```

---

## 14. Responsive Breakpoints

| Breakpoint | Behaviour |
|---|---|
| `< 768px` (mobile) | LeftRail hidden, right panel hidden, TopBar shows hamburger, `MobileDrawer` used |
| `768–1024px` (tablet) | LeftRail visible (48 px), right panel visible (260 px) |
| `> 1024px` (desktop) | Full layout as designed |

---

## 15. Implementation Sequence

Build in this order to keep a working state at each step:

1. **Scaffold** — Vite + TS + Tailwind + shadcn init. Confirm `npm run dev` works.
2. **Types** — Define all interfaces in `src/types/index.ts`.
3. **Mock API** — Implement `fetchApps` and `fetchGraph`. Test with a throwaway `console.log`.
4. **Zustand store** — Implement `useUIStore`. Test with React DevTools.
5. **TanStack Query hooks** — Wrap mock APIs. Verify loading/error states manually.
6. **Layout shell** — `TopBar`, `LeftRail`, empty `RightPanel`, empty `main`. Confirm responsive layout.
7. **Canvas** — `AppCanvas` with `ReactFlowProvider`, `Background`, `Controls`. Hard-code 3 nodes initially.
8. **ServiceNode** — Custom node type with status-coloured border.
9. **Wire graph data** — Replace hard-coded nodes with `useAppGraph` result. Implement loading/error overlays.
10. **Node interactions** — Click → `setSelectedNode`, pane click → clear, delete key → remove node.
11. **Apps list in RightPanel** — Render app list from `useApps`. Click sets `selectedAppId`.
12. **NodeInspector** — Status badge, Tabs, ConfigTab with synced slider/input, RuntimeTab.
13. **Mobile drawer** — Wrap `RightPanel` in shadcn `Sheet`. Wire `isMobilePanelOpen`.
14. **Fit View** — TopBar button calls `fitView`.
15. **Lint + typecheck pass** — Run `npm run lint && npm run typecheck`. Fix all errors.
16. **README** — Setup instructions, decisions, known limitations.

---

## 16. README Template

```markdown
# App Graph Builder

## Setup
npm install
npm run dev

## Key Decisions
- **Mock API via setTimeout**: simpler than MSW for a take-home; same async contract.
- **Node data mutations via setNodes**: keeps ReactFlow as the source of truth for node state; Zustand only tracks selection IDs.
- **Custom ServiceNode**: allows status-aware styling without CSS overrides on default nodes.
- **MobileDrawer always mounted**: avoids remount cost; open/close is a CSS transform.

## Known Limitations
- Deleted nodes re-appear on app switch (graph refetch restores original data).
- No edge deletion UI (Delete key only targets nodes).
- Runtime tab is illustrative — values are not tied to real node data.
```

---

## 17. Acceptance Checklist

| # | Requirement | Signal |
|---|---|---|
| 1 | Top bar renders with brand + Fit + actions | Visual |
| 2 | Left rail renders icon nav | Visual |
| 3 | Right panel shows app list + node inspector | Visual |
| 4 | Canvas has dotted background | Visual |
| 5 | ≥ 3 nodes, ≥ 2 edges on load | Visual |
| 6 | Nodes are draggable | Interaction |
| 7 | Click node → inspector opens | Interaction |
| 8 | Delete/Backspace removes selected node | Interaction |
| 9 | Zoom + pan work | Interaction |
| 10 | Fit View button works | Interaction |
| 11 | Status badge reflects node status | Visual |
| 12 | Config and Runtime tabs switch | Interaction |
| 13 | Slider and number input stay in sync | Interaction |
| 14 | Slider value persists to node data | State |
| 15 | App list loads with skeleton during fetch | Visual |
| 16 | Selecting different app refetches graph | State |
| 17 | Error state shown on graph fetch failure | Visual |
| 18 | Retry button re-queries | Interaction |
| 19 | Right panel becomes drawer on mobile | Responsive |
| 20 | `npm run lint` exits 0 | Tooling |
| 21 | `npm run typecheck` exits 0 | Tooling |
| 22 | `npm run build` succeeds | Tooling |
