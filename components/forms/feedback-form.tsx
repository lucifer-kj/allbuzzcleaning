'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase';

const feedbackFormSchema = z.object({
  contact_email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  issue_category: z.string().min(1, 'Please select an issue category'),
  detailed_feedback: z.string().min(10, 'Please provide at least 10 characters of feedback'),
  allow_follow_up: z.boolean(),
});

type FeedbackFormData = z.infer<typeof feedbackFormSchema>;

interface FeedbackFormProps {
  reviewId?: string;
}

export function FeedbackForm({ reviewId }: FeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const supabase = createClient();
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: {
      contact_email: '',
      contact_phone: '',
      issue_category: '',
      detailed_feedback: '',
      allow_follow_up: false,
    },
  });

  const onSubmit = async (data: unknown) => {
    setIsSubmitting(true);

    try {
      // Store detailed feedback in analytics table
      const { error } = await supabase
        .from('analytics')
        .insert({
          metric_type: 'internal_feedback',
          value: 1,
          metadata: {
            review_id: reviewId,
            issue_category: (data as FeedbackFormData).issue_category,
            detailed_feedback: (data as FeedbackFormData).detailed_feedback,
            contact_email: (data as FeedbackFormData).contact_email || null,
            contact_phone: (data as FeedbackFormData) .contact_phone || null,
            allow_follow_up: (data as FeedbackFormData).allow_follow_up,
            submitted_at: new Date().toISOString(),
          },
          });

      if (error) throw error;

      setIsSuccess(true);

    } catch {
      throw new Error('Error submitting feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-green-600">Thank You!</h3>
          <p className="text-sm text-muted-foreground">
            Your feedback has been received and will help us improve our services.
          </p>
        </div>
        <Button 
          onClick={() => window.location.href = '/'}
          variant="outline"
          className="w-full"
        >
          Return to Homepage
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 
        The following error display was referencing a non-existent 'submitError' property on 'errors'.
        If you want to show a generic submit error, you should use a separate state variable, e.g. 'submitError', not 'errors.submitError'.
        For now, we remove this block to fix the error.
      */}

      {/* Contact Information */}
      <div className="space-y-4">
        <h4 className="font-medium">Contact Information (Optional)</h4>
        
        <div className="space-y-2">
          <Label htmlFor="contact_email">Email Address</Label>
          <Input
            id="contact_email"
            type="email"
            {...register('contact_email')}
            placeholder="email@business.com"
            className="mobile-touch-target"
          />
          {errors.contact_email && (
            <p className="text-sm text-destructive">{errors.contact_email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_phone">Phone Number</Label>
          <Input
            id="contact_phone"
            type="tel"
            {...register('contact_phone')}
            placeholder="123-456-7890"
            className="mobile-touch-target"
          />
          {errors.contact_phone && (
            <p className="text-sm text-destructive">{errors.contact_phone.message}</p>
          )}
        </div>
      </div>

      {/* Issue Category */}
      <div className="space-y-2">
        <Label htmlFor="issue_category">What was the main issue? *</Label>
        <Select onValueChange={(value) => setValue('issue_category', value)}>
          <SelectTrigger className="mobile-touch-target">
            <SelectValue placeholder="Select an issue category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="service_quality">Service Quality</SelectItem>
            <SelectItem value="staff_behavior">Staff Behavior</SelectItem>
            <SelectItem value="cleanliness">Cleanliness</SelectItem>
            <SelectItem value="wait_time">Wait Time</SelectItem>
            <SelectItem value="pricing">Pricing</SelectItem>
            <SelectItem value="product_quality">Product Quality</SelectItem>
            <SelectItem value="communication">Communication</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        {errors.issue_category && (
          <p className="text-sm text-destructive">{errors.issue_category.message}</p>
        )}
      </div>

      {/* Detailed Feedback */}
      <div className="space-y-2">
        <Label htmlFor="detailed_feedback">Please provide more details *</Label>
        <Textarea
          id="detailed_feedback"
          {...register('detailed_feedback')}
          placeholder="Tell us more about your experience and how we can improve..."
          rows={5}
          className="mobile-touch-target"
        />
        {errors.detailed_feedback && (
          <p className="text-sm text-destructive">{errors.detailed_feedback.message}</p>
        )}
      </div>

      {/* Follow-up Permission */}
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          id="allow_follow_up"
          {...register('allow_follow_up')}
          className="mt-1"
        />
        <div className="space-y-1">
          <Label htmlFor="allow_follow_up" className="text-sm">
            Allow follow-up contact
          </Label>
          <p className="text-xs text-muted-foreground">
            We may contact you to discuss your feedback and any improvements we make.
          </p>
        </div>
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
          'Submit Feedback'
        )}
      </Button>

      {/* Privacy Notice */}
      <div className="text-center text-xs text-muted-foreground">
        <p>
          This feedback is private and will only be used to improve our services.
        </p>
      </div>
    </form>
  );
}
