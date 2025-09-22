import { createClient } from '@/lib/supabase-server';
import { ReviewForm } from '@/components/forms/review-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Footer } from '@/components/ui/footer';
import { Building2 } from 'lucide-react';

export default async function PublicReviewPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from('app_settings')
    .select('*')
    .single();

  const brandColor = settings?.brand_color || '#000000';

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{
        background: `linear-gradient(135deg, ${brandColor}15 0%, ${brandColor}08 100%)`
      }}
    >
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md fade-in">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Avatar className="w-16 h-16 border-4 border-white shadow-lg">
                <AvatarImage src={settings?.logo_url || undefined} />
                <AvatarFallback className="bg-muted">
                  <Building2 className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle 
              className="text-2xl"
              style={{ color: brandColor }}
            >
              {settings?.welcome_message || settings?.name || 'All Buzz Cleaning - Leave a Review'}
            </CardTitle>
            <CardDescription>
              {settings?.description || 'Share your cleaning service experience with us'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReviewForm business={{
              name: settings?.name ?? undefined,
              brand_color: settings?.brand_color ?? undefined,
              thank_you_message: settings?.thank_you_message ?? undefined,
              google_business_url: settings?.google_business_url ?? undefined,
            }} />
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}

export async function generateMetadata() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from('app_settings')
    .select('name, description')
    .single();

  return {
    title: settings?.name ? `Review ${settings.name}` : 'All Buzz Cleaning - Leave a Review',
    description: settings?.description || 'Share your cleaning service experience with All Buzz Cleaning',
  };
}

