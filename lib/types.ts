// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
  details?: unknown;
}

// App Settings Types (replaces Business types for single business model)
export interface AppSettings {
  id: boolean;
  name: string;
  description?: string;
  logo_url?: string;
  google_business_url?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  brand_color: string;
  welcome_message: string;
  thank_you_message: string;
  created_at: string;
  updated_at: string;
}

// Review Types
export interface Review {
  id: string;
  rating: number;
  comment?: string;
  customer_name?: string;
  customer_email?: string;
  allow_follow_up: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReviewCreateData {
  rating: number;
  comment?: string;
  customer_name?: string;
  customer_email?: string;
  allow_follow_up?: boolean;
}

export type ReviewUpdateData = Partial<ReviewCreateData>;

// Analytics Types
export interface AnalyticsMetrics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: RatingDistribution[];
  dailyTrends: DailyTrend[];
  period: number;
}

export interface RatingDistribution {
  rating: number;
  count: number;
  percentage: number;
}

export interface DailyTrend {
  date: string;
  reviews: number;
  averageRating: number;
}

export interface AnalyticsTrends {
  data: TrendData[];
  summary: {
    totalReviews: number;
    reviewGrowth: number;
    period: number;
    granularity: string;
  };
}

export interface TrendData {
  period: string;
  reviews: number;
  averageRating: number;
  ratingDistribution: RatingDistribution[];
}

// Sharing Types
export interface QRCodeData {
  data: string;
  url: string;
  business_name: string;
  format: 'png' | 'svg' | 'base64';
  size: number;
}

export interface ShareData {
  platform: 'whatsapp' | 'email' | 'sms' | 'facebook' | 'twitter' | 'linkedin';
  url: string;
  message: string;
  business_name: string;
}

export interface LinkTracking {
  id: string;
  link_type: 'direct' | 'qr_code' | 'social' | 'email';
  link_url: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

// Export Types
export interface ExportData {
  data: ExportReview[];
  analytics?: ExportAnalytics;
  metadata: {
    format: 'csv' | 'json';
    total_records: number;
    exported_at: string;
    user_id: string;
  };
}

export interface ExportReview {
  id: string;
  business_name: string;
  rating: number;
  comment?: string;
  customer_name?: string;
  customer_email?: string;
  allow_follow_up: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExportAnalytics {
  total_reviews: number;
  average_rating: number;
  rating_distribution: RatingDistribution[];
  export_date: string;
  period: {
    start: string;
    end: string;
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
}

// Pagination Types
export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationInfo;
}

// Dashboard Types
export interface DashboardMetrics {
  totalReviews: number;
  averageRating: number;
  totalBusinesses: number;
  recentReviews: Review[];
}

export interface ReviewTrend {
  date: string;
  reviews: number;
  averageRating: number;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: ValidationError[];
}