// components/quiz/CreateQuizForm.tsx
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

const quizSchema = z.object({
  title: z.string().min(1, "Title is required"),
  courseId: z.string().min(1, "Select a course"),
  description: z.string().optional(),
  timeLimit: z.coerce.number().min(0, "Must be ≥ 0"),
  maximumAttempts: z.coerce.number().min(0, "Must be ≥ 0"),
  questions: z
    .array(
      z.object({
        text: z.string().min(1),
        type: z.string(),
        marks: z.coerce.number().min(0),
        choices: z.array(z.string()),
        correctAnswer: z.string(),
      })
    )
    .min(1, "Add at least one question"),
});

type QuizFormValues = z.infer<typeof quizSchema>;

interface CreateQuizFormProps {
  courses: { id: string; title: string }[];
  onSubmitAction: (data: any) => Promise<void>;
  initialData?: any;
}

export function CreateQuizForm({ courses, onSubmitAction, initialData }: CreateQuizFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: initialData?.title || "",
      courseId: initialData?.courseId || "",
      description: initialData?.description || "",
      timeLimit: initialData?.timeLimit ?? 30,
      maximumAttempts: initialData?.maximumAttempts ?? 1,
      questions: initialData?.questions || [
        { text: "", type: "", marks: 1, choices: ["", "", ""], correctAnswer: "" },
      ],
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmitAction)} className="space-y-6">
      {/* Title & Course */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <Input {...register("title")} />
          {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium">Course</label>
          <Select {...register("courseId")}>
            <option value="">Select course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </Select>
          {errors.courseId && (
            <p className="text-xs text-red-500">{errors.courseId.message}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium">Description</label>
        <Textarea {...register("description")} rows={2} />
      </div>

      {/* Time Limit & Max Attempts */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Time Limit (minutes)</label>
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

      {/* You can keep your “add question” UI here */}
      {/* ... */}

      <Button type="submit">Create Quiz</Button>
    </form>
  );
}
