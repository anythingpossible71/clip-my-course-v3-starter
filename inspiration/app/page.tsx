"use client";

import { useState } from "react";
import { Plus, Play, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Mock data for courses
const mockCourses = [
  {
    id: "1",
    title: "Complete React Development",
    description: "Learn React from basics to advanced concepts with hands-on projects",
    thumbnail: "/placeholder.svg?height=200&width=300&text=React+Course",
    totalLessons: 24,
    completedLessons: 8,
    totalDuration: "12h 30m",
    sections: 6,
  },
  {
    id: "2",
    title: "JavaScript Fundamentals",
    description: "Master JavaScript fundamentals and modern ES6+ features",
    thumbnail: "/placeholder.svg?height=200&width=300&text=JavaScript+Course",
    totalLessons: 18,
    completedLessons: 18,
    totalDuration: "8h 45m",
    sections: 4,
  },
  {
    id: "3",
    title: "Node.js Backend Development",
    description: "Build scalable backend applications with Node.js and Express",
    thumbnail: "/placeholder.svg?height=200&width=300&text=Node.js+Course",
    totalLessons: 32,
    completedLessons: 5,
    totalDuration: "16h 20m",
    sections: 8,
  },
];

export default function HomePage() {
  const [courses] = useState(mockCourses);

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/cmc-nav-logo.svg" alt="Course Creator" className="h-8 w-auto" />
            </div>
            <Link href="/create-course">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Course
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content with top padding to account for fixed header */}
      <main className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">My Courses</h2>
          <p className="text-muted-foreground">
            {courses.length} course{courses.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const progressPercentage = getProgressPercentage(
              course.completedLessons,
              course.totalLessons
            );
            const isCompleted = progressPercentage === 100;

            return (
              <Link key={course.id} href={`/course/${course.id}`}>
                <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer h-full">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={course.thumbnail || "/placeholder.svg"}
                      alt={course.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-200" />
                    <div className="absolute top-4 right-4">
                      {isCompleted ? (
                        <Badge variant="secondary" className="bg-green-500 text-white">
                          Completed
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-blue-500 text-white">
                          {progressPercentage}% Complete
                        </Badge>
                      )}
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <div className="flex items-center gap-2 text-white text-sm">
                        <Play className="h-4 w-4" />
                        <span>{course.totalLessons} lessons</span>
                      </div>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-muted-foreground mb-1">
                        <span>
                          {course.completedLessons}/{course.totalLessons} lessons
                        </span>
                        <span>{progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            isCompleted ? "bg-green-500" : "bg-primary"
                          }`}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Course Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.totalDuration}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Empty State */}
        {courses.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Play className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first course to get started organizing YouTube videos
            </p>
            <Link href="/create-course">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Course
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
