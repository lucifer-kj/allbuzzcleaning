'use client';

import React, { useState } from 'react';
import { Building2, ChevronDown, Star, MessageSquare, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppSettings } from '@/components/providers/app-settings-provider';

interface BusinessSwitcherProps { className?: string }

export function BusinessSwitcher({ className }: BusinessSwitcherProps) {
  const { settings } = useAppSettings();
  const [isOpen, setIsOpen] = useState(false);

  const handleBusinessSelect = (id?: string) => {};

  const getQuickStats = () => {
    return {
      reviews: 0,
      rating: 0,
      recentReviews: 0, // This would come from analytics
    };
  };

  if (!settings) {
    return (
      <Card className={className}>
        <CardContent className="py-8">
          <div className="text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Business</h3>
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Business
        </CardTitle>
        <CardDescription>
          Single business mode
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Business Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Business</label>
          <Select value={settings?.name || ''} onValueChange={handleBusinessSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Your business" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={settings?.name || 'Business'}>
                <div className="flex items-center gap-3">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={settings?.logo_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {settings?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>{settings?.name}</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Current Business Info */}
        {settings && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Avatar className="w-10 h-10">
                <AvatarImage src={settings.logo_url || undefined} />
                <AvatarFallback>
                  {settings.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-medium">{settings.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {settings.description || 'No description'}
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            {true && (
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span className="text-lg font-bold text-blue-700">{getQuickStats().reviews}</span>
                  </div>
                  <p className="text-xs text-blue-600">Total Reviews</p>
                </div>

                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="w-4 h-4 text-yellow-600" />
                    <span className="text-lg font-bold text-yellow-700">{getQuickStats().rating.toFixed(1)}</span>
                  </div>
                  <p className="text-xs text-yellow-600">Avg Rating</p>
                </div>

                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-lg font-bold text-green-700">{getQuickStats().recentReviews}</span>
                  </div>
                  <p className="text-xs text-green-600">This Week</p>
                </div>
              </div>
            )}

            {/* Business Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => window.open(`/review/global`, '_blank')}>
                View Public Page
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => window.open(`/dashboard/settings`, '_blank')}
              >
                Manage Business
              </Button>
            </div>
          </div>
        )}

        {/* All Businesses List */}
        {false && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">All Your Businesses</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {( [] as any[] ).map((business) => {
                const stats = getQuickStats();
                const isSelected = false;
                
                return (
                  <div
                    key={business.id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleBusinessSelect(business.id)}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={business.logo_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {business.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{business.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{stats.reviews} reviews</span>
                        <span>•</span>
                        <span>{stats.rating.toFixed(1)}★</span>
                      </div>
                    </div>

                    {isSelected && (
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
