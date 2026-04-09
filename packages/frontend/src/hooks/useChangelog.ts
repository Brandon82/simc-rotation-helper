import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchChangelog } from '../api/client';

export function useChangelog(page: number) {
  return useQuery({
    queryKey: ['changelog', page],
    queryFn: () => fetchChangelog(page),
    staleTime: 10 * 60 * 1000,
    retry: 1,
    placeholderData: keepPreviousData,
  });
}
