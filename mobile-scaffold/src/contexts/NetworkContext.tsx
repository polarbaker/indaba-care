import React, { createContext, useContext, useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

type NetworkContextType = {
  isConnected: boolean;
  lastOnlineTimestamp: number | null;
  checkConnection: () => Promise<boolean>;
};

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [lastOnlineTimestamp, setLastOnlineTimestamp] = useState<number | null>(null);

  // Function to check current connection status
  const checkConnection = async (): Promise<boolean> => {
    try {
      const state = await NetInfo.fetch();
      setIsConnected(state.isConnected ?? false);
      
      if (state.isConnected) {
        setLastOnlineTimestamp(Date.now());
      }
      
      return state.isConnected ?? false;
    } catch (error) {
      console.error('Error checking connection:', error);
      return false;
    }
  };

  useEffect(() => {
    // Initial connection check
    checkConnection();
    
    // Subscribe to network status changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
      
      if (state.isConnected) {
        setLastOnlineTimestamp(Date.now());
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const value = {
    isConnected,
    lastOnlineTimestamp,
    checkConnection,
  };

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetworkContext() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetworkContext must be used within a NetworkProvider');
  }
  return context;
}
