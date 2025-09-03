import { SignInForm } from "@/components/auth/SignInForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface SignInPageProps {
  searchParams: Promise<{
    message?: string;
    error?: string;
    redirect?: string;
  }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const message = params.message;
  const error = params.error;
  const redirect = params.redirect;
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Clip My Course</CardTitle>
          <CardDescription className="text-[0.8rem] leading-[1]">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Use
            </Link>{" "}
            and acknowledge the{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message === "password-reset" && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                Your password has been reset successfully. You can now sign in with your new
                password.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error === "no_token" && "Invalid or missing authentication token."}
                {error === "invalid_token" && "The authentication link is invalid or has expired."}
                {error === "invalid_token_type" && "Invalid authentication token type."}
                {error === "user_not_found" && "User account not found."}
                {error === "authentication_failed" && "Authentication failed. Please try again."}
                {![
                  "no_token",
                  "invalid_token",
                  "invalid_token_type",
                  "user_not_found",
                  "authentication_failed",
                ].includes(error) && "An error occurred during authentication."}
              </AlertDescription>
            </Alert>
          )}

          <SignInForm redirectUrl={redirect} />
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link 
                href={redirect ? `/auth/signup?redirect=${encodeURIComponent(redirect)}` : "/auth/signup"} 
                className="text-primary hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
