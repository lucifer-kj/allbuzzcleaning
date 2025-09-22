'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Share2, 
  QrCode, 
  Copy, 
  Check, 
  MessageSquare, 
  Mail, 
  Facebook, 
  Twitter, 
  Linkedin,
  Smartphone,
} from 'lucide-react';
import { ShareDropdown } from '@/components/ui/share-dropdown';
import { QRModal } from '@/components/ui/qr-modal';

interface SharePanelProps {
  businessId: string;
  businessName: string;
  reviewUrl: string;
}

export function SharePanel({ businessId, businessName, reviewUrl }: SharePanelProps) {
  const [showQRModal, setShowQRModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [customMessage, setCustomMessage] = useState(`I'd love to hear about your experience with ${businessName}! Please take a moment to share your feedback: ${reviewUrl}`);

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(reviewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.log('Failed to copy URL:');
    }
  };

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(customMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.log('Failed to copy message:');
    }
  };

  const trackShare = async (source: string, method: string) => {
    try {
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

  const shareViaWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(customMessage)}`;
    trackShare('whatsapp', 'direct');
    window.open(whatsappUrl, '_blank');
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Share your experience with ${businessName}`);
    const body = encodeURIComponent(customMessage);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    trackShare('email', 'direct');
    window.location.href = mailtoUrl;
  };

  const shareViaSMS = () => {
    const smsUrl = `sms:?body=${encodeURIComponent(customMessage)}`;
    trackShare('sms', 'direct');
    window.location.href = smsUrl;
  };

  const qrData = {
    url: reviewUrl,
    businessName,
  };

  return (
    <div className="space-y-6">
      {/* Review URL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Share2 className="w-5 h-5" />
            <span>Review Link</span>
          </CardTitle>
          <CardDescription>
            Share this link with your customers to collect reviews
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="review-url">Review URL</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="review-url"
                defaultValue={reviewUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button variant="outline" size="sm" onClick={copyUrl}>
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowQRModal(true)}>
              <QrCode className="w-4 h-4 mr-2" />
              QR Code
            </Button>
            <ShareDropdown 
              url={reviewUrl}
              title={`Review ${businessName}`}
              description={`Share your experience with ${businessName}`}
            />
          </div>
        </CardContent>
      </Card>

      {/* Custom Message */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Share Message</CardTitle>
          <CardDescription>
            Customize the message you send to customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="custom-message">Message</Label>
            <Textarea
              id="custom-message"
              defaultValue={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={copyMessage}>
              {copied ? <Check className="w-4 h-4 text-green-600 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              Copy Message
            </Button>
            <Button variant="outline" size="sm" onClick={shareViaWhatsApp}>
              <MessageSquare className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button variant="outline" size="sm" onClick={shareViaEmail}>
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            <Button variant="outline" size="sm" onClick={shareViaSMS}>
              <Smartphone className="w-4 h-4 mr-2" />
              SMS
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Share Options */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Share</CardTitle>
          <CardDescription>
            Share directly to social media platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(reviewUrl)}`;
                trackShare('facebook', 'quick_share');
                window.open(facebookUrl, '_blank', 'width=600,height=400');
              }}
              className="flex items-center space-x-2"
            >
              <Facebook className="w-4 h-4" />
              <span>Facebook</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Review ${businessName}`)}&url=${encodeURIComponent(reviewUrl)}`;
                trackShare('twitter', 'quick_share');
                window.open(twitterUrl, '_blank', 'width=600,height=400');
              }}
              className="flex items-center space-x-2"
            >
              <Twitter className="w-4 h-4" />
              <span>Twitter</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(reviewUrl)}`;
                trackShare('linkedin', 'quick_share');
                window.open(linkedinUrl, '_blank', 'width=600,height=400');
              }}
              className="flex items-center space-x-2"
            >
              <Linkedin className="w-4 h-4" />
              <span>LinkedIn</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Check out ${businessName}: ${reviewUrl}`)}`;
                trackShare('whatsapp', 'quick_share');
                window.open(whatsappUrl, '_blank');
              }}
              className="flex items-center space-x-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Modal */}
      <QRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        data={qrData}
      />
    </div>
  );
}
