"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import { ScrollButton } from "@/components/ui/scroll-button";
import { QuizCard } from "@/components/quiz/QuizCard";

const quizSchema = z.object({
  title: z.string().min(1, "Title is required"),
  courseId: z.string().min(1, "Select a course"),
  description: z.string().optional(),
  timeLimit: z.coerce.number().min(0, "Must be ≥ 0"),
  maximumAttempts: z.coerce.number().min(0, "Must be ≥ 0"),
  status: z.string().min(1, "Select a status"),
  shuffleQuestions: z.boolean().default(false), // 👈 added shuffleQuestions
  questions: z
    .array(
      z.object({
        text: z.string().min(1, "Question text required"),
        type: z.string().min(1, "Select type"),
        marks: z.coerce.number().min(0, "Marks must be ≥ 0"),
      })
    )
    .min(1, "Add at least one question"),
});

type QuizFormValues = z.infer<typeof quizSchema>;

export default function QuizzesPage() {
  const router = useRouter();

  const [quizzes, setQuizzes] = useState([
    {
      id: "1",
      title: "JavaScript Basics",
      description: "Fundamental JS concepts",
      status: "active",
      timeLimit: 30,
      date: "2024-03-20",
      participants: 45,
      questions: [{ text: "Sample Question", type: "mcq", marks: 1 }],
    },
    {
      id: "2",
      title: "React Hooks",
      description: "Assessment on React Hooks",
      status: "draft",
      timeLimit: 45,
      date: "2024-03-21",
      participants: 38,
      questions: [{ text: "Sample Question", type: "mcq", marks: 1 }],
    },
    {
      id: "3",
      title: "Data Structures",
      description: "Graphs & Trees",
      status: "scheduled",
      timeLimit: 60,
      date: "2024-03-22",
      participants: 42,
      questions: [{ text: "Sample Question", type: "mcq", marks: 1 }],
    },
  ]);

  const courses = [
    { id: "1", title: "Web Development" },
    { id: "2", title: "Data Structures & Algorithms" },
    { id: "3", title: "Machine Learning" },
  ];

  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema) as any,
    defaultValues: {
      title: "",
      courseId: "",
      description: "",
      timeLimit: 30,
      maximumAttempts: 1,
      status: "draft",
      shuffleQuestions: false, // 👈 default value
      questions: [{ text: "", type: "", marks: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const onSubmit = async (data: QuizFormValues) => {
    const res = await fetch("/api/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      const created = await res.json();
      setQuizzes((q) => [
        ...q,
        {
          ...created,
          id: Math.random().toString(36).substring(2, 9), // 👈 generate random id locally if needed
          date: new Date().toISOString().slice(0, 10), // 👈 today's date
          participants: 0,
          questions: created.questions.length,
        },
      ]);
      setIsDialogOpen(false);
      reset();
    } else {
      console.error("Failed to create quiz");
    }
  };

  const filtered = quizzes.filter((q) =>
    q.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quizzes</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create Quiz
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create New Quiz</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Title</label>
                  <Input {...register("title")} />
                  {errors.title && (
                    <p className="text-xs text-red-500">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium">Course</label>
                  <Controller
                    control={control}
                    name="courseId"
                    render={({ field }) => (
                      <select {...field} className="w-full border rounded p-2">
                        <option value="">Select course</option>
                        {courses.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.courseId && (
                    <p className="text-xs text-red-500">{errors.courseId.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">Description</label>
                <Textarea {...register("description")} rows={2} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Time Limit (min)</label>
                  <Input type="number" {...register("timeLimit")} />
                  {errors.timeLimit && (
                    <p className="text-xs text-red-500">{errors.timeLimit.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium">Maximum Attempts</label>
                  <Input type="number" {...register("maximumAttempts")} />
                  {errors.maximumAttempts && (
                    <p className="text-xs text-red-500">{errors.maximumAttempts.message}</p>
                  )}
                </div>
              </div>

              {/* Status Field */}
              <div>
                <label className="block text-sm font-medium">Status</label>
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <select {...field} className="w-full border rounded p-2">
                      <option value="">Select status</option>
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  )}
                />
                {errors.status && (
                  <p className="text-xs text-red-500">{errors.status.message}</p>
                )}
              </div>

              {/* Shuffle Questions */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="shuffleQuestions"
                  {...register("shuffleQuestions")}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="shuffleQuestions" className="text-sm font-medium">
                  Shuffle Questions
                </label>
              </div>

              {/* Questions */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-lg font-medium">Questions</h4>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => append({ text: "", type: "", marks: 1 })}
                  >
                    + Add
                  </Button>
                </div>

                {fields.map((field, i) => (
                  <div key={field.id} className="mb-4 p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span>Question {i + 1}</span>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => remove(i)}
                      >
                        &times;
                      </Button>
                    </div>

                    <Input
                      {...register(`questions.${i}.text`)}
                      placeholder="Question text"
                    />

                    <div className="flex gap-4">
                      <Controller
                        control={control}
                        name={`questions.${i}.type`}
                        render={({ field }) => (
                          <select {...field} className="w-full border rounded p-2">
                            <option value="">Type</option>
                            <option value="mcq">Multiple Choice</option>
                            <option value="short">Short Answer</option>
                          </select>
                        )}
                      />
                      <Input
                        type="number"
                        {...register(`questions.${i}.marks`)}
                        placeholder="Marks"
                      />
                    </div>

                    {(errors.questions?.[i] as any)?.text && (
                      <p className="text-xs text-red-500">
                        {(errors.questions![i]! as any).text.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating…" : "Create Quiz"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Input */}
      <Input
        type="search"
        placeholder="Search quizzes…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6 max-w-md"
      />

      {/* Quiz Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((quiz) => (
          <QuizCard
            key={quiz.id}
            id={quiz.id}
            title={quiz.title}
            description={quiz.description}
            status={quiz.status as "active" | "draft" | "scheduled"}
            timeLimit={quiz.timeLimit}
            date={quiz.date}
            participants={quiz.participants}
            questions={Array.isArray(quiz.questions) ? quiz.questions.length : quiz.questions}
            onEdit={() => router.push(`/faculty/quizzes/${quiz.id}/edit`)}
            onDelete={() => setQuizzes((q) => q.filter((x) => x.id !== quiz.id))}
          />
        ))}
      </div>

      <ScrollButton />
    </div>
  );
}
