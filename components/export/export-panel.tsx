'use client';

import React, { useState } from 'react';
import { Download, FileText, Calendar, Building2, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { exportReviewsToCSV, exportAnalyticsToCSV } from '@/lib/export-utils';

interface ExportPanelProps {
  reviews?: any[];
  analytics?: any[];
}

export function ExportPanel({ reviews = [], analytics = [] }: ExportPanelProps) {
  const [exportType, setExportType] = useState<'reviews' | 'analytics'>('reviews');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Filter data by date range if specified
      let filteredData = reviews;
      
      if (dateRange.from && dateRange.to) {
        filteredData = reviews.filter(review => {
          const reviewDate = new Date(review.created_at);
          return reviewDate >= dateRange.from! && reviewDate <= dateRange.to!;
        });
      }

      switch (exportType) {
        case 'reviews':
          exportReviewsToCSV(filteredData);
          break;
        case 'analytics':
          exportAnalyticsToCSV(analytics);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getExportIcon = () => {
    switch (exportType) {
      case 'reviews':
        return <FileText className="w-4 h-4" />;
      case 'analytics':
        return <BarChart3 className="w-4 h-4" />;
      default:
        return <Download className="w-4 h-4" />;
    }
  };

  const getExportDescription = () => {
    switch (exportType) {
      case 'reviews':
        return 'Export customer reviews with ratings and comments';
      case 'analytics':
        return 'Export analytics data including metrics and trends';
      default:
        return '';
    }
  };

  const getDataCount = () => {
    switch (exportType) {
      case 'reviews':
        return reviews.length;
      case 'analytics':
        return analytics.length;
      default:
        return 0;
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Data
        </CardTitle>
        <CardDescription>
          Download your data in CSV format for analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="export-type">Export Type</Label>
          <Select value={exportType} onValueChange={(value: any) => setExportType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select export type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reviews">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Reviews ({reviews.length})</span>
                </div>
              </SelectItem>
              <SelectItem value="analytics">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics ({analytics.length})</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Selection (only for reviews) */}
        {exportType === 'reviews' && (
          <div className="space-y-2">
            <Label>Date Range (Optional)</Label>
            <DateRangePicker
              from={dateRange.from}
              to={dateRange.to}
              onSelect={(range) => setDateRange(range)}
            />
          </div>
        )}

        {/* Export Info */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            {getExportIcon()}
            <span className="font-medium">{exportType.charAt(0).toUpperCase() + exportType.slice(1)} Export</span>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {getExportDescription()}
          </p>
          <p className="text-sm text-gray-500">
            Records to export: <span className="font-medium">{getDataCount()}</span>
          </p>
        </div>

        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={isExporting || getDataCount() === 0}
          className="w-full"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </>
          )}
        </Button>

        {/* Export Info */}
        <div className="text-xs text-gray-500 text-center">
          Data will be downloaded as a CSV file that can be opened in Excel or Google Sheets
        </div>
      </CardContent>
    </Card>
  );
}
