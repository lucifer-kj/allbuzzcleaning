'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRealtime } from '@/components/realtime/realtime-provider';

interface AutoRefreshAnalyticsProps {
  children: React.ReactNode;
  refreshInterval?: number; // in milliseconds
  onRefresh?: () => void;
}

export function AutoRefreshAnalytics({
  children,
  refreshInterval = 30000, // 30 seconds default
  onRefresh,
}: AutoRefreshAnalyticsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isOnline, setIsOnline] = useState(true);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const { isConnected } = useRealtime();

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      }
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error refreshing analytics:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, onRefresh]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefreshEnabled || !isOnline || !isConnected) return;

    const interval = setInterval(() => {
      handleRefresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, isOnline, isConnected, refreshInterval, handleRefresh]);

  // Subscribe to real-time updates for instant refresh
  const { subscribeToAnalytics } = useRealtime();
  
  useEffect(() => {
    const analyticsSubscription = subscribeToAnalytics('global', () => {
      // Auto-refresh when analytics data changes
      if (autoRefreshEnabled) {
        handleRefresh();
      }
    });

    return () => {
      analyticsSubscription.unsubscribe();
    };
  }, [autoRefreshEnabled, handleRefresh, subscribeToAnalytics]);

  const getStatusColor = () => {
    if (!isOnline) return 'bg-red-500';
    if (!isConnected) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (!isConnected) return 'Disconnected';
    return 'Connected';
  };

  return (
    <div className="space-y-4">
      {/* Status Bar */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <span className="text-sm text-gray-600">{getStatusText()}</span>
          </div>
          
          <Badge variant="outline" className="text-xs">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
            className={autoRefreshEnabled ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}
          >
            {autoRefreshEnabled ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span className="ml-1 text-xs">
              {autoRefreshEnabled ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || !isOnline}
            className="min-w-[80px]"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Analytics Content */}
      <div className="relative">
        {isRefreshing && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10 rounded-lg">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-sm text-gray-600">Updating analytics...</span>
            </div>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
