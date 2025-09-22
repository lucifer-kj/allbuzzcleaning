'use client';

import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              Review management system for{' '}
              <span className="font-semibold text-foreground">All Buzz Cleaning</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Professional cleaning services globally
            </p>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Powered by</span>
            <Heart className="h-3 w-3 fill-red-500 text-red-500" />
            <span className="font-semibold">Alpha Business Digital</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Alpha Business Digital. All rights reserved. 
            Review management platform provided to All Buzz Cleaning.
          </p>
        </div>
      </div>
    </footer>
  );
}
