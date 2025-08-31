"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock } from "lucide-react";
import Link from "next/link";

const emailPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const magicLinkSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type EmailPasswordData = z.infer<typeof emailPasswordSchema>;
type MagicLinkData = z.infer<typeof magicLinkSchema>;

interface SignInFormProps {
  redirectUrl?: string;
}

export function SignInForm({ redirectUrl }: SignInFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const emailPasswordForm = useForm<EmailPasswordData>({
    resolver: zodResolver(emailPasswordSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const magicLinkForm = useForm<MagicLinkData>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onEmailPasswordSubmit(data: EmailPasswordData) {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔐 Attempting to sign in with email:", data.email);

      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "password",
          email: data.email,
          password: data.password,
          redirectUrl: redirectUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("❌ Sign in failed:", result.error);
        throw new Error(result.error || "Failed to sign in");
      }

      console.log("✅ Sign in successful for:", data.email);
      
      // Redirect to the specified URL or default to /courses
      const redirectTo = redirectUrl ? decodeURIComponent(redirectUrl) : "/courses";
      console.log("🔄 Redirecting to:", redirectTo);
      
      // Force a full page refresh to ensure all components update their session state
      window.location.href = redirectTo;
    } catch (err) {
      console.error("❌ Sign in error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  async function onMagicLinkSubmit(data: MagicLinkData) {
    try {
      setIsLoading(true);
      setError(null);

      console.log("🔐 Attempting to send magic link to:", data.email);

      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "magiclink",
          email: data.email,
          redirectUrl: redirectUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("❌ Magic link failed:", result.error);
        throw new Error(result.error || "Failed to send magic link");
      }

      console.log("✅ Magic link sent successfully to:", data.email);
      setMagicLinkSent(true);
    } catch (err) {
      console.error("❌ Magic link error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  if (magicLinkSent) {
    return (
      <div className="space-y-4">
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            Check your email! We&apos;ve sent a magic link to sign in.
          </AlertDescription>
        </Alert>
        <Button variant="outline" className="w-full" onClick={() => setMagicLinkSent(false)}>
          Back to Sign In
        </Button>
      </div>
    );
  }

  return (
    <Tabs defaultValue="password" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="password">Email & Password</TabsTrigger>
        <TabsTrigger value="magiclink">Magic Link</TabsTrigger>
      </TabsList>

      <TabsContent value="password" className="space-y-4">
        <Form {...emailPasswordForm}>
          <form
            onSubmit={emailPasswordForm.handleSubmit(onEmailPasswordSubmit)}
            className="space-y-4"
          >
            <FormField
              control={emailPasswordForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={emailPasswordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              <Lock className="mr-2 h-4 w-4" />
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-muted-foreground hover:text-primary hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="magiclink" className="space-y-4">
        <Form {...magicLinkForm}>
          <form onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)} className="space-y-4">
            <FormField
              control={magicLinkForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              <Mail className="mr-2 h-4 w-4" />
              {isLoading ? "Sending..." : "Send Magic Link"}
            </Button>
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  );
}
