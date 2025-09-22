# All Buzz Cleaning - Review Management System

A professional review management application designed specifically for All Buzz Cleaning's global cleaning services. This intelligent system routes customer feedback based on ratings - high ratings (4-5 stars) redirect to Google Business Profile, while lower ratings are kept private for internal improvement.

## Features

- **Smart Review Routing**: Automatically directs high ratings to Google Business Profile and low ratings to private feedback
- **Global Accessibility**: Designed to work seamlessly across different regions for All Buzz Cleaning's international operations
- **Professional Dashboard**: Comprehensive analytics and review management for cleaning service operations
- **Custom Branding**: Fully customizable with All Buzz Cleaning's branding and colors
- **Mobile Optimized**: Responsive design that works perfectly on all devices
- **Real-time Analytics**: Track review trends, rating distributions, and conversion rates

## Technology Stack

- **Frontend**: Next.js 15 with React 19
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS with custom components
- **Real-time**: Supabase Realtime subscriptions
- **Analytics**: Custom analytics tracking with charts

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd all-buzz-cleaning-review-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. Run database migrations:
```bash
# Apply the migrations in the supabase/migrations folder
# This will set up the single-business schema for All Buzz Cleaning
```

5. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Configuration

### Business Settings

Configure All Buzz Cleaning's specific details through the dashboard:

1. **Business Information**:
   - Business name: "All Buzz Cleaning"
   - Description: Professional cleaning services description
   - Logo upload
   - Brand colors

2. **Review Settings**:
   - Google Business Profile URL for redirects
   - Custom welcome messages
   - Thank you messages

3. **Global Operations**:
   - The system is designed to work globally for All Buzz Cleaning's international cleaning services
   - Supports multiple languages and currencies
   - Timezone-aware analytics

## Usage

### For Customers
- Visit the review page to leave feedback about cleaning services
- High ratings (4-5 stars) are redirected to Google Business Profile
- Lower ratings are kept private for internal improvement

### For All Buzz Cleaning Management
- Access the dashboard to view analytics and manage reviews
- Configure business settings and branding
- Export review data and analytics
- Track conversion rates and customer satisfaction

## Global Deployment

This application is designed to work globally for All Buzz Cleaning:

- **Multi-region Support**: Can be deployed to different regions
- **Localization Ready**: Easy to adapt for different languages
- **Currency Support**: Analytics can track different currencies
- **Timezone Aware**: Handles multiple timezones for global operations

## Copyright

© 2024 Alpha Business Digital. All rights reserved.

This review management platform is provided to All Buzz Cleaning by Alpha Business Digital. The application is customized specifically for All Buzz Cleaning's professional cleaning services while maintaining Alpha Business Digital's copyright and branding.

## Support

For technical support or questions about the All Buzz Cleaning review management system, please contact Alpha Business Digital.

## License

This software is proprietary and licensed to All Buzz Cleaning. Unauthorized use, reproduction, or distribution is prohibited.