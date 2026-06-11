import React from 'react';
import { useNodes, useReactFlow } from '@xyflow/react';
import type { Node } from '@xyflow/react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { useUIStore } from '@/store/useUIStore';
import type { ServiceNodeData } from '@/types';
import { updateGraphNode } from '@/api/graph';

export const ConfigTab: React.FC = () => {
  const selectedNodeId = useUIStore((state) => state.selectedNodeId);
  const selectedAppId = useUIStore((state) => state.selectedAppId);
  const nodes = useNodes();
  const { setNodes } = useReactFlow();

  const node = nodes.find((n) => n.id === selectedNodeId) as Node<ServiceNodeData> | undefined;

  if (!node) {
    return (
      <div className="text-xs text-muted-foreground p-4 text-center">
        Select a node to inspect and edit its configuration.
      </div>
    );
  }

  const { label, description, replicas } = node.data;

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedAppId && selectedNodeId) {
      updateGraphNode(selectedAppId, selectedNodeId, { label: e.target.value });
    }
    setNodes((prev) =>
      prev.map((n) => (n.id === selectedNodeId ? { ...n, data: { ...n.data, label: e.target.value } } : n))
    );
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (selectedAppId && selectedNodeId) {
      updateGraphNode(selectedAppId, selectedNodeId, { description: e.target.value });
    }
    setNodes((prev) =>
      prev.map((n) => (n.id === selectedNodeId ? { ...n, data: { ...n.data, description: e.target.value } } : n))
    );
  };

  const handleReplicasChange = (val: number) => {
    const clamped = Math.min(100, Math.max(0, val));
    if (selectedAppId && selectedNodeId) {
      updateGraphNode(selectedAppId, selectedNodeId, { replicas: clamped });
    }
    setNodes((prev) =>
      prev.map((n) => (n.id === selectedNodeId ? { ...n, data: { ...n.data, replicas: clamped } } : n))
    );
  };

  return (
    <div className="space-y-4 p-4 select-none">
      {/* Name Input */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Service Name
        </label>
        <Input
          value={label}
          onChange={handleLabelChange}
          className="h-9 text-xs focus-visible:ring-primary"
          placeholder="Service Name"
        />
      </div>

      {/* Description Input */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Description
        </label>
        <Textarea
          value={description}
          onChange={handleDescriptionChange}
          className="min-h-[70px] text-xs resize-none focus-visible:ring-primary"
          placeholder="No description provided"
        />
      </div>

      {/* Replicas Control */}
      <div className="space-y-2.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Replicas (0–100)
        </label>
        <div className="flex items-center gap-3">
          <Slider
            min={0}
            max={100}
            step={1}
            value={[replicas]}
            onValueChange={(val) => {
              const numVal = val[0];
              if (numVal !== undefined) handleReplicasChange(numVal);
            }}
            className="flex-1 cursor-pointer"
          />
          <Input
            type="number"
            min={0}
            max={100}
            value={replicas}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              handleReplicasChange(isNaN(val) ? 0 : val);
            }}
            className="w-16 h-8 text-xs font-semibold text-center focus-visible:ring-primary"
          />
        </div>
      </div>
    </div>
  );
};
