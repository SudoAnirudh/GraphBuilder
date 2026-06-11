import { useQuery } from '@tanstack/react-query';
import { fetchApps } from '../api/apps';

export const useApps = () =>
  useQuery({
    queryKey: ['apps'],
    queryFn: fetchApps,
    staleTime: 60_000,
  });
