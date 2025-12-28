'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateQuizForm } from '@/components/quiz/CreateQuizForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: {
    id: string;
  };
}

export default function EditQuizPage({ params }: PageProps) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<any>(null);
  const [courses, setCourses] = useState([
    { id: '1', title: 'Web Development' },
    { id: '2', title: 'Data Structures and Algorithms' },
    { id: '3', title: 'Machine Learning' },
  ]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/quizzes/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch quiz');
        }
        const data = await response.json();
        setQuiz(data);
      } catch (error) {
        console.error('Error fetching quiz:', error);
      }
    };

    fetchQuiz();
  }, [params.id]);

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/quizzes/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update quiz');
      }

      router.push('/faculty/quizzes');
    } catch (error) {
      console.error('Error updating quiz:', error);
    }
  };

  if (!quiz) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Quizzes
        </Button>
        <h1 className="text-3xl font-bold">Edit Quiz</h1>
      </div>

      <CreateQuizForm
        courses={courses}
        onSubmitAction={handleSubmit}
        initialData={quiz}
      />
    </div>
  );
} 