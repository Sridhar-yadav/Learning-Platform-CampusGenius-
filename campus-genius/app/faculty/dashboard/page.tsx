"use client";

import * as React from "react";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Button } from "@/components/ui/button";
import { Bell, Settings, LogOut, User, TrendingUp, Users, GraduationCap, FileText, Calendar, BookOpen, Video } from "lucide-react";
import { motion } from "framer-motion";

// Mock data for charts
const studentPerformanceData = [
  { month: "Jan", score: 75 },
  { month: "Feb", score: 78 },
  { month: "Mar", score: 82 },
  { month: "Apr", score: 85 },
  { month: "May", score: 88 },
];

export default function FacultyDashboardPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Faculty Dashboard</h2>
          <p className="text-muted-foreground">Welcome back, Dr. Abhi</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon"><Bell className="h-5 w-5" /></Button>
          <Button variant="outline" size="icon"><Settings className="h-5 w-5" /></Button>
          <LogoutButton variant="outline" className="h-10 w-10 p-0" showText={false} />
        </div>
      </div >

      {/* Profile and Quick Stats */}
      < div className="grid gap-4 md:grid-cols-4" >
        <div className="col-span-1 rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-12 w-12 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold">Dr. Abhi</h3>
              <p className="text-sm text-muted-foreground">Computer Science Department</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="col-span-3 grid gap-4 md:grid-cols-3">
          {studentPerformanceData.map((data, index) => (
            <motion.div key={index} whileHover={{ scale: 1.02 }} className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Score for {data.month}</p>
                  <h3 className="text-2xl font-bold">{data.score}%</h3>
                </div>
                <div className="rounded-full bg-green-100 p-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div className="h-2 rounded-full bg-green-500" style={{ width: `${data.score}% ` }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div >

      {/* Quick Actions */}
      < div className="col-span-1 rounded-xl border bg-card p-6 shadow-sm" >
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <Link href="/faculty/quizzes">
            <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col items-center justify-center p-4 rounded-lg border hover:border-primary transition-colors">
              <FileText className="h-6 w-6 mb-2" />
              <span className="text-sm">Create Quiz</span>
            </motion.div>
          </Link>
          <Link href="/faculty/meetings">
            <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col items-center justify-center p-4 rounded-lg border hover:border-primary transition-colors">
              <Calendar className="h-6 w-6 mb-2" />
              <span className="text-sm">Schedule Meeting</span>
            </motion.div>
          </Link>
          <Link href="/faculty/notes">
            <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col items-center justify-center p-4 rounded-lg border hover:border-primary transition-colors">
              <BookOpen className="h-6 w-6 mb-2" />
              <span className="text-sm">Upload Notes</span>
            </motion.div>
          </Link>
          <Link href="/faculty/videos">
            <motion.div whileHover={{ scale: 1.05 }} className="flex flex-col items-center justify-center p-4 rounded-lg border hover:border-primary transition-colors">
              <Video className="h-6 w-6 mb-2" />
              <span className="text-sm">Upload Video</span>
            </motion.div>
          </Link>
        </div>
      </div >
    </div >
  );
}
