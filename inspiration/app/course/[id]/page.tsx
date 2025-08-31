"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Play,
  Check,
  ArrowLeft,
  MoreVertical,
  Edit,
  Share,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Mock course data
const mockCourseData = {
  id: "1",
  title: "Learn Greek - Complete Beginner Course",
  description:
    "Master the Greek language from basics to conversational level with structured lessons covering alphabet, vocabulary, grammar, and everyday conversations",
  sections: [
    {
      id: "section-1",
      title: "Greek Alphabet & Basic Pronunciation",
      lessons: [
        {
          id: "lesson-1-1",
          title: "Greek Alphabet - Alpha to Mu",
          duration: "15:42",
          videoUrl: "https://www.youtube.com/embed/17z4TXy0bJw",
          completed: true,
        },
        {
          id: "lesson-1-2",
          title: "Greek Alphabet - Nu to Omega",
          duration: "12:18",
          videoUrl: "https://www.youtube.com/embed/9cjoDrjb8kQ",
          completed: false,
        },
      ],
    },
    {
      id: "section-2",
      title: "Essential Greek Phrases & Greetings",
      lessons: [
        {
          id: "lesson-2-1",
          title: "Basic Greek Greetings and Introductions",
          duration: "18:35",
          videoUrl: "https://www.youtube.com/embed/7oMhOLzFAKo",
          completed: false,
        },
        {
          id: "lesson-2-2",
          title: "Common Greek Phrases for Travelers",
          duration: "22:47",
          videoUrl: "https://www.youtube.com/embed/kEHKX_3NCCA",
          completed: false,
        },
      ],
    },
  ],
};

