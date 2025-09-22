'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewFormSchema, type ReviewFormData } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/ui/star-rating';
import { AlertCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface ReviewBusinessInfo {
  name?: string;
  brand_color?: string;
  thank_you_message?: string;
  google_business_url?: string;
}

interface ReviewFormProps {
  business?: ReviewBusinessInfo;
}

export function ReviewForm({ business }: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  
  const supabase = createClient();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      customer_name: '',
      customer_phone: '',
      rating: 0,
    },
  });

  const rating = watch('rating');

  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Submit review via API route
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit review');
      }

      setIsSuccess(true);

      // Smart routing based on rating
      setTimeout(() => {
        if (data.rating >= 4) {
          // High rating - redirect to Google Business Profile
          if (business?.google_business_url) {
            window.location.href = business.google_business_url;
          } else {
            // If no Google Business URL is configured, show error message
            setSubmitError('Google Business Profile URL is not configured. Please contact the business owner.');
            setIsSuccess(false);
            return;
          }
        } else {
          // Low rating - redirect to internal feedback page
          window.location.href = `/feedback/global?reviewId=${result.review.id}`;
        }
      }, 2000);

    } catch (error) {
      console.error('Review submission error:', error);
      setSubmitError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-green-600">Thank you!</h3>
          <p className="text-sm text-muted-foreground">
            {business?.thank_you_message || (
              rating >= 4 
                ? 'Redirecting you to Google to share your positive review...'
                : 'Redirecting you to provide additional feedback...'
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {submitError && (
        <div className="flex items-center space-x-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md">
          <AlertCircle className="w-4 h-4" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Customer Name */}
      <div className="space-y-2">
        <Label htmlFor="customer_name">Your Name *</Label>
        <Input
          id="customer_name"
          {...register('customer_name')}
          placeholder="Enter your full name"
          className="mobile-touch-target"
        />
        {errors.customer_name && (
          <p className="text-sm text-destructive">{errors.customer_name.message}</p>
        )}
      </div>

      {/* Customer Phone */}
      <div className="space-y-2">
        <Label htmlFor="customer_phone">Phone Number (Optional)</Label>
        <Input
          id="customer_phone"
          type="tel"
          {...register('customer_phone')}
          placeholder="Enter your phone number"
          className="mobile-touch-target"
        />
        {errors.customer_phone && (
          <p className="text-sm text-destructive">{errors.customer_phone.message}</p>
        )}
      </div>

      {/* Star Rating */}
      <div className="space-y-2">
        <Label>How would you rate your cleaning service experience? *</Label>
        <div className="flex justify-center">
          <StarRating
            value={rating}
            onChange={(value) => setValue('rating', value)}
            size="lg"
          />
        </div>
        {errors.rating && (
          <p className="text-sm text-destructive text-center">{errors.rating.message}</p>
        )}
      </div>


      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full mobile-touch-target"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Review'
        )}
      </Button>

      {/* Privacy Notice */}
      <div className="text-center text-xs text-muted-foreground">
        <p>
          By submitting this review, you agree to our Terms of Service and Privacy Policy.
          {rating >= 4 && rating > 0 && (
            <span className="block mt-1 text-green-600">
              High ratings will be shared on Google Business Profile to help other customers.
            </span>
          )}
          {rating < 4 && rating > 0 && (
            <span className="block mt-1 text-orange-600">
              Lower ratings will be kept private for internal improvement of our cleaning services.
            </span>
          )}
        </p>
      </div>
    </form>
  );
}
