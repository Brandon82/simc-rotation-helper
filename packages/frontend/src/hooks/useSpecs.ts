import { useQuery } from '@tanstack/react-query';
import { fetchSpecs } from '../api/client';

export function useSpecs() {
  return useQuery({
    queryKey: ['specs'],
    queryFn: fetchSpecs,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
