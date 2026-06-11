import { ReactFlowProvider } from '@xyflow/react';
import { TopBar } from '@/components/layout/TopBar';
import { LeftRail } from '@/components/layout/LeftRail';
import { AppCanvas } from '@/components/canvas/AppCanvas';
import { RightPanel } from '@/components/layout/RightPanel';
import { MobileDrawer } from '@/components/layout/MobileDrawer';

function App() {
  return (
    <ReactFlowProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground antialiased font-sans">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <LeftRail />
          <main className="flex-1 relative overflow-hidden bg-muted/10">
            <AppCanvas />
          </main>
          {/* Desktop only right panel */}
          <aside className="hidden md:block w-[280px] border-l border-border overflow-y-auto shrink-0 bg-card">
            <RightPanel />
          </aside>
        </div>
      </div>
      {/* Mobile drawer — always mounted, visibility driven by Zustand */}
      <MobileDrawer />
    </ReactFlowProvider>
  );
}

export default App;
