'use client';

import { Loader2, CheckCircle, ExternalLink } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message: string;
  type?: 'loading' | 'success' | 'redirecting';
  redirectUrl?: string;
}

export function LoadingOverlay({ 
  isVisible, 
  message, 
  type = 'loading',
  redirectUrl 
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'redirecting':
        return <ExternalLink className="w-8 h-8 text-blue-600" />;
      default:
        return <Loader2 className="w-8 h-8 animate-spin text-blue-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'redirecting':
        return 'bg-blue-50';
      default:
        return 'bg-blue-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`${getBackgroundColor()} rounded-lg p-8 max-w-md w-full text-center space-y-4 shadow-xl`}>
        <div className="flex justify-center">
          {getIcon()}
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {type === 'success' && 'Success!'}
            {type === 'redirecting' && 'Redirecting...'}
            {type === 'loading' && 'Processing...'}
          </h3>
          <p className="text-sm text-gray-600">
            {message}
          </p>
          {redirectUrl && (
            <p className="text-xs text-gray-500 mt-2">
              You will be redirected automatically
            </p>
          )}
        </div>
        {type === 'redirecting' && (
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Preparing redirect...</span>
          </div>
        )}
      </div>
    </div>
  );
}
