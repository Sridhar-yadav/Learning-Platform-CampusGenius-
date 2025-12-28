"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Video, Search, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface VideoLecture {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  videoUrl: string;
  description: string;
  uploadedAt: string;
}

interface Course {
  id: string;
  title: string;
}

export default function VideoLecturesPage() {
  const [lectures, setLectures] = useState<VideoLecture[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchLectures();
    fetchCourses();
  }, []);

  const fetchLectures = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/faculty/video-lectures", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          router.push("/auth/login");
          return;
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setLectures(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching lectures:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch lectures. Please try again.",
      });
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/faculty/courses", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/auth/login");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch courses. Please try again.",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case "title":
        setTitle(value);
        break;
      case "description":
        setDescription(value);
        break;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setVideoFile(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("courseId", selectedCourse);
      formData.append("description", description.trim());
      if (videoFile) {
        formData.append("video", videoFile);
      }

      const response = await fetch("/api/faculty/video-lectures", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/auth/login");
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload video lecture");
      }

      const data = await response.json();
      setLectures((prev) => [data, ...prev]);
      toast({
        title: "Success",
        description: "Video lecture uploaded successfully",
      });
      
      // Reset form
      setTitle("");
      setSelectedCourse("");
      setDescription("");
      setVideoFile(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error uploading video lecture:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload video lecture. Please try again.",
      });
      setUploading(false);
    }
  };

  const filteredLectures = lectures.filter((lecture) =>
    lecture.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lecture.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Video Lectures</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Upload Video Lecture
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Upload Video Lecture</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  name="title"
                  value={title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter video lecture title"
                  disabled={uploading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Course</label>
                <Select
                  value={selectedCourse}
                  onValueChange={(value) =>
                    setSelectedCourse(value)
                  }
                  disabled={uploading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Video File</label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg"
                    onChange={handleFileChange}
                    required
                    disabled={uploading}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                  />
                </div>
                {videoFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected file: {videoFile.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Optional)</label>
                <Input
                  name="description"
                  value={description}
                  onChange={handleInputChange}
                  placeholder="Add a description for the video lecture"
                  disabled={uploading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={uploading}>
                {uploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-bounce" />
                    Uploading Video...
                  </>
                ) : (
                  "Upload Video Lecture"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search video lectures..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredLectures.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No video lectures found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLectures.map((lecture) => (
            <Card key={lecture.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  {lecture.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Course: {lecture.courseName}
                  </p>
                  {lecture.description && (
                    <p className="text-sm text-muted-foreground">
                      {lecture.description}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Uploaded: {new Date(lecture.uploadedAt).toLocaleDateString()}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => window.open(lecture.videoUrl, "_blank")}
                  >
                    Watch Video
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 