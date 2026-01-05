"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FacultyProvider } from "../context/FacultyContext";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Video,
  FileText,
  Brain,
  Settings,
  Menu,
  X,
  User,
  LogOut,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const navigation = [
  {
    name: "Dashboard",
    href: "/faculty/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Profile",
    href: "/faculty/profile",
    icon: User,
  },
  {
    name: "Courses",
    href: "/faculty/courses",
    icon: BookOpen,
  },
  {
    name: "Meetings",
    href: "/faculty/meetings",
    icon: Calendar,
  },
  {
    name: "Video Lectures",
    href: "/faculty/video-lectures",
    icon: Video,
  },
  {
    name: "Quizzes",
    href: "/faculty/quizzes",
    icon: FileText,
  },
  {
    name: "AI Tools",
    href: "/faculty/ai-tools",
    icon: Brain,
  },
  {
    name: "Settings",
    href: "/faculty/settings",
    icon: Settings,
  },
];

export default function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <FacultyProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Dialog open={isLogoutOpen} onOpenChange={setIsLogoutOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Logout</DialogTitle>
              <DialogDescription>
                Are you sure you want to log out? You will be redirected to the login page.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsLogoutOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Mobile sidebar */}
        <div
          className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"
            }`}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-gray-800">
            <div className="flex h-16 items-center justify-between px-4">
              <span className="text-xl font-bold">Campus Genius</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4 flex flex-col">
              <div className="flex-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${isActive
                          ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                        }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive
                            ? "text-gray-500 dark:text-gray-300"
                            : "text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300"
                          }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              <button
                onClick={() => setIsLogoutOpen(true)}
                className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-red-400 group-hover:text-red-500 dark:text-red-400" />
                Logout
              </button>
            </nav>
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="flex h-16 items-center px-4">
              <span className="text-xl font-bold">Campus Genius</span>
            </div>
            <nav className="flex-1 space-y-1 px-2 py-4 flex flex-col">
              <div className="flex-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${isActive
                          ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                        }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive
                            ? "text-gray-500 dark:text-gray-300"
                            : "text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300"
                          }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              <button
                onClick={() => setIsLogoutOpen(true)}
                className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-red-400 group-hover:text-red-500 dark:text-red-400" />
                Logout
              </button>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <button
              type="button"
              className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden dark:border-gray-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex flex-1 justify-between px-4">
              <div className="flex flex-1"></div>
              <div className="ml-4 flex items-center md:ml-6">
                {/* Add user menu or other header items here */}
              </div>
            </div>
          </div>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </FacultyProvider>
  );
} 