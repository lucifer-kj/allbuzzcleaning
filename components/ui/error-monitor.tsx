'use client';

import { useEffect } from 'react';

export function ErrorMonitor() {
  useEffect(() => {
    // Global error handler
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error?.stack
      });

      // In production, you might want to send this to an error tracking service
      if (process.env.NODE_ENV === 'production') {
        // Example: Send to error tracking service
        // errorTrackingService.captureException(event.error, {
        //   tags: { component: 'global-error-handler' },
        //   extra: {
        //     message: event.message,
        //     filename: event.filename,
        //     lineno: event.lineno,
        //     colno: event.colno
        //   }
        // });
      }
    };

    // Unhandled promise rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', {
        reason: event.reason,
        promise: event.promise
      });

      // In production, you might want to send this to an error tracking service
      if (process.env.NODE_ENV === 'production') {
        // Example: Send to error tracking service
        // errorTrackingService.captureException(event.reason, {
        //   tags: { component: 'unhandled-promise-rejection' },
        //   extra: { promise: event.promise }
        // });
      }
    };

    // Add event listeners
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null; // This component doesn't render anything
}
