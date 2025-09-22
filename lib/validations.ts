import { z } from 'zod';

// Review form validation
export const reviewFormSchema = z.object({
  customer_name: z
    .string()
    .min(1, 'Customer name is required')
    .max(100, 'Customer name must be less than 100 characters'),
  customer_phone: z
    .string()
    .optional()
    .refine(
      (phone) => {
        if (!phone) return true;
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
      },
      'Please enter a valid phone number'
    ),
  rating: z
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
}).strict();

// Business form validation
export const businessFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Business name is required')
    .max(100, 'Business name must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
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
    'Please enter a valid URL'
  ),
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
    'Please enter a valid URL'
  ),
  phone: z
    .string()
    .optional()
    .refine(
      (phone) => {
        if (!phone) return true;
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
      },
      'Please enter a valid phone number'
    ),
  email: z.string().email('Please enter a valid email').optional(),
  address: z.string().optional(),
  website: z.string().optional().refine(
    (url) => {
      if (!url || url === '') return true;
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },
    'Please enter a valid URL'
  ),
  brand_color: z.string().optional(),
  welcome_message: z.string().optional(),
  thank_you_message: z.string().optional(),
}).strict();

// User profile validation
export const userProfileSchema = z.object({
  full_name: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be less than 100 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .optional()
    .refine(
      (phone) => {
        if (!phone) return true;
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
      },
      'Please enter a valid phone number'
    ),
}).strict();

// Analytics filter validation
export const analyticsFilterSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  metric_type: z
    .enum(['review_submitted', 'google_redirect', 'internal_feedback'])
    .optional(),
}).strict();

// Export types
export type ReviewFormData = z.infer<typeof reviewFormSchema>;
export type BusinessFormData = z.infer<typeof businessFormSchema>;
export type UserProfileData = z.infer<typeof userProfileSchema>;
export type AnalyticsFilterData = z.infer<typeof analyticsFilterSchema>;
