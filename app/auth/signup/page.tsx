import { SignUpForm } from "@/components/auth/SignUpForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface SignUpPageProps {
  searchParams: Promise<{
    redirect?: string;
  }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const redirect = params.redirect;
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to Clip My Course</CardTitle>
          <CardDescription className="text-[0.8rem] leading-[1]">
            By creating an account, you agree to our{" "}
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
          <SignUpForm redirectUrl={redirect} />
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link 
                href={redirect ? `/auth/signin?redirect=${encodeURIComponent(redirect)}` : "/auth/signin"} 
                className="text-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
