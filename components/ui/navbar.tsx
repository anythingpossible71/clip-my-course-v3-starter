"use client";

import { useState, useEffect, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import Link from "next/link";
import { Share, Bookmark, BookmarkCheck } from "lucide-react";
import { usePathname } from "next/navigation";

interface NavbarProps {
  actionButton?: ReactNode;
  className?: string;
  showSaveButton?: boolean;
  onSaveCourse?: () => void;
  isCourseSaved?: boolean;
}

export function Navbar({ 
  actionButton,
  className = "",
  showSaveButton = false,
  onSaveCourse,
  isCourseSaved = false
}: NavbarProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // Check if we're in edit/create mode (create-course page)
  const isEditMode = pathname?.startsWith('/create-course');
  
  // Check if we're on a course view page (course/[id])
  const isCourseViewPage = pathname?.startsWith('/course/');
  
  // Check if we're on a shared page
  const isSharedPage = pathname?.startsWith('/shared');

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const user = await response.json();
          setCurrentUser(user);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();

    // Refetch user data when page becomes visible or window gains focus (e.g., after sign-in)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setIsLoading(true);
        fetchCurrentUser();
      }
    };

    const handleFocus = () => {
      setIsLoading(true);
      fetchCurrentUser();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <header className={`border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 ${className}`}>
      <div className="flex items-center justify-between px-5 py-4 w-full">
        {/* Left Area - Always Logo */}
        <div className="flex items-center">
          <Link href={isSharedPage ? "/" : "/courses"}>
            <img src="/applogo.png" alt="ClipMyCourse" className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity" />
          </Link>
        </div>

        {/* Right Area - Action Button + Avatar */}
        <div className="flex items-center gap-4">
          {actionButton}
          {!isLoading && currentUser ? (
            <>
              {/* Show save button for shared courses */}
              {showSaveButton && onSaveCourse && (
                <Button
                  size="sm"
                  variant={isCourseSaved ? "outline" : "default"}
                  className={`flex items-center gap-2 ${
                    isCourseSaved 
                      ? "border-green-500 text-green-600 hover:bg-green-50" 
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                  onClick={onSaveCourse}
                >
                  {isCourseSaved ? (
                    <BookmarkCheck className="h-4 w-4" />
                  ) : (
                    <Bookmark className="h-4 w-4" />
                  )}
                  {isCourseSaved ? "In My Courses" : "Save Course"}
                </Button>
              )}
              
              {/* Only show share button when on course view page and NOT in edit mode */}
              {isCourseViewPage && !isEditMode && (
                <Button
                  size="sm"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    // This will be handled by the course page
                    window.dispatchEvent(new CustomEvent('share-course'));
                  }}
                >
                  <Share className="h-4 w-4" />
                  Share Course
                </Button>
              )}
              <UserAvatar user={currentUser} size="sm" />
            </>
          ) : !isLoading ? (
            /* Show sign-in button when user is not authenticated */
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => {
                const currentUrl = encodeURIComponent(window.location.href);
                window.location.href = `/auth/signin?redirect=${currentUrl}`;
              }}
            >
              Sign In
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
} 