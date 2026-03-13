import { useQuery } from '@tanstack/react-query';
import { fetchAllGuides } from '../api/client';

export function useAllGuides() {
  return useQuery({
    queryKey: ['all-guides'],
    queryFn: fetchAllGuides,
    staleTime: 5 * 60 * 1000,
  });
}
