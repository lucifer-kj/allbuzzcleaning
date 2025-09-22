'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, X, Building2, MapPin, Phone, Globe, Star } from 'lucide-react';
import { businessFormSchema, type BusinessFormData } from '@/lib/validations';
import { createClient } from '@/lib/supabase';

interface BusinessFormProps {
  business?: BusinessFormData;
  onSubmit: (form: BusinessFormData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export function BusinessForm({
  business,
  onSubmit,
  onCancel,
  loading = false,
}: BusinessFormProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(business?.logo_url ?? null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: business ?? {
      name: '',
      description: '',
      logo_url: '',
      google_business_url: '',
      phone: '',
      email: '',
      address: '',
      website: '',
      brand_color: '#000000',
      welcome_message: '',
      thank_you_message: '',
    },
  });

  /** Handle file selection for logo */
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setUploadError(null);
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB.');
      return;
    }

    setLogoFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setLogoPreview(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  /** Remove selected logo */
  const removeLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
    setValue('logo_url', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /** Upload logo file to Supabase storage */
  const uploadLogoToStorage = async (): Promise<string | null> => {
    if (!logoFile) return business?.logo_url ?? null;

    try {
      setUploading(true);
      setUploadError(null);
      const supabase = createClient();

      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

      const { error } = await supabase.storage
        .from('business-logos')
        .upload(fileName, logoFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data } = supabase.storage.from('business-logos').getPublicUrl(fileName);
      return data.publicUrl ?? null;
    } catch (e) {
      console.error('Error uploading logo:', e);
      setUploadError('Failed to upload logo. Please try again.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  /** Final form submission */
  const onFormSubmit = async (formData: BusinessFormData) => {
    try {
      setFormError(null);
      let logoUrl = formData.logo_url;

      if (logoFile) {
        const uploaded = await uploadLogoToStorage();
        if (!uploaded) {
          setFormError('Logo upload failed. Please fix the error and try again.');
          return;
        }
        logoUrl = uploaded;
        setValue('logo_url', logoUrl);
      }

      await onSubmit({ ...formData, logo_url: logoUrl });
    } catch (e) {
      console.error('Error submitting form:', e);
      setFormError('Failed to save business. Please try again.');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto fade-in">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building2 className="w-5 h-5" />
          <span>{business ? 'Edit Business' : 'Create New Business'}</span>
        </CardTitle>
        <CardDescription>
          Set up your business profile and customize your review experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Business Logo</Label>
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20 border-2 border-border">
                <AvatarImage src={logoPreview ?? undefined} alt="Business logo" />
                <AvatarFallback className="bg-muted">
                  <Building2 className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {logoPreview ? 'Change Logo' : 'Upload Logo'}
                </Button>
                {logoPreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeLogo}
                    disabled={uploading}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Upload a square logo (recommended: 200x200px, max 5MB)
            </p>
            {uploadError && (
              <p className="text-sm text-destructive">{uploadError}</p>
            )}
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Basic Information</Label>

            <div className="space-y-2">
              <Label htmlFor="name">Business Name *</Label>
              <Input id="name" {...register('name')} placeholder="Enter your business name" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Brief description of your business"
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Temporarily disabled until database migration */}
            {/*
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    {...register('phone')}
                    placeholder="123-456-7890"
                    className="pl-10"
                  />
                </div>
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="email@business.com"
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="address" {...register('address')} placeholder="123 Main St, City, State" className="pl-10" />
              </div>
              {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
            </div>
            */}
          </div>

          {/* Online Presence */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Online Presence</Label>

            {/* Temporarily disabled until database migration */}
            {/*
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="website" {...register('website')} placeholder="https://www.business.com" className="pl-10" />
              </div>
              {errors.website && <p className="text-sm text-destructive">{errors.website.message}</p>}
            </div>
            */}

            <div className="space-y-2">
              <Label htmlFor="google_business_url">Google Business Profile URL</Label>
              <div className="relative">
                <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="google_business_url"
                  {...register('google_business_url')}
                  placeholder="https://g.page/business"
                  className="pl-10"
                />
              </div>
              {errors.google_business_url && (
                <p className="text-sm text-destructive">{errors.google_business_url.message}</p>
              )}
            </div>
          </div>

          {/* Temporarily disabled until database migration */}
          {/*
          <div className="space-y-4">
            <Label className="text-base font-semibold">Branding</Label>

            <div className="space-y-2">
              <Label htmlFor="brand_color">Brand Color</Label>
              <div className="flex items-center space-x-3">
                <Input
                  id="brand_color"
                  type="color"
                  {...register('brand_color')}
                  className="w-16 h-10 p-1 border rounded cursor-pointer"
                />
                {errors.brand_color && <p className="text-sm text-destructive">{errors.brand_color.message}</p>}
              </div>
              <p className="text-sm text-muted-foreground">
                This color will be used in your review forms and branding
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Custom Messages</Label>

            <div className="space-y-2">
              <Label htmlFor="welcome_message">Welcome Message</Label>
              <Textarea
                id="welcome_message"
                {...register('welcome_message')}
                placeholder="Welcome message shown to customers"
                rows={2}
              />
              {errors.welcome_message && (
                <p className="text-sm text-destructive">{errors.welcome_message.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="thank_you_message">Thank You Message</Label>
              <Textarea
                id="thank_you_message"
                {...register('thank_you_message')}
                placeholder="Message shown after review submission"
                rows={2}
              />
              {errors.thank_you_message && (
                <p className="text-sm text-destructive">{errors.thank_you_message.message}</p>
              )}
            </div>
          </div>
          */}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            {formError && (
              <p className="text-sm text-destructive flex-1">{formError}</p>
            )}
            <Button type="submit" disabled={loading || uploading} className="flex-1">
              {loading || uploading ? 'Saving...' : business ? 'Update Business' : 'Create Business'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading || uploading}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
