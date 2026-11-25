import { useQuery } from '@tanstack/react-query';
import { getMediaSignedUrl } from '../repositories/mediaRepository';

export function useMediaUrl(asset) {
  const isPrivate = Boolean(asset && !asset.is_public && asset.bucket_id && asset.storage_path);

  const signedQuery = useQuery({
    queryKey: ['cms', 'mediaSignedUrl', asset?.id, asset?.storage_path],
    queryFn: () => getMediaSignedUrl(asset.bucket_id, asset.storage_path, 300),
    enabled: isPrivate,
    staleTime: 4 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  if (!asset) {
    return { url: '', isLoading: false, error: null };
  }

  if (asset.is_public) {
    return { url: asset.public_url || '', isLoading: false, error: null };
  }

  return {
    url: signedQuery.data || '',
    isLoading: signedQuery.isLoading,
    error: signedQuery.error || null,
  };
}
