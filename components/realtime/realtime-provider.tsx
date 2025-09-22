'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { realtimeService, type RealtimeSubscription } from '@/lib/realtime';
import { useUserStore } from '@/stores/store';

interface RealtimeContextType {
  isConnected: boolean;
  connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING';
  subscribeToReviews: (businessId: string, callback: (payload: any) => void) => RealtimeSubscription;
  subscribeToBusinesses: (callback: (payload: any) => void) => RealtimeSubscription;
  subscribeToAnalytics: (businessId: string, callback: (payload: any) => void) => RealtimeSubscription;
  subscribeToLinkTracking: (businessId: string, callback: (payload: any) => void) => RealtimeSubscription;
}

const RealtimeContext = createContext<RealtimeContextType | null>(null);

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING'>('DISCONNECTED');
  
  const { user } = useUserStore();

  useEffect(() => {
    if (!user) {
      realtimeService.unsubscribeAll();
      setIsConnected(false);
      setConnectionStatus('DISCONNECTED');
      return;
    }

    // No business subscriptions needed for single business model

    // Monitor connection status
    const checkConnection = () => {
      const status = realtimeService.getConnectionStatus();
      setConnectionStatus(status);
      setIsConnected(status === 'CONNECTED');
    };

    const interval = setInterval(checkConnection, 5000);
    checkConnection();

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  const subscribeToReviews = (businessId: string, callback: (payload: any) => void) => {
    return realtimeService.subscribeToReviews(businessId, callback);
  };

  const subscribeToBusinesses = (callback: (payload: any) => void) => {
    if (!user) throw new Error('User not authenticated');
    return realtimeService.subscribeToBusinesses(user.id, callback);
  };

  const subscribeToAnalytics = (businessId: string, callback: (payload: any) => void) => {
    return realtimeService.subscribeToAnalytics(businessId, callback);
  };

  const subscribeToLinkTracking = (businessId: string, callback: (payload: any) => void) => {
    return realtimeService.subscribeToLinkTracking(businessId, callback);
  };

  return (
    <RealtimeContext.Provider
      value={{
        isConnected,
        connectionStatus,
        subscribeToReviews,
        subscribeToBusinesses,
        subscribeToAnalytics,
        subscribeToLinkTracking,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within a RealtimeProvider');
  }
  return context;
}
