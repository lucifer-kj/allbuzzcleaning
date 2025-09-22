'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check, ExternalLink, QrCode } from 'lucide-react';
import { CopyButton } from '@/components/ui/copy-button';
import { useAppSettings } from '@/components/providers/app-settings-provider';

export function ReviewLinkCard() {
  const [reviewUrl, setReviewUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const { settings } = useAppSettings();

  useEffect(() => {
    // Generate the review URL based on current domain
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    setReviewUrl(`${baseUrl}/review/global`);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reviewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const openReviewPage = () => {
    window.open(reviewUrl, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="w-5 h-5" />
          Review Link
        </CardTitle>
        <CardDescription>
          Share this link with customers to collect reviews
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Public Review URL</label>
          <div className="flex gap-2">
            <Input
              value={reviewUrl}
              readOnly
              className="flex-1 font-mono text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="min-w-[80px]"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={openReviewPage} className="flex-1">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Review Page
          </Button>
          <Button variant="outline" size="sm">
            <QrCode className="w-4 h-4 mr-2" />
            Generate QR
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>• High ratings (4-5 stars) will redirect to Google Business Profile</p>
          <p>• Low ratings (1-3 stars) will redirect to internal feedback form</p>
          <p>• Configure your Google Business URL in Settings for redirects</p>
          {settings?.google_business_url && (
            <p className="text-green-600">✓ Google Business URL configured</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
