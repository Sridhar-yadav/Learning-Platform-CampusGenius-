"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Calendar,
  GraduationCap,
  MessageSquare,
  Users,
  Video,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            <span className="text-xl font-bold">CampusGenius</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Home
            </Link>
            <Link href="/about" className="text-sm font-medium transition-colors hover:text-primary">
              About
            </Link>
            <Link href="/contact" className="text-sm font-medium transition-colors hover:text-primary">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />

        <div className="container flex flex-col items-center gap-8 py-24 text-center md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              AI-Powered Learning Platform
            </div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Transform Your Learning
              <br />
              <span className="text-primary">Experience</span>
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              CampusGenius brings together students and faculty in a modern, AI-powered learning environment.
              Access courses, quizzes, notes, meetings, video lectures, and instant doubt solving - all in one place.
            </p>
            <div className="flex gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="group">
                  Get Started{" "}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Feature Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-6 text-center shadow-sm transition-all hover:shadow-md">
              <div className="rounded-full bg-primary/10 p-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">AI-Powered Learning</h3>
              <p className="text-muted-foreground">
                Smart quizzes, personalized learning paths, and instant doubt solving with AI assistance.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-6 text-center shadow-sm transition-all hover:shadow-md">
              <div className="rounded-full bg-primary/10 p-4">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Interactive Courses</h3>
              <p className="text-muted-foreground">
                Access course materials, submit assignments, and track your progress in real-time.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-6 text-center shadow-sm transition-all hover:shadow-md">
              <div className="rounded-full bg-primary/10 p-4">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Video Lectures</h3>
              <p className="text-muted-foreground">
                High-quality video content with interactive features and AI-powered summaries.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-6 text-center shadow-sm transition-all hover:shadow-md">
              <div className="rounded-full bg-primary/10 p-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Smart Scheduling</h3>
              <p className="text-muted-foreground">
                AI-powered meeting scheduler for office hours and study groups.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-6 text-center shadow-sm transition-all hover:shadow-md">
              <div className="rounded-full bg-primary/10 p-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Instant Support</h3>
              <p className="text-muted-foreground">
                24/7 AI chat support for instant answers to your questions.
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-6 text-center shadow-sm transition-all hover:shadow-md">
              <div className="rounded-full bg-primary/10 p-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Collaborative Learning</h3>
              <p className="text-muted-foreground">
                Connect with peers, join study groups, and participate in discussions.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            <span className="text-xl font-bold">CampusGenius</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-primary">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-primary">
              Terms
            </Link>
            <Link href="/contact" className="text-sm text-muted-foreground transition-colors hover:text-primary">
              Contact
            </Link>
          </nav>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with ❤️ for modern education
          </p>
        </div>
      </footer>
    </div>
  );
}