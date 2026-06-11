import { create } from 'zustand';

interface UIState {
  selectedAppId: string | null;
  selectedNodeId: string | null;
  isMobilePanelOpen: boolean;
  activeInspectorTab: 'config' | 'runtime';
  fitViewTrigger: number;
  addNodeTrigger: number;

  setSelectedApp: (id: string) => void;
  setSelectedNode: (id: string | null) => void;
  toggleMobilePanel: () => void;
  setMobilePanelOpen: (open: boolean) => void;
  setActiveTab: (tab: 'config' | 'runtime') => void;
  triggerFitView: () => void;
  triggerAddNode: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedAppId: 'app-1', // Default to app-1 as required
  selectedNodeId: null,
  isMobilePanelOpen: false,
  activeInspectorTab: 'config',
  fitViewTrigger: 0,
  addNodeTrigger: 0,

  setSelectedApp: (id) =>
    set({
      selectedAppId: id,
      selectedNodeId: null, // Reset node selection when switching apps
    }),
  setSelectedNode: (id) => set({ selectedNodeId: id }),
  toggleMobilePanel: () => set((state) => ({ isMobilePanelOpen: !state.isMobilePanelOpen })),
  setMobilePanelOpen: (open) => set({ isMobilePanelOpen: open }),
  setActiveTab: (tab) => set({ activeInspectorTab: tab }),
  triggerFitView: () => set((state) => ({ fitViewTrigger: state.fitViewTrigger + 1 })),
  triggerAddNode: () => set((state) => ({ addNodeTrigger: state.addNodeTrigger + 1 })),
}));
