"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useParams, useRouter } from "next/navigation";

// Mock quiz data - In a real app, this would come from an API
const mockQuizData = {
  1: {
    title: "Introduction to Computer Science",
    questions: [
      {
        id: 1,
        question: "What is a variable?",
        options: [
          "A container for storing data values",
          "A mathematical equation",
          "A programming language",
          "A computer hardware component"
        ],
        correctAnswer: 0
      },
      // Add more questions as needed
    ]
  },
  // Add more quizzes as needed
};

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: number}>({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const quiz = mockQuizData[parseInt(quizId) as keyof typeof mockQuizData];

  useEffect(() => {
    if (!quiz) {
      router.push("/student/quizzes");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, router]);

  const handleAnswer = (optionIndex: number) => {
    setAnswers({ ...answers, [currentQuestion]: optionIndex });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    // Calculate score and submit
    const score = quiz.questions.reduce((acc, q, index) => {
      return acc + (answers[index] === q.correctAnswer ? 1 : 0);
    }, 0);

    // In a real app, you would submit this to an API
    console.log("Quiz submitted with score:", score);
    router.push("/student/quizzes");
  };

  if (!quiz) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{quiz.title}</h1>
        <div className="text-xl font-semibold">Time Left: {formatTime(timeLeft)}</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Question {currentQuestion + 1} of {quiz.questions.length}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <p className="text-lg">{quiz.questions[currentQuestion].question}</p>
            <RadioGroup
              value={answers[currentQuestion]?.toString()}
              onValueChange={(value) => handleAnswer(parseInt(value))}
            >
              {quiz.questions[currentQuestion].options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </Button>
        <Button
          onClick={currentQuestion === quiz.questions.length - 1 ? handleSubmit : handleNext}
          variant={currentQuestion === quiz.questions.length - 1 ? "destructive" : "default"}
        >
          {currentQuestion === quiz.questions.length - 1 ? "Submit" : "Next"}
        </Button>
      </div>
    </div>
  );
}
