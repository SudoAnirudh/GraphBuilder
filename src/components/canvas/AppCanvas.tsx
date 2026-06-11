import React, { useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  BackgroundVariant,
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useUIStore } from '@/store/useUIStore';
import { useAppGraph } from '@/hooks/useAppGraph';
import { ServiceNode } from './ServiceNode';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import type { ServiceNodeData } from '@/types';

export const AppCanvas: React.FC = () => {
  const selectedAppId = useUIStore((state) => state.selectedAppId);
  const selectedNodeId = useUIStore((state) => state.selectedNodeId);
  const setSelectedNode = useUIStore((state) => state.setSelectedNode);
  const fitViewTrigger = useUIStore((state) => state.fitViewTrigger);
  const addNodeTrigger = useUIStore((state) => state.addNodeTrigger);

  const { data, isLoading, isError, error, refetch } = useAppGraph(selectedAppId);
  const { fitView } = useReactFlow();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<ServiceNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Node types registration
  const nodeTypes = useMemo(() => ({ service: ServiceNode }), []);

  // Update canvas nodes/edges when graph data loads/changes
  useEffect(() => {
    if (data) {
      setNodes(data.nodes);
      setEdges(data.edges);
      
      // Auto fitView on data load after rendering
      window.requestAnimationFrame(() => {
        fitView({ duration: 300 });
      });
    }
  }, [data, setNodes, setEdges, fitView]);

  // Sync fitView action from TopBar
  useEffect(() => {
    if (fitViewTrigger > 0) {
      fitView({ duration: 300 });
    }
  }, [fitViewTrigger, fitView]);

  // Sync addNode action from TopBar
  useEffect(() => {
    if (addNodeTrigger > 0) {
      const newNodeId = `node-${Date.now()}`;
      setNodes((nds) => {
        const newNode: Node<ServiceNodeData> = {
          id: newNodeId,
          type: 'service',
          position: { x: Math.random() * 150 + 200, y: Math.random() * 150 + 150 },
          data: {
            label: `New Service ${nds.length + 1}`,
            description: 'A dynamically created microservice.',
            replicas: 1,
            status: 'Healthy',
          },
        };
        return [...nds, newNode];
      });

      if (selectedNodeId) {
        setEdges((eds) => [
          ...eds,
          {
            id: `edge-${selectedNodeId}-${newNodeId}`,
            source: selectedNodeId,
            target: newNodeId,
            animated: true,
            style: { stroke: 'var(--primary)', strokeWidth: 1.5 },
          },
        ]);
      }

      setSelectedNode(newNodeId);
    }
  }, [addNodeTrigger, selectedNodeId, setNodes, setEdges, setSelectedNode]);

  // Node Click handler
  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node.id);
  };

  // Pane Click handler (deselect node)
  const handlePaneClick = () => {
    setSelectedNode(null);
  };

  // Node delete handler (clears selection if deleted)
  const handleNodesDelete = (deletedNodes: Node[]) => {
    if (deletedNodes.some((node) => node.id === selectedNodeId)) {
      setSelectedNode(null);
    }
  };

  if (isLoading) {
    return (
      <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3 z-40 select-none">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <span className="text-xs font-semibold text-muted-foreground animate-pulse">
          Loading service graph...
        </span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="absolute inset-0 bg-background/80 flex items-center justify-center p-6 z-40 select-none">
        <div className="bg-card border border-destructive/20 rounded-xl p-6 shadow-lg max-w-sm w-full flex flex-col items-center text-center gap-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">Graph Fetch Failed</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
          </div>
          <Button onClick={() => refetch()} size="sm" className="w-full gap-2 mt-2">
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry Query</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative" onKeyDown={(e) => {
      // Ensure Backspace / Delete key removes selected node
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        // Find if the selected node is focused in flow
        // ReactFlow handles deletion internally, no manual delete trigger needed if deleteKeyCode is set
      }
    }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        onNodesDelete={handleNodesDelete}
        deleteKeyCode={['Backspace', 'Delete']}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={2}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1.5} color="var(--border)" className="opacity-60" />
        <Controls showInteractive={false} className="!bg-card !border-border !shadow-sm [&_button]:!bg-card [&_button]:!border-border [&_svg]:!fill-foreground" />
        <MiniMap
          nodeColor={(n) => {
            const status = (n.data as { status?: string })?.status;
            if (status === 'Healthy') return '#10b981';
            if (status === 'Degraded') return '#f59e0b';
            if (status === 'Down') return '#ef4444';
            return 'var(--border)';
          }}
          className="!bg-card !border-border !rounded-lg !shadow-sm opacity-90 hidden sm:block"
        />
      </ReactFlow>
    </div>
  );
};
