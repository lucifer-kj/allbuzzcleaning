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
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

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
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const supabase = createClient();
  const { toast } = useToast();
  
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

      // Smart routing based on rating
      if (data.rating >= 4) {
        // High rating - show success message briefly then redirect to Google Business Profile
        setIsSuccess(true);
        setIsRedirecting(true);
        
        toast({
          title: "Review submitted!",
          description: "Thank you for your positive feedback. Redirecting to Google...",
          variant: "success",
        });
        
        setTimeout(() => {
          if (business?.google_business_url) {
            window.location.href = business.google_business_url;
          } else {
            // If no Google Business URL is configured, show error message
            setSubmitError('Google Business Profile URL is not configured. Please contact the business owner.');
            setIsSuccess(false);
            setIsRedirecting(false);
            
            toast({
              title: "Configuration Error",
              description: "Google Business Profile URL is not configured.",
              variant: "destructive",
            });
          }
        }, 1500); // Show loading state for better UX
      } else {
        // Low rating - immediately redirect to feedback form (no thank you page)
        setIsRedirecting(true);
        
        toast({
          title: "Review submitted",
          description: "Redirecting to feedback form for additional details...",
          variant: "default",
        });
        
        setTimeout(() => {
          window.location.href = `/feedback/global?reviewId=${result.review.id}`;
        }, 500);
      }

    } catch (error) {
      console.error('Review submission error:', error);
      setSubmitError('Failed to submit review. Please try again.');
      
      toast({
        title: "Submission Failed",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <>
        <LoadingOverlay
          isVisible={isRedirecting}
          message={rating >= 4 
            ? 'Please wait... redirecting you to Google to share your positive review...'
            : 'Please wait... redirecting you to provide additional feedback...'
          }
          type="redirecting"
          redirectUrl={rating >= 4 ? business?.google_business_url : `/feedback/global?reviewId=${result?.review?.id}`}
        />
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
                  ? 'Please wait... redirecting you to Google to share your positive review...'
                  : 'Please wait... redirecting you to provide additional feedback...'
              )}
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <LoadingOverlay
        isVisible={isSubmitting}
        message="Submitting your review..."
        type="loading"
      />
      <motion.form 
        onSubmit={handleSubmit(onSubmit)} 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {submitError && (
          <motion.div 
            className="flex items-center space-x-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <AlertCircle className="w-4 h-4" />
            <span>{submitError}</span>
          </motion.div>
        )}

      {/* Customer Name */}
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
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
      </motion.div>

      {/* Customer Phone */}
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
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
      </motion.div>

      {/* Star Rating */}
      <motion.div 
        className="space-y-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
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
      </motion.div>


      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
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
      </motion.div>

      {/* Privacy Notice */}
      <motion.div 
        className="text-center text-xs text-muted-foreground"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
      >
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
      </motion.div>
      </motion.form>
    </>
  );
}
