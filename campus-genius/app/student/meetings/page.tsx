"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Video } from "lucide-react";

// Mock data for meetings
const meetings = [
  {
    id: 1,
    title: "Introduction to Programming",
    description: "Basic programming concepts and problem-solving techniques",
    date: "2024-03-25",
    time: "10:00 AM",
    duration: 60, // minutes
    instructor: "Dr. Sarah Johnson",
    subject: "Computer Science",
    status: "upcoming", // upcoming, ongoing, completed
    meetingLink: "https://meet.google.com/abc-defg-hij",
  },
  {
    id: 2,
    title: "Data Structures Workshop",
    description: "Hands-on workshop on implementing basic data structures",
    date: "2024-03-26",
    time: "02:00 PM",
    duration: 90,
    instructor: "Prof. Michael Chen",
    subject: "Computer Science",
    status: "upcoming",
    meetingLink: "https://meet.google.com/xyz-uvw-rst",
  },
  {
    id: 3,
    title: "Database Design Principles",
    description: "Understanding database normalization and design patterns",
    date: "2024-03-24",
    time: "11:00 AM",
    duration: 60,
    instructor: "Dr. Emily Brown",
    subject: "Computer Science",
    status: "completed",
    meetingLink: "https://meet.google.com/mno-pqr-uvw",
  },
];

import MeetingInterface from "./meeting-interface";

export default function MeetingsPage() {
  const [selectedMeeting, setSelectedMeeting] = useState<number | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ongoing":
        return <Badge className="bg-green-500">Ongoing</Badge>;
      case "completed":
        return <Badge className="bg-gray-500">Completed</Badge>;
      default:
        return <Badge className="bg-blue-500">Upcoming</Badge>;
    }
  };

  const joinMeeting = (meetingId: number) => {
    setSelectedMeeting(meetingId);
  };

  const closeMeeting = () => {
    setSelectedMeeting(null);
  };

  const activeMeeting = meetings.find(m => m.id === selectedMeeting);

  return (
    <div className="container mx-auto py-8">
      {activeMeeting && (
        <MeetingInterface
          meeting={activeMeeting}
          onCloseAction={closeMeeting}
        />
      )}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Meetings</h1>
        <Button className="flex items-center gap-2">
          <Video className="h-4 w-4" />
          Join Meeting
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meetings.map((meeting) => (
          <Card key={meeting.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{meeting.title}</CardTitle>
              <CardDescription>{meeting.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {new Date(meeting.date).toLocaleDateString()} at {meeting.time}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{meeting.duration} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{meeting.instructor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{meeting.subject}</span>
                </div>
                {getStatusBadge(meeting.status)}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => joinMeeting(meeting.id)}
                disabled={meeting.status === "completed"}
              >
                {meeting.status === "completed" ? "View Recording" : "Join Meeting"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 