"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Video, Play, Clock, BookOpen, Search } from "lucide-react";

// Mock data for video lectures
const videoLectures = [
  {
    id: 1,
    title: "Introduction to React",
    description: "Learn the basics of React and its core concepts",
    instructor: "Dr. Smith",
    subject: "Web Development",
    duration: "45:00",
    date: "2024-03-20",
    status: "available", // available, upcoming, completed
    videoUrl: "https://example.com/videos/react-intro",
  },
  {
    id: 2,
    title: "Advanced JavaScript Concepts",
    description: "Deep dive into advanced JavaScript features",
    instructor: "Prof. Johnson",
    subject: "Programming",
    duration: "60:00",
    date: "2024-03-21",
    status: "upcoming",
    videoUrl: "https://example.com/videos/js-advanced",
  },
  {
    id: 3,
    title: "Database Design Principles",
    description: "Understanding database design and optimization",
    instructor: "Dr. Williams",
    subject: "Database",
    duration: "50:00",
    date: "2024-03-22",
    status: "completed",
    videoUrl: "https://example.com/videos/db-design",
  },
];

export default function VideoLecturesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLecture, setSelectedLecture] = useState<typeof videoLectures[0] | null>(null);

  const filteredLectures = videoLectures.filter(
    (lecture) =>
      lecture.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lecture.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lecture.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500">Available</Badge>;
      case "upcoming":
        return <Badge className="bg-blue-500">Upcoming</Badge>;
      case "completed":
        return <Badge className="bg-gray-500">Completed</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  const handleWatchLecture = (lecture: typeof videoLectures[0]) => {
    setSelectedLecture(lecture);
    // TODO: Implement video player functionality
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Video Lectures</h1>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search lectures..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLectures.map((lecture) => (
          <Card key={lecture.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{lecture.title}</CardTitle>
              <CardDescription>{lecture.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{lecture.subject}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{lecture.instructor}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{lecture.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {new Date(lecture.date).toLocaleDateString()}
                  </span>
                </div>
                {getStatusBadge(lecture.status)}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={() => handleWatchLecture(lecture)}
                disabled={lecture.status === "upcoming"}
              >
                <Play className="h-4 w-4 mr-2" />
                {lecture.status === "upcoming" ? "Coming Soon" : "Watch Lecture"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedLecture && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
            <h2 className="text-2xl font-bold mb-4">{selectedLecture.title}</h2>
            <div className="aspect-video bg-black mb-4">
              {/* TODO: Implement video player component */}
              <div className="w-full h-full flex items-center justify-center text-white">
                Video Player Placeholder
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setSelectedLecture(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 