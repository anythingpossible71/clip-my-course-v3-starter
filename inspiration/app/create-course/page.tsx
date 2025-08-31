"use client";

import type React from "react";

import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Youtube,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Link from "next/link";

interface Lesson {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  duration?: string;
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  title: string;
  description: string;
  sections: Section[];
}

interface LessonDropIndicator {
  sectionId: string;
  lessonId: string;
  position: "top" | "bottom";
}

interface SectionDropIndicator {
  sectionId: string;
  position: "top" | "bottom";
}

interface DeleteConfirmation {
  type: "section" | "lesson";
  sectionId: string;
  lessonId?: string;
  title: string;
}

export default function CreateCoursePage() {
  // Pre-fill with Greek course example
  const [course, setCourse] = useState<Course>({
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
            description:
              "Learn the first half of the Greek alphabet (Alpha to Mu) with proper pronunciation and writing techniques. This lesson covers letter shapes, sounds, and basic writing practice.",
            videoUrl: "https://www.youtube.com/watch?v=POo3NVkBzAo",
            duration: "15:42",
          },
          {
            id: "lesson-1-2",
            title: "Greek Alphabet - Nu to Omega",
            description:
              "Complete your Greek alphabet knowledge with the second half (Nu to Omega). Master the remaining letters with pronunciation tips and practice examples.",
            videoUrl: "https://www.youtube.com/watch?v=9cjoDrjb8kQ",
            duration: "12:18",
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
            description:
              "Learn how to greet people in Greek, introduce yourself, and handle basic social interactions. Perfect for first-time visitors to Greece.",
            videoUrl: "https://www.youtube.com/watch?v=7oMhOLzFAKo",
            duration: "18:35",
          },
          {
            id: "lesson-2-2",
            title: "Common Greek Phrases for Travelers",
            description:
              "Essential phrases for travelers including asking for directions, ordering food, shopping, and dealing with emergencies in Greek-speaking countries.",
            videoUrl: "https://www.youtube.com/watch?v=kEHKX_3NCCA",
            duration: "22:47",
          },
        ],
      },
    ],
  });

  // Lesson drag and drop state
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null);
  const [lessonDropIndicator, setLessonDropIndicator] = useState<LessonDropIndicator | null>(null);

  // Section drag and drop state
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [sectionDropIndicator, setSectionDropIndicator] = useState<SectionDropIndicator | null>(
    null
  );

  // Track collapsed sections
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);

  // Delete confirmation dialog state
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation | null>(null);

  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const isSectionCollapsed = (sectionId: string) => {
    return collapsedSections.includes(sectionId);
  };

  const addSection = () => {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      title: "",
      lessons: [],
    };
    setCourse((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

  const updateSection = (sectionId: string, title: string) => {
    setCourse((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, title } : section
      ),
    }));
  };

  const confirmDeleteSection = (sectionId: string) => {
    const section = course.sections.find((s) => s.id === sectionId);
    if (!section) return;

    setDeleteConfirmation({
      type: "section",
      sectionId,
      title: section.title || "Untitled Section",
    });
  };

  const deleteSection = (sectionId: string) => {
    setCourse((prev) => ({
      ...prev,
      sections: prev.sections.filter((section) => section.id !== sectionId),
    }));
    setDeleteConfirmation(null);
  };

  // Move section up one position
  const moveSectionUp = (sectionId: string) => {
    setCourse((prev) => {
      const sectionIndex = prev.sections.findIndex((section) => section.id === sectionId);

      // Can't move up if it's already at the top
      if (sectionIndex <= 0) return prev;

      const newSections = [...prev.sections];
      const temp = newSections[sectionIndex];
      newSections[sectionIndex] = newSections[sectionIndex - 1];
      newSections[sectionIndex - 1] = temp;

      return { ...prev, sections: newSections };
    });
  };

  // Move section down one position
  const moveSectionDown = (sectionId: string) => {
    setCourse((prev) => {
      const sectionIndex = prev.sections.findIndex((section) => section.id === sectionId);

      // Can't move down if it's already at the bottom
      if (sectionIndex === -1 || sectionIndex >= prev.sections.length - 1) return prev;

      const newSections = [...prev.sections];
      const temp = newSections[sectionIndex];
      newSections[sectionIndex] = newSections[sectionIndex + 1];
      newSections[sectionIndex + 1] = temp;

      return { ...prev, sections: newSections };
    });
  };

  const addLesson = (sectionId: string) => {
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: "",
      description: "",
      videoUrl: "",
    };
    setCourse((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? { ...section, lessons: [...section.lessons, newLesson] }
          : section
      ),
    }));
  };

  const updateLesson = (
    sectionId: string,
    lessonId: string,
    field: keyof Lesson,
    value: string
  ) => {
    setCourse((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              lessons: section.lessons.map((lesson) =>
                lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
              ),
            }
          : section
      ),
    }));
  };

  const confirmDeleteLesson = (sectionId: string, lessonId: string) => {
    const section = course.sections.find((s) => s.id === sectionId);
    if (!section) return;

    const lesson = section.lessons.find((l) => l.id === lessonId);
    if (!lesson) return;

    setDeleteConfirmation({
      type: "lesson",
      sectionId,
      lessonId,
      title: lesson.title || "Untitled Lesson",
    });
  };

  const deleteLesson = (sectionId: string, lessonId: string) => {
    setCourse((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? { ...section, lessons: section.lessons.filter((lesson) => lesson.id !== lessonId) }
          : section
      ),
    }));
    setDeleteConfirmation(null);
  };

  // Move lesson up one position
  const moveLessonUp = (sectionId: string, lessonId: string) => {
    setCourse((prev) => {
      const sectionIndex = prev.sections.findIndex((section) => section.id === sectionId);
      if (sectionIndex === -1) return prev;

      const section = prev.sections[sectionIndex];
      const lessonIndex = section.lessons.findIndex((lesson) => lesson.id === lessonId);

      // Can't move up if it's already at the top
      if (lessonIndex <= 0) return prev;

      const newLessons = [...section.lessons];
      const temp = newLessons[lessonIndex];
      newLessons[lessonIndex] = newLessons[lessonIndex - 1];
      newLessons[lessonIndex - 1] = temp;

      const newSections = [...prev.sections];
      newSections[sectionIndex] = { ...section, lessons: newLessons };

      return { ...prev, sections: newSections };
    });
  };

  // Move lesson down one position
  const moveLessonDown = (sectionId: string, lessonId: string) => {
    setCourse((prev) => {
      const sectionIndex = prev.sections.findIndex((section) => section.id === sectionId);
      if (sectionIndex === -1) return prev;

      const section = prev.sections[sectionIndex];
      const lessonIndex = section.lessons.findIndex((lesson) => lesson.id === lessonId);

      // Can't move down if it's already at the bottom
      if (lessonIndex === -1 || lessonIndex >= section.lessons.length - 1) return prev;

      const newLessons = [...section.lessons];
      const temp = newLessons[lessonIndex];
      newLessons[lessonIndex] = newLessons[lessonIndex + 1];
      newLessons[lessonIndex + 1] = temp;

      const newSections = [...prev.sections];
      newSections[sectionIndex] = { ...section, lessons: newLessons };

      return { ...prev, sections: newSections };
    });
  };

  const extractVideoId = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getTotalLessons = () => {
    return course.sections.reduce((total, section) => total + section.lessons.length, 0);
  };

  const handleSaveChanges = () => {
    // In a real app, this would save to backend
    console.log("Saving changes:", course);
    alert("Changes saved successfully!");
  };

  // Section drag and drop handlers
  const handleSectionDragStart = (e: React.DragEvent, sectionId: string) => {
    setDraggedSection(sectionId);
    e.dataTransfer.effectAllowed = "move";

    // Create a custom drag image
    const dragPreview = document.createElement("div");
    dragPreview.className = "bg-background border rounded p-2 shadow-lg";
    dragPreview.textContent = "Moving section...";
    dragPreview.style.position = "absolute";
    dragPreview.style.top = "-1000px";
    document.body.appendChild(dragPreview);
    e.dataTransfer.setDragImage(dragPreview, 50, 25);

    // Clean up the preview element after a short delay
    setTimeout(() => {
      document.body.removeChild(dragPreview);
    }, 0);
  };

  const handleSectionDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Don't show indicator if dragging over itself
    if (sectionId === draggedSection) {
      setSectionDropIndicator(null);
      return;
    }

    // Determine if we're in the top or bottom half of the element
    const rect = e.currentTarget.getBoundingClientRect();
    const position = e.clientY < rect.top + rect.height / 2 ? "top" : "bottom";

    // Update the drop indicator
    setSectionDropIndicator({
      sectionId,
      position,
    });

    e.dataTransfer.dropEffect = "move";
  };

  const handleSectionDragLeave = () => {
    setSectionDropIndicator(null);
  };

  const handleSectionDragEnd = () => {
    setDraggedSection(null);
    setSectionDropIndicator(null);
  };

  const handleSectionDrop = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Reset drop indicator
    setSectionDropIndicator(null);

    // Make sure we have valid drag data
    if (!draggedSection || !sectionDropIndicator) return;

    // Don't do anything if dropped on itself
    if (draggedSection === targetSectionId) return;

    // Find the source and target indices
    const sourceIndex = course.sections.findIndex((section) => section.id === draggedSection);
    const targetIndex = course.sections.findIndex((section) => section.id === targetSectionId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    // Create a new array with the reordered sections
    const newSections = [...course.sections];
    const [movedSection] = newSections.splice(sourceIndex, 1);

    // Insert at the correct position based on the drop indicator
    const insertIndex = sectionDropIndicator.position === "top" ? targetIndex : targetIndex + 1;

    // Adjust the insert index if we're moving from above to below
    const adjustedInsertIndex =
      sourceIndex < targetIndex && sectionDropIndicator.position === "bottom"
        ? insertIndex - 1
        : insertIndex;

    newSections.splice(adjustedInsertIndex, 0, movedSection);

    // Update the course state with the new order
    setCourse((prevCourse) => ({
      ...prevCourse,
      sections: newSections,
    }));
  };

  // Lesson drag and drop handlers
  const handleLessonDragStart = (e: React.DragEvent, sectionId: string, lessonId: string) => {
    // Store the dragged lesson and section IDs
    setDraggedSectionId(sectionId);
    setDraggedLessonId(lessonId);

    // Set the drag effect
    e.dataTransfer.effectAllowed = "move";

    // Create a custom drag image (optional)
    const dragPreview = document.createElement("div");
    dragPreview.className = "bg-background border rounded p-2 shadow-lg";
    dragPreview.textContent = "Moving lesson...";
    dragPreview.style.position = "absolute";
    dragPreview.style.top = "-1000px";
    document.body.appendChild(dragPreview);
    e.dataTransfer.setDragImage(dragPreview, 50, 25);

    // Clean up the preview element after a short delay
    setTimeout(() => {
      document.body.removeChild(dragPreview);
    }, 0);
  };

  const handleLessonDragOver = (e: React.DragEvent, sectionId: string, lessonId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Don't show indicator if dragging over itself
    if (lessonId === draggedLessonId) {
      setLessonDropIndicator(null);
      return;
    }

    // Determine if we're in the top or bottom half of the element
    const rect = e.currentTarget.getBoundingClientRect();
    const position = e.clientY < rect.top + rect.height / 2 ? "top" : "bottom";

    // Update the drop indicator
    setLessonDropIndicator({
      sectionId,
      lessonId,
      position,
    });

    // Set the drop effect
    e.dataTransfer.dropEffect = "move";
  };

  const handleLessonDragLeave = () => {
    setLessonDropIndicator(null);
  };

  const handleLessonDragEnd = () => {
    // Reset all drag state
    setDraggedSectionId(null);
    setDraggedLessonId(null);
    setLessonDropIndicator(null);
  };

  const handleLessonDrop = (
    e: React.DragEvent,
    targetSectionId: string,
    targetLessonId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();

    // Reset drop indicator
    setLessonDropIndicator(null);

    // Make sure we have valid drag data
    if (!draggedSectionId || !draggedLessonId || !lessonDropIndicator) return;

    // Only handle drops within the same section for now
    if (draggedSectionId !== targetSectionId) return;

    // Don't do anything if dropped on itself
    if (draggedLessonId === targetLessonId) return;

    // Find the section
    const sectionIndex = course.sections.findIndex((section) => section.id === targetSectionId);
    if (sectionIndex === -1) return;

    const section = course.sections[sectionIndex];

    // Find the source and target indices
    const sourceIndex = section.lessons.findIndex((lesson) => lesson.id === draggedLessonId);
    const targetIndex = section.lessons.findIndex((lesson) => lesson.id === targetLessonId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    // Create a new array with the reordered lessons
    const newLessons = [...section.lessons];
    const [movedLesson] = newLessons.splice(sourceIndex, 1);

    // Insert at the correct position based on the drop indicator
    const insertIndex = lessonDropIndicator.position === "top" ? targetIndex : targetIndex + 1;

    // Adjust the insert index if we're moving from above to below
    const adjustedInsertIndex =
      sourceIndex < targetIndex && lessonDropIndicator.position === "bottom"
        ? insertIndex - 1
        : insertIndex;

    newLessons.splice(adjustedInsertIndex, 0, movedLesson);

    // Update the course state with the new order
    setCourse((prevCourse) => {
      const newSections = [...prevCourse.sections];
      newSections[sectionIndex] = {
        ...section,
        lessons: newLessons,
      };
      return {
        ...prevCourse,
        sections: newSections,
      };
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Create New Course</h1>
                <p className="text-sm text-muted-foreground">
                  {getTotalLessons()} lessons across {course.sections.length} sections
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveChanges}>Save Changes</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Course Basic Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>Basic information about your course</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="course-title">Course Title</Label>
              <Input
                id="course-title"
                placeholder="Enter course title..."
                value={course.title}
                onChange={(e) => setCourse((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="course-description">Course Description</Label>
              <Textarea
                id="course-description"
                placeholder="Describe what students will learn in this course..."
                value={course.description}
                onChange={(e) => setCourse((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Course Structure */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Course Structure</CardTitle>
                <CardDescription>Organize your course into sections and lessons</CardDescription>
              </div>
              <Button onClick={addSection} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Section
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {course.sections.map((section, sectionIndex) => (
                <div
                  key={section.id}
                  className={`relative border rounded-lg ${
                    draggedSection === section.id ? "opacity-50" : ""
                  } transition-all duration-200`}
                  draggable={true}
                  onDragStart={(e) => handleSectionDragStart(e, section.id)}
                  onDragOver={(e) => handleSectionDragOver(e, section.id)}
                  onDragLeave={handleSectionDragLeave}
                  onDragEnd={handleSectionDragEnd}
                  onDrop={(e) => handleSectionDrop(e, section.id)}
                >
                  {/* Section drop indicator - top */}
                  {sectionDropIndicator?.sectionId === section.id &&
                    sectionDropIndicator?.position === "top" && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-primary transform -translate-y-1/2 rounded-full z-10" />
                    )}

                  {/* Section drop indicator - bottom */}
                  {sectionDropIndicator?.sectionId === section.id &&
                    sectionDropIndicator?.position === "bottom" && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary transform translate-y-1/2 rounded-full z-10" />
                    )}

                  <Collapsible
                    open={!isSectionCollapsed(section.id)}
                    onOpenChange={() => toggleSectionCollapse(section.id)}
                  >
                    <div className="flex items-center gap-3 p-4">
                      <div className="flex flex-col items-center space-y-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveSectionUp(section.id);
                          }}
                          disabled={sectionIndex === 0}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveSectionDown(section.id);
                          }}
                          disabled={sectionIndex === course.sections.length - 1}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>

                      <Input
                        placeholder="Section title..."
                        value={section.title}
                        onChange={(e) => updateSection(section.id, e.target.value)}
                        className="flex-1"
                        onClick={(e) => e.stopPropagation()}
                      />

                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${isSectionCollapsed(section.id) ? "rotate-180" : ""}`}
                          />
                        </Button>
                      </CollapsibleTrigger>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDeleteSection(section.id);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <CollapsibleContent>
                      <div className="border-t">
                        {/* Lessons */}
                        <div className="ml-8 space-y-3 p-4">
                          {section.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className={`relative flex items-start gap-3 p-3 rounded-lg bg-muted/30 ${
                                draggedLessonId === lesson.id ? "opacity-50" : ""
                              } transition-all duration-200`}
                              draggable={true}
                              onDragStart={(e) => handleLessonDragStart(e, section.id, lesson.id)}
                              onDragOver={(e) => handleLessonDragOver(e, section.id, lesson.id)}
                              onDragLeave={handleLessonDragLeave}
                              onDragEnd={handleLessonDragEnd}
                              onDrop={(e) => handleLessonDrop(e, section.id, lesson.id)}
                            >
                              {/* Lesson drop indicator - top */}
                              {lessonDropIndicator?.lessonId === lesson.id &&
                                lessonDropIndicator?.position === "top" && (
                                  <div className="absolute top-0 left-0 right-0 h-1 bg-primary transform -translate-y-1/2 rounded-full" />
                                )}

                              {/* Lesson drop indicator - bottom */}
                              {lessonDropIndicator?.lessonId === lesson.id &&
                                lessonDropIndicator?.position === "bottom" && (
                                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary transform translate-y-1/2 rounded-full" />
                                )}

                              <div className="mt-2 cursor-move">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>

                              <div className="flex flex-col items-center mt-2 space-y-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => moveLessonUp(section.id, lesson.id)}
                                  disabled={lessonIndex === 0}
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </Button>
                                <Badge variant="secondary" className="text-xs">
                                  {lessonIndex + 1}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => moveLessonDown(section.id, lesson.id)}
                                  disabled={lessonIndex === section.lessons.length - 1}
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="flex-1 space-y-2">
                                <Input
                                  placeholder="Lesson title..."
                                  value={lesson.title}
                                  onChange={(e) =>
                                    updateLesson(section.id, lesson.id, "title", e.target.value)
                                  }
                                />

                                {/* Lesson Description */}
                                <Textarea
                                  placeholder="Lesson description (optional)..."
                                  value={lesson.description || ""}
                                  onChange={(e) =>
                                    updateLesson(
                                      section.id,
                                      lesson.id,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  rows={2}
                                  className="text-sm"
                                />

                                <div className="flex gap-2">
                                  <div className="flex-1 relative">
                                    <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                      placeholder="YouTube URL..."
                                      value={lesson.videoUrl}
                                      onChange={(e) =>
                                        updateLesson(
                                          section.id,
                                          lesson.id,
                                          "videoUrl",
                                          e.target.value
                                        )
                                      }
                                      className="pl-10"
                                    />
                                  </div>
                                  <Input
                                    placeholder="Duration (e.g., 12:30)"
                                    value={lesson.duration || ""}
                                    onChange={(e) =>
                                      updateLesson(
                                        section.id,
                                        lesson.id,
                                        "duration",
                                        e.target.value
                                      )
                                    }
                                    className="w-32"
                                  />
                                </div>
                                {lesson.videoUrl && extractVideoId(lesson.videoUrl) && (
                                  <div className="text-xs text-green-600 flex items-center gap-1">
                                    <Youtube className="h-3 w-3" />
                                    Valid YouTube URL detected
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => confirmDeleteLesson(section.id, lesson.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addLesson(section.id)}
                            className="gap-2 ml-7"
                          >
                            <Plus className="h-4 w-4" />
                            Add Lesson
                          </Button>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Course Preview */}
        {course.title && (
          <Card>
            <CardHeader>
              <CardTitle>Course Preview</CardTitle>
              <CardDescription>How your course will appear to students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                {course.description && (
                  <p className="text-muted-foreground mb-4">{course.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{course.sections.length} sections</span>
                  <span>{getTotalLessons()} lessons</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete {deleteConfirmation?.type === "section" ? "Section" : "Lesson"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                {deleteConfirmation?.type === "section" ? "this section" : "this lesson"}
                {deleteConfirmation?.title ? ` "${deleteConfirmation.title}"` : ""}?
                {deleteConfirmation?.type === "section" &&
                  ` This will also delete all lessons within this section.`}{" "}
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (deleteConfirmation?.type === "section") {
                    deleteSection(deleteConfirmation.sectionId);
                  } else if (deleteConfirmation?.type === "lesson" && deleteConfirmation.lessonId) {
                    deleteLesson(deleteConfirmation.sectionId, deleteConfirmation.lessonId);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
