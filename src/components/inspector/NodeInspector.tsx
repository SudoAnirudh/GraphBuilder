import React from 'react';
import { useNodes } from '@xyflow/react';
import type { Node } from '@xyflow/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useUIStore } from '@/store/useUIStore';
import { ConfigTab } from './ConfigTab';
import { RuntimeTab } from './RuntimeTab';
import type { ServiceNodeData } from '@/types';
import { cn } from '@/lib/utils';

export const NodeInspector: React.FC = () => {
  const selectedNodeId = useUIStore((state) => state.selectedNodeId);
  const activeInspectorTab = useUIStore((state) => state.activeInspectorTab);
  const setActiveTab = useUIStore((state) => state.setActiveTab);

  const nodes = useNodes();
  const node = nodes.find((n) => n.id === selectedNodeId) as Node<ServiceNodeData> | undefined;

  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center h-48 px-4 text-center select-none">
        <p className="text-xs text-muted-foreground">No service selected</p>
        <p className="text-[10px] text-muted-foreground/75 mt-1">
          Click any service node in the canvas to inspect its configuration and metrics.
        </p>
      </div>
    );
  }

  const { label, status } = node.data;

  // Status badge style mapping
  const statusColors = {
    Healthy: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400 border-green-200/50',
    Degraded: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400 border-yellow-200/50',
    Down: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border-red-200/50',
  }[status] || 'bg-muted text-muted-foreground';

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Inspector Header: Node Title + Status Badge */}
      <div className="p-4 border-b border-border flex items-center justify-between gap-2 select-none">
        <h3 className="font-bold text-sm text-foreground truncate max-w-[140px]" title={label}>
          {label}
        </h3>
        <Badge variant="outline" className={cn("text-[9px] font-bold px-2 py-0.5 border shrink-0", statusColors)}>
          {status}
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeInspectorTab}
        onValueChange={(val) => setActiveTab(val as 'config' | 'runtime')}
        className="w-full flex-1 flex flex-col"
      >
        <div className="px-4 pt-3 border-b border-border/50">
          <TabsList className="grid grid-cols-2 w-full h-8 bg-muted/60 dark:bg-muted/10">
            <TabsTrigger value="config" className="text-xs py-1">Config</TabsTrigger>
            <TabsTrigger value="runtime" className="text-xs py-1">Runtime</TabsTrigger>
          </TabsList>
        </div>

        {/* Config Content */}
        <TabsContent value="config" className="flex-1 mt-0 overflow-y-auto">
          <ConfigTab />
        </TabsContent>

        {/* Runtime Content */}
        <TabsContent value="runtime" className="flex-1 mt-0 overflow-y-auto">
          <RuntimeTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};
