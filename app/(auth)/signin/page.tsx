import { SignInForm } from '@/components/auth/signin-form';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';

export default function SignInPage() {
  return (
    <>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <Star className="w-7 h-7 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-2xl">Welcome to Crux</CardTitle>
        <CardDescription>
          Sign in to manage your customer reviews intelligently
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <SignInForm />
        <div className="text-center text-sm text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </div>
      </CardContent>
    </>
  );
}
