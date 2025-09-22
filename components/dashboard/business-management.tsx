'use client';

import { useEffect, useState } from 'react';
// Single-business mode: this component is deprecated; keep placeholder UI
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Building2, 
  Edit, 
  Trash2, 
  ExternalLink, 
  QrCode,
  Loader2,
  Star,
  MessageSquare,
  Share
} from 'lucide-react';
import Link from 'next/link';
import { BusinessForm } from '@/components/forms/business-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QRModal } from '@/components/ui/qr-modal';
import { CopyButton } from '@/components/ui/copy-button';
import { SharePanel } from '@/components/ui/share-panel';
import { SharingAnalytics } from '@/components/dashboard/sharing-analytics';

interface Business {
  id: string;
  name: string;
  logo_url?: string | null;
  brand_color?: string | null;
  average_rating?: number | null;
  reviews_count?: number | null;
  description?: string | null;
  google_business_url?: string | null;
}

export function BusinessManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [activeTab, setActiveTab] = useState<'businesses' | 'sharing'>('businesses');

  const businesses: Business[] = [];
  const loading = false;
  const error = '';
  // Define inside effect to avoid changing dependency
  const fetchBusinesses = (): void => void 0;
  const createBusiness = async (data: unknown): Promise<Business | null> => (null as any);
  const updateBusinessRemote = async (id: string, data: unknown): Promise<void> => void 0;
  const deleteBusinessRemote = async (id: string): Promise<void> => void 0;

  useEffect(() => {
    const run = () => {
      fetchBusinesses();
    };
    run();
  }, []);

  const handleCreateBusiness = async (data: unknown) => {
    const created = await createBusiness(data);
    if (!created) {
      // Let the form show an error via its own catch block
      throw new Error('Failed to create business');
    }
    setShowForm(false);
    // Switch to sharing tab and select the new business so the link is visible
    setActiveTab('sharing');
    setSelectedBusiness(created);
  };

  const handleUpdateBusiness = async (data: unknown) => {
    if (!editingBusiness) return;
    await updateBusinessRemote(editingBusiness.id, data);
    setEditingBusiness(null);
  };

  const handleDeleteBusiness = async (businessId: string) => {
    if (!confirm('Are you sure you want to delete this business? This action cannot be undone.')) {
      return;
    }
    await deleteBusinessRemote(businessId);
  };

  const getReviewUrl = (businessId: string) => {
    return `${window.location.origin}/review/${businessId}`;
  };

  const getQRData = (business: Business) => {
    return {
      url: getReviewUrl(business.id),
      businessName: business.name,
      logoUrl: business.logo_url ?? undefined,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Keep UI visible and show inline error state instead of full page replacement
  const inlineError = error;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Business Management</h2>
          <p className="text-muted-foreground">
            Manage your business profiles and sharing settings
          </p>
        </div>
        {activeTab === 'businesses' && (
          <div className="flex items-center gap-3">
            {inlineError && (
              <span className="text-sm text-destructive">{inlineError}</span>
            )}
            <Button onClick={() => setShowForm(true)} className="mobile-button">
              <Plus className="mr-2 h-4 w-4" />
              Add Business
            </Button>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('businesses')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'businesses'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            }`}
          >
            <Building2 className="w-4 h-4 mr-2 inline" />
            Businesses
          </button>
          <button
            onClick={() => setActiveTab('sharing')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sharing'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
            }`}
          >
            <Share className="w-4 h-4 mr-2 inline" />
            Sharing & Analytics
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'businesses' && (
        <>
          {/* Businesses Grid */}
          {businesses.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Businesses Yet</CardTitle>
            <CardDescription>
              Create your first business profile to start collecting reviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Get Started</h3>
                  <p className="text-sm text-muted-foreground">
                    Add your first business to begin collecting customer reviews
                  </p>
                </div>
                <Button onClick={() => setShowForm(true)} className="mobile-button">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Business Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <Card key={business.id} className="interactive-hover">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={business.logo_url || undefined} />
                      <AvatarFallback className="bg-muted">
                        <Building2 className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg truncate">{business.name}</CardTitle>
                      <CardDescription className="truncate">
                        {business.description || 'No description'}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    style={{ 
                      backgroundColor: `${(business.brand_color ?? '#000000')}20`, 
                      color: business.brand_color ?? '#000000' 
                    }}
                  >
                    Active
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{business.average_rating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span>{business.reviews_count || 0} reviews</span>
                  </div>
                </div>

                {/* Review URL */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">
                    Review URL
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={getReviewUrl(business.id)}
                      readOnly
                      className="text-xs"
                    />
                    <CopyButton text={getReviewUrl(business.id)} />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedBusiness(business);
                      setShowQRModal(true);
                    }}
                    className="flex-1"
                  >
                    <QrCode className="w-4 h-4 mr-1" />
                    QR Code
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingBusiness(business)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteBusiness(business.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Quick Links */}
                <div className="flex items-center space-x-2 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="flex-1"
                  >
                    <Link href={`/review/${business.id}`} target="_blank">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Preview
                    </Link>
                  </Button>
                  {business.google_business_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="flex-1"
                    >
                      <Link href={business.google_business_url} target="_blank">
                        <Star className="w-4 h-4 mr-1" />
                        Google
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
          )}
        </>
      )}

      {/* Sharing Tab Content */}
      {activeTab === 'sharing' && (
        <div className="space-y-6">
          {businesses.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Share className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Businesses to Share</h3>
                  <p className="text-muted-foreground mb-4">
                    Create a business first to start sharing review links
                  </p>
                  <Button onClick={() => setActiveTab('businesses')}>
                    <Building2 className="w-4 h-4 mr-2" />
                    Manage Businesses
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Business Selector */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Business</CardTitle>
                  <CardDescription>
                    Choose a business to view sharing options and analytics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {businesses.map((business) => (
                      <Card 
                        key={business.id} 
                        className={`cursor-pointer transition-colors ${
                          selectedBusiness?.id === business.id 
                            ? 'ring-2 ring-primary' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedBusiness(business)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={business.logo_url || undefined} />
                              <AvatarFallback className="bg-muted">
                                <Building2 className="w-5 h-5" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-medium truncate">{business.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {business.reviews_count || 0} reviews
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Sharing Panel */}
              {selectedBusiness && (
                <SharePanel
                  businessId={selectedBusiness.id}
                  businessName={selectedBusiness.name}
                  reviewUrl={getReviewUrl(selectedBusiness.id)}
                />
              )}

              {/* Analytics */}
              {selectedBusiness && (
                <SharingAnalytics businessId={selectedBusiness.id} />
              )}
            </div>
          )}
        </div>
      )}

      {/* Business Form Modal */}
      <Dialog open={showForm || !!editingBusiness} onOpenChange={(open) => {
        if (!open) {
          setShowForm(false);
          setEditingBusiness(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBusiness ? 'Edit Business' : 'Create New Business'}
            </DialogTitle>
          </DialogHeader>
          <BusinessForm
            business={editingBusiness ? {
              ...editingBusiness,
              description: editingBusiness.description ?? undefined,
              logo_url: editingBusiness.logo_url ?? undefined,
              google_business_url: editingBusiness.google_business_url ?? undefined,
              brand_color: editingBusiness.brand_color ?? undefined,
            } : undefined}
            onSubmit={editingBusiness ? handleUpdateBusiness : handleCreateBusiness}
            onCancel={() => {
              setShowForm(false);
              setEditingBusiness(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <QRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        data={selectedBusiness ? getQRData(selectedBusiness) : null}
      />
    </div>
  );
}
