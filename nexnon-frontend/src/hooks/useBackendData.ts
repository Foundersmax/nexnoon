import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useAuth } from '@/contexts/AuthContext';

export function useBackendData<T>(path: string, isPublic = false) {
  const { user } = useAuth();
  return useQuery<T>({
    queryKey: ['backend-data', path, user?.id],
    queryFn: async () => (await apiClient.get(path)).data.data,
    enabled: isPublic || !!user,
    staleTime: 0,
    retry: 1,
  });
}
