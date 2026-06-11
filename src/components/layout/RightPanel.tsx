import React from 'react';
import { useApps } from '@/hooks/useApps';
import { useUIStore } from '@/store/useUIStore';
import { NodeInspector } from '../inspector/NodeInspector';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Server } from 'lucide-react';

export const RightPanel: React.FC = () => {
  const { data: apps, isLoading } = useApps();
  const selectedAppId = useUIStore((state) => state.selectedAppId);
  const setSelectedApp = useUIStore((state) => state.setSelectedApp);

  return (
    <div className="flex flex-col h-full bg-card select-none">
      {/* Section 1: Apps */}
      <div className="p-4 flex flex-col gap-3 shrink-0">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Applications
        </h3>
        
        <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
          {isLoading ? (
            // App Skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-2 p-2 border border-border/30 rounded-lg">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))
          ) : (
            apps?.map((app) => {
              const isSelected = selectedAppId === app.id;
              return (
                <button
                  key={app.id}
                  onClick={() => setSelectedApp(app.id)}
                  className={cn(
                    "flex flex-col text-left p-2 rounded-lg border transition-all text-xs outline-none select-none",
                    isSelected
                      ? "bg-primary/5 border-primary/40 shadow-sm"
                      : "bg-transparent border-border/40 hover:bg-muted/40 hover:border-border/80"
                  )}
                >
                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                    <Server className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span>{app.name}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                    {app.description}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Divider */}
      <Separator className="bg-border/60" />

      {/* Section 2: Node Inspector */}
      <div className="flex-1 overflow-y-auto">
        <NodeInspector />
      </div>
    </div>
  );
};
