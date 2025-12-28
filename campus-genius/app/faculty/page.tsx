"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useFaculty } from "../context/FacultyContext";
import {
  BookOpen,
  Calendar,
  FileText,
  Video,
  Brain,
  Users,
  Clock,
  CheckCircle,
  User,
} from "lucide-react";

const stats = [
  {
    title: "Total Students",
    value: "150",
    icon: Users,
    color: "bg-blue-500",
  },
  {
    title: "Active Courses",
    value: "8",
    icon: BookOpen,
    color: "bg-green-500",
  },
  {
    title: "Upcoming Meetings",
    value: "3",
    icon: Calendar,
    color: "bg-purple-500",
  },
  {
    title: "Video Lectures",
    value: "12",
    icon: Video,
    color: "bg-red-500",
  },
];

const recentActivities = [
  {
    title: "New Quiz Created",
    description: "Introduction to React",
    time: "2 hours ago",
    icon: FileText,
  },
  {
    title: "Meeting Scheduled",
    description: "Team Discussion",
    time: "3 hours ago",
    icon: Calendar,
  },
  {
    title: "Video Uploaded",
    description: "Advanced JavaScript Concepts",
    time: "5 hours ago",
    icon: Video,
  },
];

export default function FacultyDashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const { profile } = useFaculty();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {profile.name || "Faculty"}</h1>
          {profile.department && (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Department: {profile.department}
            </p>
          )}
          {profile.yearsOfExperience && (
            <p className="text-gray-600 dark:text-gray-400">
              Experience: {profile.yearsOfExperience} years
            </p>
          )}
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => {}}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create Quiz
          </button>
          <button
            onClick={() => {}}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Schedule Meeting
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div
                className={`${stat.color} p-3 rounded-lg text-white`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activities */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                <activity.icon className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{activity.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activity.description}
                </p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {activity.time}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {}}
              className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <FileText className="w-6 h-6 mb-2" />
              <span className="text-sm">Create Quiz</span>
            </button>
            <button
              onClick={() => {}}
              className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <Calendar className="w-6 h-6 mb-2" />
              <span className="text-sm">Schedule Meeting</span>
            </button>
            <button
              onClick={() => {}}
              className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <Video className="w-6 h-6 mb-2" />
              <span className="text-sm">Upload Video</span>
            </button>
            <button
              onClick={() => {}}
              className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <Brain className="w-6 h-6 mb-2" />
              <span className="text-sm">AI Tools</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}