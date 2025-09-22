'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRealtime } from '@/components/realtime/realtime-provider';

export interface Notification {
  id: string;
  type: 'new_review' | 'low_rating' | 'analytics_update' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  businessId?: string;
  metadata?: Record<string, any>;
}

export function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { subscribeToReviews, subscribeToAnalytics } = useRealtime();

  // Add notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50 notifications
    setUnreadCount(prev => prev + 1);

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192.svg',
        tag: newNotification.id,
      });
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // Remove notification
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return prev.filter(n => n.id !== id);
    });
  }, []);

  // Request notification permission
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    // Subscribe to new reviews (global for single business)
    const reviewsSubscription = subscribeToReviews('global', (payload) => {
      if (payload.eventType === 'INSERT') {
        const review = payload.new;
        addNotification({
          type: 'new_review',
          title: 'New Review Received',
          message: `${review.customer_name || 'Anonymous'} left a ${review.rating}-star review`,
          priority: review.rating <= 2 ? 'high' : 'medium',
          metadata: { reviewId: review.id, rating: review.rating },
        });

        // Check for low rating
        if (review.rating <= 2) {
          addNotification({
            type: 'low_rating',
            title: 'Low Rating Alert',
            message: `Received a ${review.rating}-star review that may need attention`,
            priority: 'high',
            metadata: { reviewId: review.id, rating: review.rating },
          });
        }
      }
    });

    // Subscribe to analytics updates (global for single business)
    const analyticsSubscription = subscribeToAnalytics('global', (payload) => {
      if (payload.eventType === 'INSERT') {
        addNotification({
          type: 'analytics_update',
          title: 'Analytics Update',
          message: 'New analytics data available',
          priority: 'low',
        });
      }
    });

    return () => {
      reviewsSubscription.unsubscribe();
      analyticsSubscription.unsubscribe();
    };
  }, [subscribeToReviews, subscribeToAnalytics, addNotification]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new_review':
        return <Star className="w-4 h-4 text-blue-500" />;
      case 'low_rating':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'analytics_update':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'system':
        return <Info className="w-4 h-4 text-gray-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 top-12 w-80 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No notifications yet
                </div>
              ) : (
                <div className="space-y-1">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-l-4 ${getPriorityColor(notification.priority)} ${
                        !notification.read ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-gray-100 transition-colors`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2 flex-1">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeNotification(notification.id)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
