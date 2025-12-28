import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await fetch('http://localhost:8000/api/quizzes/', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch quizzes');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/quizzes:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    // Transform frontend data to backend format
    const payload = {
      title: data.title,
      course: data.courseId, // Rename courseId to course
      description: data.description,
      time_limit: data.timeLimit, // Rename timeLimit to time_limit
      max_attempts: data.maximumAttempts, // Rename maximumAttempts to max_attempts
      shuffle_questions: data.shuffleQuestions, // Map shuffleQuestions
      is_published: data.status === 'active', // Map status to is_published boolean
      questions: data.questions.map((q: any) => ({
        question_text: q.text, // Rename text to question_text
        question_type: q.type, // Rename type to question_type
        marks: q.marks,
        choices: q.choices.map((c: string) => ({
          choice_text: c,
          is_correct: c === q.correctAnswer // Determine correctness based on correctAnswer match
        }))
      }))
    };

    const response = await fetch('http://localhost:8000/api/quizzes/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to create quiz');
    }

    const quiz = await response.json();
    return NextResponse.json(quiz);
  } catch (error) {
    console.error('Error in POST /api/quizzes:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 