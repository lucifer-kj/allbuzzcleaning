'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  hover?: boolean;
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
  direction = 'up',
  duration = 0.5,
  hover = true,
}: AnimatedCardProps) {
  const directionVariants = {
    up: { y: 20, opacity: 0 },
    down: { y: -20, opacity: 0 },
    left: { x: 20, opacity: 0 },
    right: { x: -20, opacity: 0 },
  };

  const hoverVariants = hover ? {
    hover: {
      y: -4,
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
  } : {};

  return (
    <motion.div
      initial={directionVariants[direction]}
      animate={{ y: 0, x: 0, opacity: 1 }}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
      whileHover={hover ? 'hover' : undefined}
      variants={hoverVariants}
    >
      <Card className={cn('transition-shadow duration-200', hover && 'hover:shadow-lg', className)}>
        {children}
      </Card>
    </motion.div>
  );
}

export function AnimatedCardContent({
  children,
  className,
  delay = 0,
  direction = 'up',
  duration = 0.5,
}: Omit<AnimatedCardProps, 'hover'>) {
  const directionVariants = {
    up: { y: 20, opacity: 0 },
    down: { y: -20, opacity: 0 },
    left: { x: 20, opacity: 0 },
    right: { x: -20, opacity: 0 },
  };

  return (
    <motion.div
      initial={directionVariants[direction]}
      animate={{ y: 0, x: 0, opacity: 1 }}
      transition={{
        duration,
        delay,
        ease: 'easeOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
