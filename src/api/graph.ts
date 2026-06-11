import type { GraphResponse, ServiceNodeData } from '../types';

const GRAPHS: Record<string, GraphResponse> = {
  'app-1': {
    nodes: [
      {
        id: 'p-1',
        type: 'service',
        position: { x: 250, y: 50 },
        data: {
          label: 'Payments API Gateway',
          description: 'Entrypoint for client payments, webhooks, and billing queries.',
          status: 'Healthy',
          replicas: 4,
        },
      },
      {
        id: 'p-2',
        type: 'db',
        position: { x: 50, y: 200 },
        data: {
          label: 'Payments PostgreSQL Database',
          description: 'Primary transactional storage for user balances and invoice logs.',
          status: 'Healthy',
          replicas: 2,
        },
      },
      {
        id: 'p-3',
        type: 'service',
        position: { x: 450, y: 200 },
        data: {
          label: 'Stripe Integration Worker',
          description: 'Dispatches background API tasks to Stripe and manages charge state machines.',
          status: 'Degraded',
          replicas: 1,
        },
      },
    ],
    edges: [
      { id: 'e-p-2-p-1', source: 'p-2', target: 'p-1', animated: true },
      { id: 'e-p-1-p-3', source: 'p-1', target: 'p-3' },
    ],
  },
  'app-2': {
    nodes: [
      {
        id: 'a-1',
        type: 'service',
        position: { x: 250, y: 50 },
        data: {
          label: 'OAuth2 Server',
          description: 'Validates tokens and authenticates user sign-in requests.',
          status: 'Healthy',
          replicas: 5,
        },
      },
      {
        id: 'a-2',
        type: 'db',
        position: { x: 50, y: 200 },
        data: {
          label: 'Users MySQL Cluster',
          description: 'Stores credentials, roles, and profiles of all users.',
          status: 'Healthy',
          replicas: 3,
        },
      },
      {
        id: 'a-3',
        type: 'db',
        position: { x: 450, y: 200 },
        data: {
          label: 'Redis Cache Service',
          description: 'Caches active JWT sessions and token revocation blacklists.',
          status: 'Down',
          replicas: 0,
        },
      },
    ],
    edges: [
      { id: 'e-a-2-a-1', source: 'a-2', target: 'a-1' },
      { id: 'e-a-1-a-3', source: 'a-1', target: 'a-3', animated: true },
    ],
  },
  'app-3': {
    nodes: [
      {
        id: 'n-1',
        type: 'service',
        position: { x: 50, y: 120 },
        data: {
          label: 'RabbitMQ Message Broker',
          description: 'Buffers email and SMS notification requests for worker queues.',
          status: 'Healthy',
          replicas: 3,
        },
      },
      {
        id: 'n-2',
        type: 'service',
        position: { x: 350, y: 40 },
        data: {
          label: 'Email Dispatcher Service',
          description: 'SMTP connector sending customer transaction receipt emails.',
          status: 'Healthy',
          replicas: 6,
        },
      },
      {
        id: 'n-3',
        type: 'service',
        position: { x: 350, y: 220 },
        data: {
          label: 'SMS Gateway Connector',
          description: 'Twilio provider proxy sending transactional phone verifications.',
          status: 'Degraded',
          replicas: 2,
        },
      },
    ],
    edges: [
      { id: 'e-n-1-n-2', source: 'n-1', target: 'n-2', animated: true },
      { id: 'e-n-1-n-3', source: 'n-1', target: 'n-3' },
    ],
  },
};

export const fetchGraph = (appId: string): Promise<GraphResponse> =>
  new Promise((res, rej) => {
    setTimeout(() => {
      if (appId === 'app-2' && Math.random() < 0.2) {
        return rej(new Error('Upstream timeout — graph unavailable'));
      }
      // Return a deep copy of the mock data to prevent cross-fetch mutations
      const baseGraph = GRAPHS[appId] ?? GRAPHS['app-1'];
      if (!baseGraph) {
        return rej(new Error('Graph data not found'));
      }
      res(JSON.parse(JSON.stringify(baseGraph)) as GraphResponse);
    }, 800);
  });

// Persist node updates in memory
export const updateGraphNode = (appId: string, nodeId: string, updates: Partial<ServiceNodeData>) => {
  const graph = GRAPHS[appId];
  if (graph) {
    graph.nodes = graph.nodes.map((n) => {
      if (n.id === nodeId) {
        return {
          ...n,
          data: {
            ...n.data,
            ...updates,
          },
        };
      }
      return n;
    });
  }
};

// Persist dynamic node additions
export const addGraphNode = (appId: string, node: any) => {
  const graph = GRAPHS[appId];
  if (graph) {
    graph.nodes.push(node);
  }
};

// Persist node deletions
export const removeGraphNode = (appId: string, nodeId: string) => {
  const graph = GRAPHS[appId];
  if (graph) {
    graph.nodes = graph.nodes.filter((n) => n.id !== nodeId);
    graph.edges = graph.edges.filter((e) => e.source !== nodeId && e.target !== nodeId);
  }
};

// Persist edge additions
export const addGraphEdge = (appId: string, edge: any) => {
  const graph = GRAPHS[appId];
  if (graph) {
    graph.edges.push(edge);
  }
};

