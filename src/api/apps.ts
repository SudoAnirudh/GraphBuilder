import type { App } from '../types';

const APPS: App[] = [
  { id: 'app-1', name: 'Payments Service', description: 'Handles all payment flows' },
  { id: 'app-2', name: 'Auth Gateway',     description: 'OAuth2 + JWT issuer' },
  { id: 'app-3', name: 'Notification Hub', description: 'Email / SMS dispatcher' },
];

export const fetchApps = (): Promise<App[]> =>
  new Promise((res) => setTimeout(() => res(APPS), 600));
