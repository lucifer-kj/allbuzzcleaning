'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface AppSettings {
  id: boolean;
  name: string;
  description?: string;
  logo_url?: string;
  google_business_url?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  brand_color: string;
  welcome_message: string;
  thank_you_message: string;
  created_at: string;
  updated_at: string;
}

interface AppSettingsContextType {
  settings: AppSettings | null;
  loading: boolean;
  error: string;
  refreshSettings: () => Promise<void>;
}

const AppSettingsContext = createContext<AppSettingsContextType | null>(null);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/app-settings');
      const data = await response.json();
      
      if (data.success) {
        setSettings(data.settings);
      } else {
        setError(data.error || 'Failed to fetch app settings');
      }
    } catch (err) {
      setError('Failed to fetch app settings');
      console.error('Error fetching app settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <AppSettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        refreshSettings,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (!context) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
}
