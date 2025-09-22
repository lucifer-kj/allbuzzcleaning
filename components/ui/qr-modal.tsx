'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Copy, X, Smartphone } from 'lucide-react';
import QRCode from 'qrcode';
import { ShareDropdown } from '@/components/ui/share-dropdown';
import Image from 'next/image';
import { Input } from '@/components/ui/input';

interface QRCodeData {
  url: string;
  businessName: string;
  logoUrl?: string;
}

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: QRCodeData | null;
}

export function QRModal({ isOpen, onClose, data }: QRModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [qrSize, setQrSize] = useState<'small' | 'medium' | 'large'>('medium');

  const generateQRCode = useCallback(async (size: 'small' | 'medium' | 'large' = 'medium') => {
    if (!data) return;

    setLoading(true);
    try {
      const urlParts = data.url.split('/');
      const businessId = urlParts[urlParts.length - 1];

      const response = await fetch('/api/qr-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessId,
          size,
          includeTracking: true,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setQrCodeUrl(result.qrCode);
      } else {
        throw new Error(result.error || 'Failed to generate QR code');
      }
    } catch {
      console.log('Error generating QR code:');
      try {
        const dimensions = {
          small: 128,
          medium: 256,
          large: 512,
        } as const;

        const qrCodeDataURL = await QRCode.toDataURL(data.url, {
          width: dimensions[size],
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'M',
        });
        setQrCodeUrl(qrCodeDataURL);
      } catch {
        console.log('Fallback QR generation failed:');
      }
    } finally {
      setLoading(false);
    }
  }, [data]);

  const downloadQRCode = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `${data?.businessName?.replace(/\s+/g, '-') || 'business'}-qr-code.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const copyUrl = async () => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data.url);
    } catch {
      console.log('Failed to copy URL:');
    }
  };

  // Generate QR code when modal opens or size changes
  useEffect(() => {
    if (isOpen && data) {
      generateQRCode(qrSize);
    }
  }, [isOpen, data, qrSize, generateQRCode]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5" />
              <span>QR Code for {data?.businessName}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Size Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">QR Code Size:</label>
            <div className="flex space-x-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <Button
                  key={size}
                  variant={qrSize === size ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setQrSize(size)}
                  className="flex-1"
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* QR Code Display */}
          <div className="flex justify-center">
            {loading ? (
              <div className="w-80 h-80 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">Generating QR Code...</p>
                </div>
              </div>
            ) : qrCodeUrl ? (
              <div className="bg-white rounded-lg p-6 shadow-lg border">
                <Image 
                  src={qrCodeUrl} 
                  alt={`QR Code for ${data?.businessName}`} 
                  className="w-full h-full max-w-sm"
                  width={256}
                  height={256}
                />
              </div>
            ) : (
              <div className="w-80 h-80 bg-muted rounded-lg flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No QR Code Available</p>
              </div>
            )}
          </div>

          {/* URL Display */}
          {data && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Review URL:</label>
              <div className="flex items-center space-x-2">
                <Input
                  type="text"
                  defaultValue={data.url}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
                />
                <Button variant="outline" size="sm" onClick={copyUrl}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Share Options */}
          {data && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Share Options:</label>
              <div className="flex items-center space-x-2">
                <ShareDropdown 
                  url={data.url}
                  title={`Review ${data.businessName}`}
                  description={`Share your experience with ${data.businessName}`}
                />
                <Button
                  variant="outline"
                  onClick={downloadQRCode}
                  disabled={!qrCodeUrl}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download QR
                </Button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">How to use:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Print the QR code and place it at your business location</li>
              <li>• Share the URL directly with customers via email or SMS</li>
              <li>• Use the QR code in digital displays or marketing materials</li>
              <li>• Customers can scan with any smartphone camera</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
