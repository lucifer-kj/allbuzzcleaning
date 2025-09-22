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
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  
  const { user } = useUserStore();

  useEffect(() => {
    if (!user) {
      realtimeService.unsubscribeAll();
      setIsConnected(false);
      setConnectionStatus('DISCONNECTED');
      setReconnectAttempts(0);
      return;
    }

    // Monitor connection status with exponential backoff
    const checkConnection = () => {
      const status = realtimeService.getConnectionStatus();
      setConnectionStatus(status);
      setIsConnected(status === 'CONNECTED');
      
      if (status === 'CONNECTED') {
        setReconnectAttempts(0);
      } else if (status === 'DISCONNECTED') {
        setReconnectAttempts(prev => prev + 1);
      }
    };

    // More frequent checks for better responsiveness
    const interval = setInterval(checkConnection, 2000);
    checkConnection();

    // Track user activity for connection management
    const updateActivity = () => setLastActivity(Date.now());
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity, true);
    });

    // Auto-reconnect on user activity if disconnected
    const reconnectOnActivity = () => {
      if (!isConnected && Date.now() - lastActivity < 5000) {
        realtimeService.reconnect();
      }
    };

    const activityInterval = setInterval(reconnectOnActivity, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(activityInterval);
      events.forEach(event => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, [user, isConnected, lastActivity]);

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
