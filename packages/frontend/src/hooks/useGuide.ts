import { useQuery } from '@tanstack/react-query';
import { fetchGuide, fetchGuideHistory } from '../api/client';

export function useGuide(specName: string) {
  return useQuery({
    queryKey: ['guide', specName],
    queryFn: () => fetchGuide(specName),
    enabled: !!specName,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: false,
  });
}

export function useGuideHistory(specName: string) {
  return useQuery({
    queryKey: ['guide-history', specName],
    queryFn: () => fetchGuideHistory(specName),
    enabled: !!specName,
    staleTime: 10 * 60 * 1000,
  });
}
