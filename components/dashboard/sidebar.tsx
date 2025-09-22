'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Star, 
  BarChart3, 
  Settings,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useUIStore } from '@/stores/store';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Reviews', href: '/reviews', icon: Star },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();

  return (
    <>
      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-0 z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-background border-r">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold">Crux</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="px-4 py-4">
            <NavigationItems pathname={pathname} />
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={cn(
        "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col transition-all duration-300",
        sidebarCollapsed ? "lg:w-16" : "lg:w-64"
      )}>
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-background border-r px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center justify-between">
            {!sidebarCollapsed && <h1 className="text-xl font-bold">Crux</h1>}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebarCollapsed}
              className="h-8 w-8"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
          <nav className="flex flex-1 flex-col">
            <NavigationItems pathname={pathname} collapsed={sidebarCollapsed} />
          </nav>
        </div>
      </div>
    </>
  );
}

function NavigationItems({ pathname, collapsed }: { pathname: string; collapsed?: boolean }) {
  return (
    <ul role="list" className="flex flex-1 flex-col gap-y-7">
      <li>
        <ul role="list" className="-mx-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors',
                    collapsed ? 'justify-center px-2' : '',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </li>
    </ul>
  );
}
