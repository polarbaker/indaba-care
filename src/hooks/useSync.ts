import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { syncAll, pullData, pushData } from '../lib/sync';
import { useAuthContext } from '../contexts/AuthContext';

// Hook for background data synchronization
export function useSync() {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  
  // Query for checking if we're online
  const { data: isOnline } = useQuery({
    queryKey: ['online-status'],
    queryFn: () => navigator.onLine,
    refetchInterval: 30000, // Check every 30 seconds
    enabled: !!user, // Only check when user is logged in
  });

  // Mutation for full data synchronization
  const syncMutation = useMutation({
    mutationFn: syncAll,
    onSuccess: () => {
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries();
    },
  });
  
  // Perform sync and return status
  const performSync = async () => {
    if (!user || !isOnline) {
      return { success: false, reason: !user ? 'not-authenticated' : 'offline' };
    }
    
    try {
      const result = await syncMutation.mutateAsync();
      return { 
        success: true, 
        ...result 
      };
    } catch (error) {
      console.error('Sync failed:', error);
      return { 
        success: false, 
        reason: 'error',
        error 
      };
    }
  };
  
  return {
    isOnline,
    isSyncing: syncMutation.isPending,
    lastSyncResult: syncMutation.data,
    syncError: syncMutation.error,
    performSync,
  };
}

// Hook for pulling data for a specific entity
export function usePull(entity: string) {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  
  const pullMutation = useMutation({
    mutationFn: () => pullData(entity),
    onSuccess: () => {
      // Invalidate queries related to this entity
      queryClient.invalidateQueries({ queryKey: [entity] });
    },
  });
  
  const performPull = async () => {
    if (!user) {
      return { success: false, reason: 'not-authenticated' };
    }
    
    if (!navigator.onLine) {
      return { success: false, reason: 'offline' };
    }
    
    try {
      const count = await pullMutation.mutateAsync();
      return { 
        success: true, 
        pulled: count 
      };
    } catch (error) {
      console.error(`Pull ${entity} failed:`, error);
      return { 
        success: false, 
        reason: 'error',
        error 
      };
    }
  };
  
  return {
    isPulling: pullMutation.isPending,
    pullError: pullMutation.error,
    performPull,
  };
}

// Hook for pushing data for a specific entity
export function usePush(entity: string) {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  
  const pushMutation = useMutation({
    mutationFn: () => pushData(entity),
    onSuccess: () => {
      // Invalidate queries related to this entity
      queryClient.invalidateQueries({ queryKey: [entity] });
    },
  });
  
  const performPush = async () => {
    if (!user) {
      return { success: false, reason: 'not-authenticated' };
    }
    
    if (!navigator.onLine) {
      return { success: false, reason: 'offline' };
    }
    
    try {
      const count = await pushMutation.mutateAsync();
      return { 
        success: true, 
        pushed: count 
      };
    } catch (error) {
      console.error(`Push ${entity} failed:`, error);
      return { 
        success: false, 
        reason: 'error',
        error 
      };
    }
  };
  
  return {
    isPushing: pushMutation.isPending,
    pushError: pushMutation.error,
    performPush,
  };
}
