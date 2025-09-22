'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Share2, 
  MessageSquare, 
  Mail, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Copy,
  Check
} from 'lucide-react';

interface ShareDropdownProps {
  url: string;
  title: string;
  description: string;
}

export function ShareDropdown({ url, title, description }: ShareDropdownProps) {
  const [copied, setCopied] = useState(false);

  const shareData = {
    url,
    title,
    text: description,
  };

  const trackShare = async (source: string, method: string) => {
    try {
      // Extract business ID from URL if possible
      const urlParts = url.split('/');
      const businessId = urlParts[urlParts.length - 1];
      
      await fetch('/api/analytics/link-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_id: businessId,
          link_type: 'social_share',
          source: source,
          user_agent: navigator.userAgent,
          referrer: document.referrer,
          metadata: { method }
        }),
      });
    } catch {
      console.log('Failed to track share:');
    }
  };

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageSquare,
      action: () => {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${title}: ${url}`)}`;
        trackShare('whatsapp', 'dropdown');
        window.open(whatsappUrl, '_blank');
      },
    },
    {
      name: 'Email',
      icon: Mail,
      action: () => {
        const subject = encodeURIComponent(title);
        const body = encodeURIComponent(`${description}\n\n${url}`);
        const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
        trackShare('email', 'dropdown');
        window.location.href = mailtoUrl;
      },
    },
    {
      name: 'Facebook',
      icon: Facebook,
      action: () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        trackShare('facebook', 'dropdown');
        window.open(facebookUrl, '_blank', 'width=600,height=400');
      },
    },
    {
      name: 'Twitter',
      icon: Twitter,
      action: () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
        trackShare('twitter', 'dropdown');
        window.open(twitterUrl, '_blank', 'width=600,height=400');
      },
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      action: () => {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        trackShare('linkedin', 'dropdown');
        window.open(linkedinUrl, '_blank', 'width=600,height=400');
      },
    },
    {
      name: 'Copy Link',
      icon: copied ? Check : Copy,
      action: async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          trackShare('copy', 'dropdown');
        } catch {
          console.log('Failed to copy link:');
        }
      },
    },
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        trackShare('native', 'dropdown');
      } catch {
        console.log('Error sharing:');
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex-1">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* Native Share API (mobile) */}
        {'share' in navigator && typeof navigator.share === 'function' && (
          <>
            <DropdownMenuItem onClick={handleNativeShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share...
            </DropdownMenuItem>
            <div className="border-t my-1" />
          </>
        )}
        
        {/* Platform-specific sharing */}
        {shareOptions.map((option) => (
          <DropdownMenuItem key={option.name} onClick={option.action}>
            <option.icon className="w-4 h-4 mr-2" />
            {option.name}
            {option.name === 'Copy Link' && copied && (
              <span className="ml-auto text-xs text-green-600">Copied!</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
