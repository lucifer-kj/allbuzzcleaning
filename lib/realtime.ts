import { createClient } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

export class RealtimeService {
  private supabase = createClient();
  private subscriptions = new Map<string, RealtimeSubscription>();

  /**
   * Subscribe to reviews updates (global for single business)
   */
  subscribeToReviews(
    businessId: string, // Keep parameter for compatibility but ignore it
    onUpdate: (payload: any) => void
  ): RealtimeSubscription {
    const channelName = `reviews:global`;
    
    if (this.subscriptions.has(channelName)) {
      this.subscriptions.get(channelName)?.unsubscribe();
    }

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
        },
        onUpdate
      )
      .subscribe();

    const subscription: RealtimeSubscription = {
      channel,
      unsubscribe: () => {
        this.supabase.removeChannel(channel);
        this.subscriptions.delete(channelName);
      },
    };

    this.subscriptions.set(channelName, subscription);
    return subscription;
  }

  /**
   * Subscribe to user's businesses updates
   */
  subscribeToBusinesses(
    userId: string,
    onUpdate: (payload: any) => void
  ): RealtimeSubscription {
    const channelName = `businesses:user_id=eq.${userId}`;
    
    if (this.subscriptions.has(channelName)) {
      this.subscriptions.get(channelName)?.unsubscribe();
    }

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'businesses',
          filter: `user_id=eq.${userId}`,
        },
        onUpdate
      )
      .subscribe();

    const subscription: RealtimeSubscription = {
      channel,
      unsubscribe: () => {
        this.supabase.removeChannel(channel);
        this.subscriptions.delete(channelName);
      },
    };

    this.subscriptions.set(channelName, subscription);
    return subscription;
  }

  /**
   * Subscribe to analytics updates (global for single business)
   */
  subscribeToAnalytics(
    businessId: string, // Keep parameter for compatibility but ignore it
    onUpdate: (payload: any) => void
  ): RealtimeSubscription {
    const channelName = `analytics:global`;
    
    if (this.subscriptions.has(channelName)) {
      this.subscriptions.get(channelName)?.unsubscribe();
    }

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'analytics',
        },
        onUpdate
      )
      .subscribe();

    const subscription: RealtimeSubscription = {
      channel,
      unsubscribe: () => {
        this.supabase.removeChannel(channel);
        this.subscriptions.delete(channelName);
      },
    };

    this.subscriptions.set(channelName, subscription);
    return subscription;
  }

  /**
   * Subscribe to link tracking updates
   */
  subscribeToLinkTracking(
    businessId: string,
    onUpdate: (payload: any) => void
  ): RealtimeSubscription {
    const channelName = `link_tracking:business_id=eq.${businessId}`;
    
    if (this.subscriptions.has(channelName)) {
      this.subscriptions.get(channelName)?.unsubscribe();
    }

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'link_tracking',
          filter: `business_id=eq.${businessId}`,
        },
        onUpdate
      )
      .subscribe();

    const subscription: RealtimeSubscription = {
      channel,
      unsubscribe: () => {
        this.supabase.removeChannel(channel);
        this.subscriptions.delete(channelName);
      },
    };

    this.subscriptions.set(channelName, subscription);
    return subscription;
  }

  /**
   * Unsubscribe from a specific channel
   */
  unsubscribe(channelName: string): void {
    const subscription = this.subscriptions.get(channelName);
    if (subscription) {
      subscription.unsubscribe();
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING' {
    return this.supabase.realtime.getChannels().length > 0 ? 'CONNECTED' : 'DISCONNECTED';
  }
}

// Singleton instance
export const realtimeService = new RealtimeService();
