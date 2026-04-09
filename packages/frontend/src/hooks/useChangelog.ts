import { useQuery } from '@tanstack/react-query';
import { fetchChangelog } from '../api/client';

export function useChangelog() {
  return useQuery({
    queryKey: ['changelog'],
    queryFn: fetchChangelog,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
}
