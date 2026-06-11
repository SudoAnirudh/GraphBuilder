import type { Node, Edge } from '@xyflow/react';

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
  [key: string]: unknown;    // allows standard ReactFlow data index signature
}

// Graph API response
export interface GraphResponse {
  nodes: Node<ServiceNodeData>[];
  edges: Edge[];
}
