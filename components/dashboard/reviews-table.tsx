'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { StarRating } from '@/components/ui/star-rating';
import { Loader2, MessageSquare, ExternalLink, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  customer_name: string;
  customer_phone?: string;
  rating: number;
  comment?: string;
  is_public: boolean;
  created_at: string;
}

export function ReviewsTable() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch('/api/reviews');
        const data = await response.json();
        
        if (data.success) {
          setReviews(data.reviews);
        } else {
          setError(data.error || 'Failed to fetch reviews');
        }
      } catch {
        setError('Failed to fetch reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Reviews Yet</h3>
        <p className="text-muted-foreground mb-4">
          Start collecting reviews by sharing your review links with customers.
        </p>
        <Button asChild>
          <a href="/dashboard/settings">Configure Settings</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-md border p-4 bg-card">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{review.customer_name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{review.customer_name}</div>
                {review.customer_phone && (
                  <div className="text-xs text-muted-foreground">{review.customer_phone}</div>
                )}
              </div>
              <Badge variant={review.is_public ? 'default' : 'secondary'}>
                {review.is_public ? 'Public' : 'Private'}
              </Badge>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <StarRating value={review.rating} onChange={() => {}} readonly size="sm" showLabel={false} />
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
              </span>
            </div>

            <div className="mt-2">
              {review.comment ? (
                <p className="text-sm text-foreground">{review.comment}</p>
              ) : (
                <span className="text-sm text-muted-foreground">No comment</span>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Button variant="outline" size="sm" className="mobile-touch-target">
                <Eye className="w-4 h-4 mr-1" /> View
              </Button>
              {review.is_public && (
                <Button variant="outline" size="sm" className="mobile-touch-target">
                  <ExternalLink className="w-4 h-4 mr-1" /> Open
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop/tablet table */}
      <div className="rounded-md border hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {review.customer_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{review.customer_name}</div>
                      {review.customer_phone && (
                        <div className="text-sm text-muted-foreground">
                          {review.customer_phone}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <StarRating
                    value={review.rating}
                    onChange={() => {}}
                    readonly
                    size="sm"
                    showLabel={false}
                  />
                </TableCell>
                <TableCell>
                  {review.comment ? (
                    <div className="max-w-xs">
                      <p className="text-sm truncate">{review.comment}</p>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No comment</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={review.is_public ? 'default' : 'secondary'}>
                    {review.is_public ? 'Public' : 'Private'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {review.is_public && (
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {reviews.length} reviews</span>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
