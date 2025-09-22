'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, X, Building2, Globe, Star, MessageSquare } from 'lucide-react';
import { z } from 'zod';
import { createClient } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { AnimatedCard } from '@/components/ui/animated-card';

const settingsSchema = z.object({
  name: z.string().min(1, 'Business name is required').max(100, 'Business name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  google_business_url: z.string().optional().refine(
    (url) => {
      if (!url || url === '') return true;
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },
    'Invalid Google Business URL'
  ),
  logo_url: z.string().optional().refine(
    (url) => {
      if (!url || url === '') return true;
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },
    'Invalid logo URL'
  ),
  brand_color: z.string().optional().refine(
    (color) => {
      if (!color || color === '') return true;
      return /^#[0-9A-Fa-f]{6}$/.test(color);
    },
    'Invalid brand color format'
  ),
  welcome_message: z.string().max(200, 'Welcome message too long').optional(),
  thank_you_message: z.string().max(500, 'Thank you message too long').optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export function SettingsForm() {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: '',
      description: '',
      logo_url: '',
      google_business_url: '',
      brand_color: '#000000',
      welcome_message: '',
      thank_you_message: '',
    },
  });

  const brandColor = watch('brand_color');

  // Load existing settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data: settings, error } = await supabase
          .from('app_settings')
          .select('*')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading settings:', error);
          return;
        }

        if (settings) {
          setValue('name', settings.name || '');
          setValue('description', settings.description || '');
          setValue('logo_url', settings.logo_url || '');
          setValue('google_business_url', settings.google_business_url || '');
          setValue('brand_color', settings.brand_color || '#000000');
          setValue('welcome_message', settings.welcome_message || '');
          setValue('thank_you_message', settings.thank_you_message || '');
          setLogoPreview(settings.logo_url || null);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [supabase, setValue]);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      setLogoFile(file);
    } catch (error) {
      setUploadError('Failed to process image');
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
    setValue('logo_url', '');
  };

  const onSubmit = async (data: SettingsFormData) => {
    setSaving(true);
    setFormError(null);

    try {
      let logoUrl = data.logo_url;

      // Upload logo if there's a new file
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `logo-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, logoFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('logos')
          .getPublicUrl(fileName);

        logoUrl = publicUrl;
      }

      // Upsert settings
      const { error } = await supabase
        .from('app_settings')
        .upsert({
          name: data.name,
          description: data.description || null,
          logo_url: logoUrl || null,
          google_business_url: data.google_business_url || null,
          brand_color: data.brand_color || '#000000',
          welcome_message: data.welcome_message || null,
          thank_you_message: data.thank_you_message || null,
        });

      if (error) throw error;

      // Show success message
      toast({
        title: "Settings saved!",
        description: "Your business settings have been updated successfully.",
        variant: "success",
      });
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setFormError('Failed to save settings. Please try again.');
      
      toast({
        title: "Save Failed",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <AnimatedCard delay={0.1}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            All Buzz Cleaning Information
          </CardTitle>
          <CardDescription>
            Configure your cleaning service details and branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label>All Buzz Cleaning Logo</Label>
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={logoPreview || undefined} />
                <AvatarFallback>
                  <Building2 className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Logo'}
                </Button>
                {logoPreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeLogo}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
            {uploadError && (
              <p className="text-sm text-red-600">{uploadError}</p>
            )}
          </div>

          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Business Name *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="All Buzz Cleaning"
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Professional cleaning services for residential and commercial properties"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Brand Color */}
          <div className="space-y-2">
            <Label htmlFor="brand_color">Brand Color</Label>
            <div className="flex items-center gap-3">
              <Input
                id="brand_color"
                type="color"
                {...register('brand_color')}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                {...register('brand_color')}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
            {errors.brand_color && (
              <p className="text-sm text-red-600">{errors.brand_color.message}</p>
            )}
          </div>
        </CardContent>
      </AnimatedCard>

      <AnimatedCard delay={0.2}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Review Settings
          </CardTitle>
          <CardDescription>
            Configure how customers interact with your review system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Google Business URL */}
          <div className="space-y-2">
            <Label htmlFor="google_business_url">Google Business Profile URL</Label>
            <Input
              id="google_business_url"
              {...register('google_business_url')}
              placeholder="https://g.page/all-buzz-cleaning/review"
            />
            <p className="text-sm text-muted-foreground">
              Customers with high ratings (4-5 stars) will be redirected here
            </p>
            {errors.google_business_url && (
              <p className="text-sm text-red-600">{errors.google_business_url.message}</p>
            )}
          </div>

          {/* Welcome Message */}
          <div className="space-y-2">
            <Label htmlFor="welcome_message">Welcome Message</Label>
            <Textarea
              id="welcome_message"
              {...register('welcome_message')}
              placeholder="Thank you for choosing All Buzz Cleaning! Please share your experience."
              rows={2}
            />
            <p className="text-sm text-muted-foreground">
              This message appears at the top of your review page
            </p>
            {errors.welcome_message && (
              <p className="text-sm text-red-600">{errors.welcome_message.message}</p>
            )}
          </div>

          {/* Thank You Message */}
          <div className="space-y-2">
            <Label htmlFor="thank_you_message">Thank You Message</Label>
            <Textarea
              id="thank_you_message"
              {...register('thank_you_message')}
              placeholder="Thank you for your feedback! Your review helps us improve our cleaning services."
              rows={3}
            />
            <p className="text-sm text-muted-foreground">
              This message is shown after customers submit their review
            </p>
            {errors.thank_you_message && (
              <p className="text-sm text-red-600">{errors.thank_you_message.message}</p>
            )}
          </div>
        </CardContent>
      </AnimatedCard>

      {/* Preview Card */}
      <AnimatedCard delay={0.3}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Preview
          </CardTitle>
          <CardDescription>
            How your review page will appear to customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="p-6 rounded-lg border-2 border-dashed"
            style={{
              background: `linear-gradient(135deg, ${brandColor}15 0%, ${brandColor}08 100%)`
            }}
          >
            <div className="text-center space-y-4">
              <Avatar className="w-16 h-16 mx-auto border-4 border-white shadow-lg">
                <AvatarImage src={logoPreview || undefined} />
                <AvatarFallback className="bg-muted">
                  <Building2 className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 
                  className="text-xl font-semibold"
                  style={{ color: brandColor }}
                >
                  {watch('welcome_message') || watch('name') || 'Leave a Review'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {watch('description') || 'Share your experience with us'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </AnimatedCard>

      {/* Error Message */}
      {formError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{formError}</p>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={saving}
          className="min-w-[120px]"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
