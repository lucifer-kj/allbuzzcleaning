import { Card } from '@/components/ui/card';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center mobile-container">
      <Card className="w-full max-w-md fade-in">
        {children}
      </Card>
    </div>
  );
}
