"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Video,
  Brain,
  Settings,
  LogOut,
  User,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface SidebarProps {
  role: "student" | "faculty";
}

const studentNavigation = [
  {
    name: "Dashboard",
    href: "/student/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Quizzes",
    href: "/student/quizzes",
    icon: FileText,
  },
  {
    name: "Meetings",
    href: "/student/meetings",
    icon: Calendar,
  },
  {
    name: "Notes",
    href: "/student/notes",
    icon: BookOpen,
  },
  {
    name: "Video Lectures",
    href: "/student/videos",
    icon: Video,
  },
  {
    name: "AI Chat",
    href: "/student/ai-chat",
    icon: MessageSquare,
  },
];

const facultyNavigation = [
  {
    name: "Dashboard",
    href: "/faculty/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Quiz Generator",
    href: "/faculty/quiz-generator",
    icon: FileText,
  },
  {
    name: "Meeting Scheduler",
    href: "/faculty/meetings",
    icon: Calendar,
  },
  {
    name: "Notes Upload",
    href: "/faculty/notes",
    icon: BookOpen,
  },
  {
    name: "Video Lectures",
    href: "/faculty/videos",
    icon: Video,
  },
  {
    name: "AI Tools",
    href: "/faculty/ai-tools",
    icon: Brain,
  },
];

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const navigation = role === "student" ? studentNavigation : facultyNavigation;

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex-1 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="space-y-1">
        <Link
          href={`/${role}/profile`}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === `/${role}/profile`
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <User className="h-4 w-4" />
          Profile
        </Link>
        <Link
          href={`/${role}/settings`}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === `/${role}/settings`
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
} 