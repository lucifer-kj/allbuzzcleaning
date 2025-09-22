'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Bell, BellOff, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useUserStore } from '@/stores/store';

interface EmailSettings {
  newReviewNotifications: boolean;
  lowRatingAlerts: boolean;
  weeklyReports: boolean;
  emailFrequency: 'immediate' | 'daily' | 'weekly';
  customEmail: string;
  testEmailSent: boolean;
}

export function EmailSettings() {
  const [settings, setSettings] = useState<EmailSettings>({
    newReviewNotifications: true,
    lowRatingAlerts: true,
    weeklyReports: true,
    emailFrequency: 'immediate',
    customEmail: '',
    testEmailSent: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const { user } = useUserStore();

  // Load settings from localStorage or API
  useEffect(() => {
    const savedSettings = localStorage.getItem('email-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings
  const saveSettings = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // In a real implementation, save to API
      localStorage.setItem('email-settings', JSON.stringify(settings));
      
      setMessage({ type: 'success', text: 'Email settings saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save email settings. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Send test email
  const sendTestEmail = async () => {
    if (!settings.customEmail) {
      setMessage({ type: 'error', text: 'Please enter an email address for testing.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // In a real implementation, call API to send test email
      console.log('Sending test email to:', settings.customEmail);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSettings(prev => ({ ...prev, testEmailSent: true }));
      setMessage({ type: 'success', text: 'Test email sent successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send test email. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key: keyof EmailSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Notification Settings
        </CardTitle>
        <CardDescription>
          Configure how and when you receive email notifications about your reviews
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Types */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Types</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-500" />
                  <Label className="text-base font-medium">New Review Notifications</Label>
                </div>
                <p className="text-sm text-gray-600">
                  Get notified when customers leave new reviews
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.newReviewNotifications}
                onChange={(e) => updateSetting('newReviewNotifications', e.target.checked)}
                className="h-5 w-5"
                aria-label="Toggle new review notifications"
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <Label className="text-base font-medium">Low Rating Alerts</Label>
                </div>
                <p className="text-sm text-gray-600">
                  Get immediate alerts for reviews with 2 stars or less
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.lowRatingAlerts}
                onChange={(e) => updateSetting('lowRatingAlerts', e.target.checked)}
                className="h-5 w-5"
                aria-label="Toggle low rating alerts"
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <Label className="text-base font-medium">Weekly Summary Reports</Label>
                </div>
                <p className="text-sm text-gray-600">
                  Receive weekly summaries of your review performance
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.weeklyReports}
                onChange={(e) => updateSetting('weeklyReports', e.target.checked)}
                className="h-5 w-5"
                aria-label="Toggle weekly summary reports"
              />
            </div>
          </div>
        </div>

        {/* Email Frequency */}
        <div className="space-y-2">
          <Label htmlFor="email-frequency">Email Frequency</Label>
          <Select
            value={settings.emailFrequency}
            onValueChange={(value: any) => updateSetting('emailFrequency', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  <span>Immediate</span>
                </div>
              </SelectItem>
              <SelectItem value="daily">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>Daily Digest</span>
                </div>
              </SelectItem>
              <SelectItem value="weekly">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Weekly Summary</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Test Email */}
        <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-medium">Test Email Settings</h3>
          <div className="space-y-2">
            <Label htmlFor="test-email">Test Email Address</Label>
            <Input
              id="test-email"
              type="email"
              placeholder="Enter email to test notifications"
              value={settings.customEmail}
              onChange={(e) => updateSetting('customEmail', e.target.value)}
            />
            <p className="text-sm text-gray-600">
              Send a test email to verify your notification settings are working
            </p>
          </div>
          
          <Button
            onClick={sendTestEmail}
            disabled={isLoading || !settings.customEmail}
            variant="outline"
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2" />
                Sending Test Email...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Test Email
              </>
            )}
          </Button>

          {settings.testEmailSent && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">Test email sent successfully!</span>
            </div>
          )}
        </div>

        {/* Status Message */}
        {message && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Save Button */}
        <Button
          onClick={saveSettings}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Saving Settings...
            </>
          ) : (
            'Save Email Settings'
          )}
        </Button>

        {/* Current Status */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-900">Current Status</span>
          </div>
          <div className="space-y-1 text-sm text-blue-800">
            <p>Primary Email: {user?.email || 'Not set'}</p>
            <p>Notifications: {settings.newReviewNotifications ? 'Enabled' : 'Disabled'}</p>
            <p>Frequency: {settings.emailFrequency}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