export default function CoursePage({ params }: { params: { id: string } }) {
  const [course] = useState(mockCourseData);
  const [currentLesson, setCurrentLesson] = useState(course.sections[0].lessons[0]);
  const [openSections, setOpenSections] = useState<string[]>([]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const isMyCourse = true;

  // Find current section and set it as open by default
  useEffect(() => {
    // Set all sections as open by default
    setOpenSections(course.sections.map((section) => section.id));
  }, [course.sections]);

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const toggleLessonCompletion = (lessonId: string) => {
    // Find and toggle the lesson completion status
    const updatedSections = course.sections.map((section) => ({
      ...section,
      lessons: section.lessons.map((lesson) =>
        lesson.id === lessonId ? { ...lesson, completed: !lesson.completed } : lesson
      ),
    }));

    // In a real app, this would update the backend and then update local state
    console.log(`Toggling completion for lesson: ${lessonId}`);

    // For demo purposes, we'll just log the change
    // In a real implementation, you'd update the course state here
  };

  const getTotalLessons = () => {
    return course.sections.reduce((total, section) => total + section.lessons.length, 0);
  };

  const getCompletedLessons = () => {
    return course.sections.reduce(
      (total, section) => total + section.lessons.filter((lesson) => lesson.completed).length,
      0
    );
  };

  const getCurrentSectionTitle = () => {
    const currentSection = course.sections.find((section) =>
      section.lessons.some((lesson) => lesson.id === currentLesson.id)
    );
    return currentSection?.title || "";
  };

  const handleShareCourse = () => {
    setShareDialogOpen(true);
  };

  const handleEditCourse = () => {
    // Navigate to edit course page
    window.location.href = `/create-course?edit=${course.id}`;
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/course/${course.id}`;
    navigator.clipboard.writeText(shareUrl);
    // In a real app, you might show a toast notification here
    alert("Course link copied to clipboard!");
  };

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/course/${course.id}` : "";

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:block border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Courses
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Desktop: Two Panel Layout */}
      <div className="hidden lg:flex h-[calc(100vh-73px)]">
        {/* Left Panel - Video Content */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 flex-1">
            {/* Current Section & Lesson Info */}
            <div className="mb-4">
              <div className="text-sm text-muted-foreground mb-1">{getCurrentSectionTitle()}</div>
              <h2 className="text-2xl font-bold mb-2">{currentLesson.title}</h2>
              <div className="flex items-center gap-4">
                <Badge variant="outline">{currentLesson.duration}</Badge>
                <Button
                  variant={currentLesson.completed ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleLessonCompletion(currentLesson.id)}
                  className="gap-2"
                >
                  <Check className="h-4 w-4" />
                  {currentLesson.completed ? "Completed" : "Mark Complete"}
                </Button>
              </div>
            </div>

            {/* Video Player */}
            <Card className="mb-6">
              <CardContent className="p-0">
                <div className="aspect-video">
                  <iframe
                    src={currentLesson.videoUrl}
                    title={currentLesson.title}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Lesson Navigation */}
            <div className="flex justify-between items-center">
              <Button variant="outline" disabled>
                Previous Lesson
              </Button>
              <Button>Next Lesson</Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Course Menu */}
        <div className="w-1/3 max-w-[400px] border-l bg-muted/30 flex flex-col">
          <div className="p-4 border-b bg-background">
            <div className="flex items-center justify-between mb-2">
              <h1 className="font-semibold text-lg">{course.title}</h1>
              {/* Course Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isMyCourse && (
                    <DropdownMenuItem onClick={handleEditCourse}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Course
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleShareCourse}>
                    <Share className="h-4 w-4 mr-2" />
                    Share Course
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                {getCompletedLessons()}/{getTotalLessons()} lessons
              </span>
              <Badge variant="secondary">
                {Math.round((getCompletedLessons() / getTotalLessons()) * 100)}% Complete
              </Badge>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {course.sections.map((section) => {
              const sectionCompleted = section.lessons.every((lesson) => lesson.completed);
              const sectionProgress = section.lessons.filter((lesson) => lesson.completed).length;
              const isOpen = openSections.includes(section.id);

              return (
                <Collapsible
                  key={section.id}
                  open={isOpen}
                  onOpenChange={() => toggleSection(section.id)}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <div className="text-left">
                        <div className="font-medium">{section.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {sectionProgress}/{section.lessons.length} lessons
                        </div>
                      </div>
                    </div>
                    {sectionCompleted && <Check className="h-4 w-4 text-green-500" />}
                  </CollapsibleTrigger>

                  <CollapsibleContent className="ml-4 mt-2 space-y-1">
                    {section.lessons.map((lesson) => {
                      const isCurrentLesson = lesson.id === currentLesson.id;

                      return (
                        <div
                          key={lesson.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                            isCurrentLesson
                              ? "bg-primary/10 border border-primary/20"
                              : "hover:bg-muted/50"
                          )}
                          onClick={() => {
                            setCurrentLesson(lesson);
                          }}
                        >
                          <div className="flex-shrink-0">
                            {lesson.completed ? (
                              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            ) : (
                              <div
                                className={cn(
                                  "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                                  isCurrentLesson
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-muted-foreground"
                                )}
                              >
                                <Play className="h-3 w-3" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div
                              className={cn(
                                "font-medium text-sm",
                                isCurrentLesson && "text-primary"
                              )}
                            >
                              {lesson.title}
                            </div>
                            <div className="text-xs text-muted-foreground">{lesson.duration}</div>
                          </div>
                        </div>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile: Stacked Layout */}
      <div className="lg:hidden pt-20">
        {/* Video Section */}
        <div className="p-4">
          {/* Current Section & Lesson Info */}
          <div className="mb-4">
            <div className="text-sm text-muted-foreground mb-1">{getCurrentSectionTitle()}</div>
            <h2 className="text-2xl font-bold mb-2">{currentLesson.title}</h2>
            <div className="flex items-center gap-4">
              <Badge variant="outline">{currentLesson.duration}</Badge>
              <Button
                variant={currentLesson.completed ? "default" : "outline"}
                size="sm"
                onClick={() => toggleLessonCompletion(currentLesson.id)}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                {currentLesson.completed ? "Completed" : "Mark Complete"}
              </Button>
            </div>
          </div>

          {/* Video Player */}
          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="aspect-video">
                <iframe
                  src={currentLesson.videoUrl}
                  title={currentLesson.title}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lesson Navigation */}
          <div className="flex justify-between items-center mb-6">
            <Button variant="outline" disabled>
              Previous Lesson
            </Button>
            <Button>Next Lesson</Button>
          </div>
        </div>

        {/* Course Menu Section */}
        <div className="border-t bg-muted/30">
          <div className="p-4 border-b bg-background">
            <div className="flex items-center justify-between mb-2">
              <h1 className="font-semibold text-lg">{course.title}</h1>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                {getCompletedLessons()}/{getTotalLessons()} lessons
              </span>
              <Badge variant="secondary">
                {Math.round((getCompletedLessons() / getTotalLessons()) * 100)}% Complete
              </Badge>
            </div>
          </div>

          <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
            {course.sections.map((section) => {
              const sectionCompleted = section.lessons.every((lesson) => lesson.completed);
              const sectionProgress = section.lessons.filter((lesson) => lesson.completed).length;
              const isOpen = openSections.includes(section.id);

              return (
                <Collapsible
                  key={section.id}
                  open={isOpen}
                  onOpenChange={() => toggleSection(section.id)}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {isOpen ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                      <div className="text-left">
                        <div className="font-medium text-base">{section.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {sectionProgress}/{section.lessons.length} lessons
                        </div>
                      </div>
                    </div>
                    {sectionCompleted && <Check className="h-5 w-5 text-green-500" />}
                  </CollapsibleTrigger>

                  <CollapsibleContent className="ml-4 mt-2 space-y-1">
                    {section.lessons.map((lesson) => {
                      const isCurrentLesson = lesson.id === currentLesson.id;

                      return (
                        <div
                          key={lesson.id}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors",
                            isCurrentLesson
                              ? "bg-primary/10 border border-primary/20"
                              : "hover:bg-muted/50"
                          )}
                          onClick={() => {
                            setCurrentLesson(lesson);
                            // Scroll to top on mobile to show the video
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        >
                          <div className="flex-shrink-0">
                            {lesson.completed ? (
                              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            ) : (
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-full border-2 flex items-center justify-center",
                                  isCurrentLesson
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-muted-foreground"
                                )}
                              >
                                <Play className="h-4 w-4" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div
                              className={cn(
                                "font-medium text-base",
                                isCurrentLesson && "text-primary"
                              )}
                            >
                              {lesson.title}
                            </div>
                            <div className="text-sm text-muted-foreground">{lesson.duration}</div>
                          </div>
                        </div>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Course</DialogTitle>
            <DialogDescription>
              Share this course with others using the link below
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <Input value={shareUrl} readOnly className="flex-1" />
            <Button onClick={copyShareLink} size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
