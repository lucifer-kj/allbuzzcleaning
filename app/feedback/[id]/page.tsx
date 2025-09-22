import { createClient } from '@/lib/supabase-server';
import { FeedbackForm } from '@/components/forms/feedback-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Shield } from 'lucide-react';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ reviewId?: string }>;
};

export default async function FeedbackPage(props: PageProps) {
  const { reviewId } = await props.searchParams;
  
  const supabase = await createClient();
  
  // Fetch settings
  const { data: settings } = await supabase
    .from('app_settings')
    .select('name, description')
    .single();

  // Fetch review data if reviewId is provided
  let review = null;
  if (reviewId) {
    const { data: reviewData } = await supabase
      .from('reviews')
      .select('customer_name, rating, comment')
      .eq('id', reviewId)
      .single();
    review = reviewData;
  }

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

          {/* Review Summary */}
          {review && (
            <div className="bg-muted rounded-lg p-4">
              <h4 className="font-medium mb-2">Your Review Summary</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><strong>Name:</strong> {review.customer_name}</p>
                <p><strong>Rating:</strong> {review.rating}/5 stars</p>
                {review.comment && (
                  <p><strong>Comment:</strong> {review.comment}</p>
                )}
              </div>
            </div>
          )}

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
