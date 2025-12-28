"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, CheckCircle, XCircle } from "lucide-react";

// Mock data for quizzes
const quizzes = [
  {
    id: 1,
    title: "Introduction to Computer Science",
    description: "Basic concepts of computer science and programming",
    duration: 30, // minutes
    totalQuestions: 20,
    subject: "Computer Science",
    dueDate: "2024-03-25",
    status: "pending", // pending, completed, expired
  },
  {
    id: 2,
    title: "Data Structures and Algorithms",
    description: "Fundamental data structures and algorithms",
    duration: 45,
    totalQuestions: 25,
    subject: "Computer Science",
    dueDate: "2024-03-28",
    status: "completed",
  },
  {
    id: 3,
    title: "Database Management Systems",
    description: "SQL, normalization, and database design",
    duration: 60,
    totalQuestions: 30,
    subject: "Computer Science",
    dueDate: "2024-04-01",
    status: "pending",
  },
];

export default function QuizzesPage() {
  const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "expired":
        return <Badge className="bg-red-500">Expired</Badge>;
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  const startQuiz = (quizId: number) => {
    setSelectedQuiz(quizId);
    // Open quiz in a new tab
    window.open(`/student/quizzes/${quizId}`, '_blank');
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Quizzes</h1>
        <div className="flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Completed: {quizzes.filter(q => q.status === "completed").length}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <XCircle className="h-4 w-4 text-yellow-500" />
            Pending: {quizzes.filter(q => q.status === "pending").length}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{quiz.title}</CardTitle>
              <CardDescription>{quiz.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{quiz.subject}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{quiz.duration} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {quiz.totalQuestions} questions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Due: {new Date(quiz.dueDate).toLocaleDateString()}
                  </span>
                </div>
                {getStatusBadge(quiz.status)}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => startQuiz(quiz.id)}
                disabled={quiz.status === "completed" || quiz.status === "expired"}
              >
                {quiz.status === "completed" ? "View Results" : "Start Quiz"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 