import { createClient } from '@/lib/supabase-server';

export interface EmailNotificationData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface ReviewNotificationData {
  businessName: string;
  customerName: string;
  rating: number;
  comment?: string;
  reviewUrl: string;
  businessOwnerEmail: string;
}

export interface WeeklyReportData {
  businessName: string;
  businessOwnerEmail: string;
  totalReviews: number;
  averageRating: number;
  newReviews: number;
  lowRatingReviews: number;
  topReviews: Array<{
    customerName: string;
    rating: number;
    comment?: string;
  }>;
  reportUrl: string;
}

export interface LowRatingAlertData {
  businessName: string;
  businessOwnerEmail: string;
  customerName: string;
  rating: number;
  comment?: string;
  reviewUrl: string;
}

/**
 * Send email notification using Supabase Edge Functions or external service
 */
export async function sendEmailNotification(data: EmailNotificationData): Promise<boolean> {
  try {
    // In a real implementation, you would:
    // 1. Use Supabase Edge Functions to send emails
    // 2. Or integrate with services like Resend, SendGrid, etc.
    // 3. Or use Supabase's built-in email service
    
    console.log('Sending email notification:', {
      to: data.to,
      subject: data.subject,
      htmlLength: data.html.length,
    });

    // For now, we'll simulate email sending
    // In production, replace this with actual email service
    const supabase = await createClient();
    
    // You could store email logs in a database table
    const { error } = await supabase
      .from('email_logs')
      .insert({
        to_email: data.to,
        subject: data.subject,
        html_content: data.html,
        text_content: data.text,
        sent_at: new Date().toISOString(),
        status: 'sent', // or 'failed'
      });

    if (error) {
      console.error('Error logging email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
}

/**
 * Send new review notification
 */
export async function sendNewReviewNotification(data: ReviewNotificationData): Promise<boolean> {
  const subject = `New ${data.rating}-Star Review for ${data.businessName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .rating { color: #f39c12; font-size: 18px; font-weight: bold; }
        .review-box { background: #fff; border: 1px solid #e9ecef; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .button { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Review Received!</h2>
          <p>You've received a new review for <strong>${data.businessName}</strong></p>
        </div>
        
        <div class="review-box">
          <h3>Review Details</h3>
          <p><strong>Customer:</strong> ${data.customerName}</p>
          <p><strong>Rating:</strong> <span class="rating">${'★'.repeat(data.rating)}${'☆'.repeat(5 - data.rating)}</span> (${data.rating}/5)</p>
          ${data.comment ? `<p><strong>Comment:</strong> ${data.comment}</p>` : ''}
        </div>
        
        <p>
          <a href="${data.reviewUrl}" class="button">View Review</a>
        </p>
        
        <div class="footer">
          <p>This email was sent from your Crux Review Management system.</p>
          <p>To manage your notification preferences, please log into your dashboard.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
New Review Received!

You've received a new review for ${data.businessName}

Customer: ${data.customerName}
Rating: ${data.rating}/5 stars
${data.comment ? `Comment: ${data.comment}` : ''}

View the review: ${data.reviewUrl}

This email was sent from your Crux Review Management system.
  `;

  return await sendEmailNotification({
    to: data.businessOwnerEmail,
    subject,
    html,
    text,
  });
}

/**
 * Send low rating alert
 */
export async function sendLowRatingAlert(data: LowRatingAlertData): Promise<boolean> {
  const subject = `⚠️ Low Rating Alert: ${data.rating}-Star Review for ${data.businessName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .alert { color: #856404; font-weight: bold; }
        .rating { color: #dc3545; font-size: 18px; font-weight: bold; }
        .review-box { background: #fff; border: 1px solid #e9ecef; padding: 15px; border-radius: 8px; margin: 15px 0; }
        .button { background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 class="alert">⚠️ Low Rating Alert</h2>
          <p>You've received a low rating review for <strong>${data.businessName}</strong> that may need your attention.</p>
        </div>
        
        <div class="review-box">
          <h3>Review Details</h3>
          <p><strong>Customer:</strong> ${data.customerName}</p>
          <p><strong>Rating:</strong> <span class="rating">${'★'.repeat(data.rating)}${'☆'.repeat(5 - data.rating)}</span> (${data.rating}/5)</p>
          ${data.comment ? `<p><strong>Comment:</strong> ${data.comment}</p>` : ''}
        </div>
        
        <p>
          <a href="${data.reviewUrl}" class="button">View & Respond to Review</a>
        </p>
        
        <div class="footer">
          <p>This email was sent from your Crux Review Management system.</p>
          <p>Consider reaching out to the customer to address their concerns.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
⚠️ Low Rating Alert

You've received a low rating review for ${data.businessName} that may need your attention.

Customer: ${data.customerName}
Rating: ${data.rating}/5 stars
${data.comment ? `Comment: ${data.comment}` : ''}

View and respond to the review: ${data.reviewUrl}

Consider reaching out to the customer to address their concerns.

This email was sent from your Crux Review Management system.
  `;

  return await sendEmailNotification({
    to: data.businessOwnerEmail,
    subject,
    html,
    text,
  });
}

/**
 * Send weekly summary report
 */
export async function sendWeeklyReport(data: WeeklyReportData): Promise<boolean> {
  const subject = `📊 Weekly Review Summary for ${data.businessName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
        .stat-box { background: #fff; border: 1px solid #e9ecef; padding: 15px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 24px; font-weight: bold; color: #007bff; }
        .stat-label { font-size: 12px; color: #6c757d; text-transform: uppercase; }
        .review-box { background: #fff; border: 1px solid #e9ecef; padding: 15px; border-radius: 8px; margin: 10px 0; }
        .rating { color: #f39c12; }
        .button { background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; font-size: 12px; color: #6c757d; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>📊 Weekly Review Summary</h2>
          <p>Here's your weekly review summary for <strong>${data.businessName}</strong></p>
        </div>
        
        <div class="stats">
          <div class="stat-box">
            <div class="stat-number">${data.totalReviews}</div>
            <div class="stat-label">Total Reviews</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${data.averageRating.toFixed(1)}</div>
            <div class="stat-label">Average Rating</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${data.newReviews}</div>
            <div class="stat-label">New This Week</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${data.lowRatingReviews}</div>
            <div class="stat-label">Low Ratings</div>
          </div>
        </div>
        
        ${data.topReviews.length > 0 ? `
        <h3>Recent Reviews</h3>
        ${data.topReviews.map(review => `
          <div class="review-box">
            <p><strong>${review.customerName}</strong> - <span class="rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span></p>
            ${review.comment ? `<p>${review.comment}</p>` : ''}
          </div>
        `).join('')}
        ` : ''}
        
        <p>
          <a href="${data.reportUrl}" class="button">View Full Report</a>
        </p>
        
        <div class="footer">
          <p>This weekly summary was generated by your Crux Review Management system.</p>
          <p>To customize your notification preferences, please log into your dashboard.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
📊 Weekly Review Summary for ${data.businessName}

Total Reviews: ${data.totalReviews}
Average Rating: ${data.averageRating.toFixed(1)}/5
New Reviews This Week: ${data.newReviews}
Low Rating Reviews: ${data.lowRatingReviews}

${data.topReviews.length > 0 ? `
Recent Reviews:
${data.topReviews.map(review => `
- ${review.customerName}: ${review.rating}/5 stars
${review.comment ? `  "${review.comment}"` : ''}
`).join('')}
` : ''}

View full report: ${data.reportUrl}

This weekly summary was generated by your Crux Review Management system.
  `;

  return await sendEmailNotification({
    to: data.businessOwnerEmail,
    subject,
    html,
    text,
  });
}
