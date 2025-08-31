import { checkAdminExists, isDatabaseEmpty } from "./actions/admin";
import { getCurrentUser } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import { Shield, ArrowRight, CheckCircle, User } from "lucide-react";
import { redirect } from "next/navigation";

interface HomeProps {
  searchParams: Promise<{
    message?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const message = params.message;
  
  const [adminExists, currentUser, dbEmpty] = await Promise.all([
    checkAdminExists(),
    getCurrentUser(),
    isDatabaseEmpty(),
  ]);

  // Special case: Database is completely empty (fresh install/development)
  if (dbEmpty) {
    return (
      <div className="min-h-screen bg-background">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <svg className="h-12 w-12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  {/* Waffle cone */}
                  <path
                    d="M7 11 L12 22 L17 11 Z"
                    fill="#D2691E"
                    stroke="#A0522D"
                    strokeWidth="0.5"
                  />
                  {/* Cone waffle pattern */}
                  <path
                    d="M8.5 13 L15.5 13 M9 15 L15 15 M9.5 17 L14.5 17 M10 19 L14 19 M10.5 21 L13.5 21"
                    stroke="#A0522D"
                    strokeWidth="0.3"
                    opacity="0.5"
                  />

                  {/* Bottom left scoop - Strawberry */}
                  <circle
                    cx="9.5"
                    cy="9"
                    r="2.5"
                    fill="#FFB6C1"
                    stroke="#FF69B4"
                    strokeWidth="0.5"
                  />

                  {/* Bottom right scoop - Vanilla */}
                  <circle
                    cx="14.5"
                    cy="9"
                    r="2.5"
                    fill="#FFFACD"
                    stroke="#F0E68C"
                    strokeWidth="0.5"
                  />

                  {/* Top scoop - Chocolate */}
                  <circle
                    cx="12"
                    cy="5"
                    r="2.5"
                    fill="#D2691E"
                    stroke="#8B4513"
                    strokeWidth="0.5"
                  />

                  {/* Highlights for depth */}
                  <ellipse cx="11" cy="4.5" rx="0.7" ry="0.5" fill="#E6A85C" opacity="0.6" />
                  <ellipse cx="8.5" cy="8.5" rx="0.7" ry="0.5" fill="#FFC0CB" opacity="0.7" />
                  <ellipse cx="13.5" cy="8.5" rx="0.7" ry="0.5" fill="#FFFFF0" opacity="0.7" />
                </svg>
              </div>
              <CardTitle className="text-2xl">Welcome to ClipMyCourse</CardTitle>
              <CardDescription>Your course creation platform is ready for development</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTitle>Fresh Installation Detected</AlertTitle>
                <AlertDescription>
                  The database is empty. Let&apos;s start by setting up an administrator account to
                  manage your application.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h3 className="font-semibold">Get Started</h3>
                <p className="text-sm text-muted-foreground">
                  Set up your administrator account to begin managing your application:
                </p>
              </div>

              <Button asChild className="w-full" size="lg" variant="default">
                <Link href="/auth/setup-admin">
                  Set Up Admin Account
                  <Shield className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!adminExists) {
    return (
      <div className="min-h-screen bg-background">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Shield className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl">Welcome to ClipMyCourse</CardTitle>
              <CardDescription>
                Let&apos;s get started by setting up your administrator account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTitle>First Time Setup Required</AlertTitle>
                <AlertDescription>
                  No administrator account has been created yet. You&apos;ll need to set up an admin
                  account to manage your application.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <h3 className="font-semibold">What happens next?</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Create your administrator email and password</li>
                  <li>Get full access to the admin dashboard</li>
                  <li>Start managing users and application settings</li>
                </ul>
              </div>

              <Button asChild className="w-full" size="lg">
                <Link href="/auth/setup-admin">
                  Set Up Admin Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // User is signed in - redirect to courses page
  if (currentUser) {
    redirect('/courses');
  }

  // No user signed in, but admin exists - redirect to login
  redirect('/auth/signin');
}
