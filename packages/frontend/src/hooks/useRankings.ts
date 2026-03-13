import { useQuery } from '@tanstack/react-query';
import { fetchRankings } from '../api/client';

export function useRankings() {
  return useQuery({
    queryKey: ['rankings'],
    queryFn: fetchRankings,
    staleTime: 10 * 60 * 1000,
  });
}
