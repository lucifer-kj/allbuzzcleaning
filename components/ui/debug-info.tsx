'use client';

import { useEffect, useState } from 'react';

interface DebugInfo {
  userAgent: string;
  viewport: { width: number; height: number };
  timestamp: string;
  url: string;
  environment: string;
  supabaseConfigured: boolean;
}

export function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const info: DebugInfo = {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      timestamp: new Date().toISOString(),
      url: window.location.href,
      environment: process.env.NODE_ENV || 'unknown',
      supabaseConfigured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    };

    setDebugInfo(info);
  }, []);

  // Only show in development or when there's an error
  if (process.env.NODE_ENV !== 'development' && !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700"
      >
        Debug Info
      </button>
      
      {isVisible && debugInfo && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Debug Information</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div><strong>Environment:</strong> {debugInfo.environment}</div>
            <div><strong>Supabase:</strong> {debugInfo.supabaseConfigured ? '✅' : '❌'}</div>
            <div><strong>Viewport:</strong> {debugInfo.viewport.width}x{debugInfo.viewport.height}</div>
            <div><strong>URL:</strong> {debugInfo.url}</div>
            <div><strong>Time:</strong> {debugInfo.timestamp}</div>
            <div className="mt-2">
              <strong>User Agent:</strong>
              <div className="break-all text-xs">{debugInfo.userAgent}</div>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="mt-2 text-xs text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
