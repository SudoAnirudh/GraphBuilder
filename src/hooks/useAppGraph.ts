import { useQuery } from '@tanstack/react-query';
import { fetchGraph } from '../api/graph';

export const useAppGraph = (appId: string | null) =>
  useQuery({
    queryKey: ['graph', appId],
    queryFn: () => fetchGraph(appId!),
    enabled: appId !== null,
    staleTime: 30_000,
    retry: 1,
  });
