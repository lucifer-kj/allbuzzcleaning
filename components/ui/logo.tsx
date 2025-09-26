'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import React from 'react';

type LogoSize = 'xs' | 'sm' | 'md' | 'lg';

interface LogoProps {
  size?: LogoSize;
  className?: string;
  priority?: boolean;
  alt?: string;
}

/**
 * Logo selects the best raster asset in /public/logo for each size bucket
 * and renders via Next/Image for optimal sizing and responsive loading.
 */
export function Logo({ size = 'sm', className, priority = false, alt = 'All Buzz Cleaning' }: LogoProps) {
  const config: Record<LogoSize, { src: string; width: number; height: number }> = {
    xs: { src: '/logo/icons8-logo-ios-17-outlined-16.png', width: 16, height: 16 },
    sm: { src: '/logo/icons8-logo-ios-17-outlined-32.png', width: 32, height: 32 },
    md: { src: '/logo/icons8-logo-ios-17-outlined-50.png', width: 50, height: 50 },
    lg: { src: '/logo/icons8-logo-ios-17-outlined-72.png', width: 72, height: 72 },
  };

  const { src, width, height } = config[size];

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={cn(
        size === 'xs' && 'h-4 w-4',
        size === 'sm' && 'h-6 w-6',
        size === 'md' && 'h-8 w-8',
        size === 'lg' && 'h-12 w-12',
        className,
      )}
    />
  );
}

export default Logo;


