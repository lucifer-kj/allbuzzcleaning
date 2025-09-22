'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if Performance Observer is supported
    if (!('PerformanceObserver' in window)) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      // Get Core Web Vitals
      const vitals: Partial<PerformanceMetrics> = {};
      
      entries.forEach((entry) => {
        switch (entry.entryType) {
          case 'navigation':
            const navEntry = entry as PerformanceNavigationTiming;
            vitals.loadTime = navEntry.loadEventEnd - navEntry.fetchStart;
            break;
          case 'paint':
            const paintEntry = entry as PerformancePaintTiming;
            if (paintEntry.name === 'first-contentful-paint') {
              vitals.firstContentfulPaint = paintEntry.startTime;
            }
            break;
          case 'largest-contentful-paint':
            vitals.largestContentfulPaint = entry.startTime;
            break;
          case 'layout-shift':
            if (!(entry as any).hadRecentInput) {
              vitals.cumulativeLayoutShift = (vitals.cumulativeLayoutShift || 0) + (entry as any).value;
            }
            break;
          case 'first-input':
            vitals.firstInputDelay = (entry as any).processingStart - entry.startTime;
            break;
        }
      });

      if (Object.keys(vitals).length > 0) {
        setMetrics((prev) => ({ ...prev, ...vitals } as PerformanceMetrics));
      }
    });

    // Observe all performance entry types
    try {
      observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'layout-shift', 'first-input'] });
    } catch (error) {
      console.warn('Performance Observer not fully supported:', error);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const logMetrics = () => {
    if (metrics) {
      console.log('Performance Metrics:', metrics);
      
      // Log to analytics or monitoring service
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'performance_metrics', {
          load_time: metrics.loadTime,
          first_contentful_paint: metrics.firstContentfulPaint,
          largest_contentful_paint: metrics.largestContentfulPaint,
          cumulative_layout_shift: metrics.cumulativeLayoutShift,
          first_input_delay: metrics.firstInputDelay,
        });
      }
    }
  };

  return {
    metrics,
    isSupported,
    logMetrics,
  };
}
