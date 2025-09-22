import { format } from 'date-fns';

export interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  filename: string;
}

export interface ReviewExportData {
  id: string;
  customer_name: string;
  customer_email?: string;
  rating: number;
  comment?: string;
  created_at: string;
  allow_follow_up: boolean;
}

export interface AnalyticsExportData {
  date: string;
  total_reviews: number;
  average_rating: number;
  new_reviews: number;
  link_clicks: number;
}

/**
 * Convert data to CSV format
 */
export function convertToCSV(data: ExportData): string {
  const csvHeaders = data.headers.join(',');
  const csvRows = data.rows.map(row => 
    row.map(cell => {
      // Escape commas and quotes in cell values
      const cellStr = String(cell);
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`;
      }
      return cellStr;
    }).join(',')
  );
  
  return [csvHeaders, ...csvRows].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Export reviews to CSV
 */
export function exportReviewsToCSV(reviews: ReviewExportData[]): void {
  const headers = [
    'ID',
    'Customer Name',
    'Customer Email',
    'Rating',
    'Comment',
    'Created At',
    'Allow Follow Up'
  ];

  const rows = reviews.map(review => [
    review.id,
    review.customer_name || '',
    review.customer_email || '',
    review.rating,
    review.comment || '',
    format(new Date(review.created_at), 'yyyy-MM-dd HH:mm:ss'),
    review.allow_follow_up ? 'Yes' : 'No'
  ]);

  const filename = `reviews_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;

  const csvContent = convertToCSV({ headers, rows, filename });
  downloadCSV(csvContent, filename);
}

/**
 * Export analytics to CSV
 */
export function exportAnalyticsToCSV(analytics: AnalyticsExportData[]): void {
  const headers = [
    'Date',
    'Total Reviews',
    'Average Rating',
    'New Reviews',
    'Link Clicks'
  ];

  const rows = analytics.map(data => [
    data.date,
    data.total_reviews,
    data.average_rating.toFixed(2),
    data.new_reviews,
    data.link_clicks
  ]);

  const filename = `analytics_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;

  const csvContent = convertToCSV({ headers, rows, filename });
  downloadCSV(csvContent, filename);
}

/**
 * Export business data to CSV
 */
export interface BusinessExportData {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  google_business_url?: string;
  created_at: string;
  reviews_count?: number;
  average_rating?: number;
}

export function exportBusinessesToCSV(businesses: BusinessExportData[]): void {
  const headers = [
    'ID',
    'Name',
    'Description',
    'Address',
    'Phone',
    'Email',
    'Website',
    'Google Business URL',
    'Created At',
    'Reviews Count',
    'Average Rating'
  ];

  const rows = businesses.map(business => [
    business.id,
    business.name,
    business.description || '',
    business.address || '',
    business.phone || '',
    business.email || '',
    business.website || '',
    business.google_business_url || '',
    format(new Date(business.created_at), 'yyyy-MM-dd HH:mm:ss'),
    business.reviews_count || 0,
    business.average_rating ? business.average_rating.toFixed(2) : '0.00'
  ]);

  const filename = `businesses_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
  const csvContent = convertToCSV({ headers, rows, filename });
  downloadCSV(csvContent, filename);
}

/**
 * Generate PDF report (placeholder - would need jsPDF or similar library)
 */
export async function generatePDFReport(
  data: unknown,
  type: 'reviews' | 'analytics' | 'businesses'
): Promise<void> {
  // This would require jsPDF or similar library
  // For now, we'll just log the data structure
  console.log(`Generating PDF report for ${type}:`, data);
  
  // In a real implementation, you would:
  // 1. Import jsPDF
  // 2. Create a new PDF document
  // 3. Add headers, tables, charts
  // 4. Generate and download the PDF
  
  throw new Error('PDF generation not implemented yet. Please use CSV export.');
}
