import React from 'react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useUIStore } from '@/store/useUIStore';
import { RightPanel } from './RightPanel';

export const MobileDrawer: React.FC = () => {
  const isMobilePanelOpen = useUIStore((state) => state.isMobilePanelOpen);
  const setMobilePanelOpen = useUIStore((state) => state.setMobilePanelOpen);

  return (
    <Sheet open={isMobilePanelOpen} onOpenChange={setMobilePanelOpen}>
      <SheetContent side="right" className="w-[300px] p-0 border-l border-border bg-card flex flex-col h-full">
        {/* Accessible title for screen readers */}
        <SheetTitle className="sr-only">Application and Service Settings</SheetTitle>
        <RightPanel />
      </SheetContent>
    </Sheet>
  );
};
