'use client';

import { useEffect } from 'react';

interface LinkTrackerProps {
  linkType?: 'qr_code' | 'direct_link' | 'social_share' | 'email' | 'sms';
  source?: string;
}

export function LinkTracker({ linkType, source }: LinkTrackerProps) {
  useEffect(() => {
    const trackLinkClick = async () => {
      try {
        // Detect link type from URL parameters or referrer
        let detectedLinkType = linkType || 'direct_link';
        let detectedSource = source || 'unknown';

        // Check URL parameters for tracking info
        const urlParams = new URLSearchParams(window.location.search);
        const urlSource = urlParams.get('source');
        if (urlSource) {
          detectedSource = urlSource;
          if (urlSource === 'qr_code') {
            detectedLinkType = 'qr_code';
          }
        }

        // Detect source from referrer
        if (document.referrer) {
          const referrer = document.referrer.toLowerCase();
          if (referrer.includes('facebook')) detectedSource = 'facebook';
          else if (referrer.includes('twitter')) detectedSource = 'twitter';
          else if (referrer.includes('linkedin')) detectedSource = 'linkedin';
          else if (referrer.includes('whatsapp')) detectedSource = 'whatsapp';
          else if (referrer.includes('mail') || referrer.includes('gmail')) detectedSource = 'email';
        }

        await fetch('/api/analytics/link-tracking', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            link_type: detectedLinkType,
            source: detectedSource,
            user_agent: navigator.userAgent,
            referrer: document.referrer,
            metadata: {
              url_params: Object.fromEntries(urlParams.entries()),
              timestamp: new Date().toISOString(),
            }
          }),
        });
      } catch {
        console.log('Failed to track link click:');
      }
    };

    trackLinkClick();
  }, [linkType, source]);

  return null; // This component doesn't render anything
}
