'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showLabel?: boolean;
}

export function StarRating({
  value,
  onChange,
  max = 5,
  size = 'md',
  readonly = false,
  showLabel = true,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number>(0);

  const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'w-6 h-6 sm:w-7 sm:h-7',
    md: 'w-8 h-8 sm:w-9 sm:h-9',
    lg: 'w-10 h-10 sm:w-12 sm:h-12',
  };

  const labelClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const handleClick = (rating: number) => {
    if (!readonly) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(0);
    }
  };

  const getStarColor = (index: number) => {
    const currentValue = hoverValue || value;
    return currentValue > index ? 'text-yellow-400' : 'text-gray-300';
  };

  const getLabel = () => {
    const currentValue = hoverValue || value;
    const labels: Record<number, string> = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent',
    };
    return labels[currentValue] ?? '';
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex space-x-1">
        {Array.from({ length: max }, (_, index) => {
          const starValue = index + 1;
          return (
            <button
              key={`star-${starValue}`}
              type="button"
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              disabled={readonly}
              className={cn(
                'transition-transform duration-150 mobile-touch-target',
                !readonly && 'hover:scale-110 active:scale-95',
                readonly && 'cursor-default'
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  getStarColor(index),
                  'fill-current'
                )}
              />
            </button>
          );
        })}
      </div>
      {showLabel && (hoverValue > 0 || value > 0) && (
        <p className={cn('font-medium text-muted-foreground', labelClasses[size])}>
          {getLabel()}
        </p>
      )}
    </div>
  );
}
