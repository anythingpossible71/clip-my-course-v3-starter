"use client";

import { CookieIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CookieConsentProps {
  variant?: "default" | "small" | "minimal";
  mode?: boolean;
  onAcceptCallback?: () => void;
  onDeclineCallback?: () => void;
}

export function CookieConsent({
  variant = "default",
  mode = false,
  onAcceptCallback,
  onDeclineCallback,
}: CookieConsentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hide, setHide] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const updateConsent = async (consented: boolean) => {
    try {
      const response = await fetch('/api/auth/cookie-consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ consented }),
      });

      if (!response.ok) {
        console.error('Failed to update cookie consent');
      }
    } catch (error) {
      console.error('Error updating cookie consent:', error);
    }
  };

  const checkConsent = async () => {
    try {
      const response = await fetch('/api/auth/cookie-consent');
      if (response.ok) {
        const data = await response.json();
        if (data.consented) {
          setIsOpen(false);
          setTimeout(() => {
            setHide(true);
          }, 700);
        } else {
          setIsOpen(true);
        }
      } else {
        // Fallback to cookie check if API fails
        if (document.cookie.includes("cookieConsent=true")) {
          setIsOpen(false);
          setTimeout(() => {
            setHide(true);
          }, 700);
        } else {
          setIsOpen(true);
        }
      }
    } catch (error) {
      console.error('Error checking cookie consent:', error);
      // Fallback to cookie check
      if (document.cookie.includes("cookieConsent=true")) {
        setIsOpen(false);
        setTimeout(() => {
          setHide(true);
        }, 700);
      } else {
        setIsOpen(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const accept = async () => {
    setIsOpen(false);
    await updateConsent(true);
    setTimeout(() => {
      setHide(true);
    }, 700);
    if (onAcceptCallback) {
      onAcceptCallback();
    }
  };

  const decline = async () => {
    setIsOpen(false);
    await updateConsent(false);
    setTimeout(() => {
      setHide(true);
    }, 700);
    if (onDeclineCallback) {
      onDeclineCallback();
    }
  };

  useEffect(() => {
    setMounted(true);
    checkConsent();
  }, []);

  // Don't render anything while loading or not mounted
  if (loading || !mounted) {
    return null;
  }

  return variant === "default" ? (
    <div
      className={cn(
        "fixed z-200 bottom-0 left-0 right-0 p-4 sm:p-0 sm:left-4 sm:bottom-4 w-full sm:max-w-md duration-700",
        !isOpen
          ? "transition-[opacity,transform] translate-y-8 opacity-0"
          : "transition-[opacity,transform] translate-y-0 opacity-100",
        hide && "hidden"
      )}
    >
      <div className="dark:bg-card bg-background rounded-lg sm:rounded-md border border-border shadow-lg">
        <div className="grid gap-2">
          <div className="border-b border-border h-12 sm:h-14 flex items-center justify-between p-3 sm:p-4">
            <h1 className="text-base sm:text-lg font-medium">We use cookies</h1>
            <CookieIcon className="h-4 w-4 sm:h-[1.2rem] sm:w-[1.2rem]" />
          </div>
          <div className="p-3 sm:p-4">
            <p className="text-xs sm:text-sm font-normal text-start text-muted-foreground">
              We use cookies to ensure you get the best experience on our
              website. For more information on how we use cookies, please see
              our cookie policy.
              <br />
              <br />
              <span className="text-xs">
                By clicking{" "}
                <span className="font-medium text-black dark:text-white">Accept</span>, you
                agree to our use of cookies.
              </span>
              <br />
              <a href="#" className="text-xs underline">
                Learn more.
              </a>
            </p>
          </div>
          <div className="grid grid-cols-2 items-center gap-2 p-3 sm:p-4 sm:py-5 border-t border-border dark:bg-background/20">
            <Button onClick={accept} variant="default" className="w-full">
              Accept
            </Button>
            <Button onClick={decline} variant="outline" className="w-full">
              Decline
            </Button>
          </div>
        </div>
      </div>
    </div>
  ) : variant === "small" ? (
    <div
      className={cn(
        "fixed z-200 bottom-0 left-0 right-0 p-4   sm:p-0 sm:left-4 sm:bottom-4 w-full sm:max-w-md duration-700",
        !isOpen
          ? "transition-[opacity,transform] translate-y-8 opacity-0"
          : "transition-[opacity,transform] translate-y-0 opacity-100",
        hide && "hidden"
      )}
    >
      <div className="m-0 sm:m-3 dark:bg-card bg-background border border-border rounded-lg shadow-lg">
        <div className="flex items-center justify-between p-3">
          <h1 className="text-base sm:text-lg font-medium">We use cookies</h1>
          <CookieIcon className="h-4 w-4 sm:h-[1.2rem] sm:w-[1.2rem]" />
        </div>
        <div className="p-3 -mt-2">
          <p className="text-xs sm:text-sm text-left text-muted-foreground">
            We use cookies to ensure you get the best experience on our website.
            For more information on how we use cookies, please see our cookie
            policy.
          </p>
        </div>
        <div className="grid grid-cols-2 items-center gap-2 p-3 mt-2 border-t">
          <Button onClick={accept} className="w-full">
            Accept
          </Button>
          <Button
            onClick={decline}
            className="w-full"
            variant="outline"
          >
            Decline
          </Button>
        </div>
      </div>
    </div>
  ) : (
    variant === "minimal" && (
      <div
        className={cn(
          "fixed z-200 bottom-0 left-0 right-0 p-4 sm:p-0 sm:left-4 sm:bottom-4 w-full sm:max-w-[300px] duration-700",
          !isOpen
            ? "transition-[opacity,transform] translate-y-8 opacity-0"
            : "transition-[opacity,transform] translate-y-0 opacity-100",
          hide && "hidden"
        )}
      >
        <div className="m-0 sm:m-3 dark:bg-card bg-background border border-border rounded-lg shadow-lg">
          <div className="p-3 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-2">
              <CookieIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm font-medium">Cookie Notice</span>
            </div>
          </div>
          <div className="p-3">
            <p className="text-[11px] sm:text-xs text-muted-foreground">
              We use cookies to enhance your browsing experience.
            </p>
            <div className="grid grid-cols-2 items-center gap-2 mt-3">
              <Button
                onClick={accept}
                variant="default"
                className="w-full"
              >
                Accept
              </Button>
              <Button
                onClick={decline}
                variant="ghost"
                className="w-full"
              >
                Decline
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
