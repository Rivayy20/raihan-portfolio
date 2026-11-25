import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../lib/queryClient';
import {
  fetchPublicPortfolioData,
  readCachedPublicPortfolio,
} from '../services/publicPortfolioService';

export function usePublicPortfolio() {
  const query = useQuery({
    queryKey: QUERY_KEYS.publicPortfolio,
    queryFn: fetchPublicPortfolioData,
    initialData: () => readCachedPublicPortfolio() ?? undefined,
    initialDataUpdatedAt: () => readCachedPublicPortfolio()?.cachedAt,
    staleTime: 2 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 1,
  });

  return {
    data: query.data?.data ?? null,
    source: query.data?.source ?? 'loading',
    isLoading: query.isLoading && !query.data,
    error: query.error,
  };
}
