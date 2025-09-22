import { createClient } from '@/lib/supabase-server';
import { FeedbackForm } from '@/components/forms/feedback-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Shield } from 'lucide-react';

type PageProps = {
  searchParams: Promise<{ reviewId?: string }>;
};

export default async function GlobalFeedbackPage(props: PageProps) {
  const { reviewId } = await props.searchParams;
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from('app_settings')
    .select('name')
    .single();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Help Us Improve</CardTitle>
          <CardDescription>
            Your feedback is valuable to {settings?.name || 'our business'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Privacy Assurance */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">Your Privacy is Protected</h4>
                <p className="text-sm text-green-700 mt-1">
                  This feedback is private and will only be used to improve our services. 
                  It will not be shared publicly.
                </p>
              </div>
            </div>
          </div>

          <FeedbackForm reviewId={reviewId} />
        </CardContent>
      </Card>
    </div>
  );
}

export async function generateMetadata() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from('app_settings')
    .select('name')
    .single();

  return {
    title: settings?.name ? `Feedback for ${settings.name}` : 'Provide Feedback',
    description: 'Help us improve by sharing your detailed feedback',
  };
}

