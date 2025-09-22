'use client';

import { useRealtime } from '@/components/realtime/realtime-provider';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export function ConnectionStatus() {
  const { isConnected, connectionStatus } = useRealtime();

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'CONNECTED':
        return {
          icon: Wifi,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          label: 'Connected',
        };
      case 'RECONNECTING':
        return {
          icon: RefreshCw,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          label: 'Reconnecting...',
          animate: true,
        };
      case 'DISCONNECTED':
        return {
          icon: WifiOff,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          label: 'Disconnected',
        };
      default:
        return {
          icon: WifiOff,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          label: 'Unknown',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
        config.bgColor,
        config.color,
        !isConnected && 'animate-pulse'
      )}
    >
      <Icon
        className={cn(
          'w-3 h-3',
          config.animate && 'animate-spin'
        )}
      />
      <span>{config.label}</span>
    </div>
  );
}
