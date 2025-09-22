'use client';

import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { Footer } from '@/components/ui/footer';
import { useUIStore } from '@/stores/store';
import { usePerformance } from '@/hooks/use-performance';
import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarCollapsed } = useUIStore();
  const { metrics, logMetrics } = usePerformance();

  // Log performance metrics when available
  React.useEffect(() => {
    if (metrics) {
      logMetrics();
    }
  }, [metrics, logMetrics]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
        <Header />
        <main className="py-4 sm:py-6 lg:py-8">
          <div className="mx-auto max-w-7xl mobile-container">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
