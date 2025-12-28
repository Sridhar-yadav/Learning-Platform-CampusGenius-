"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { TimePicker } from "@/components/ui/time-picker";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Search, Plus, ChevronUp, ChevronDown } from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  courseId: string;
  courseName: string;
  description: string;
  link: string;
}

interface Course {
  id: string;
  title: string;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    courseId: "",
    date: new Date(),
    description: "",
  });
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const { toast } = useToast();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetchMeetings();
    fetchCourses();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        setCanScrollUp(scrollTop > 0);
        setCanScrollDown(scrollTop + clientHeight < scrollHeight);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      handleScroll(); // initialize once
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/faculty/meetings");
      if (!response.ok) {
        throw new Error("Failed to fetch meetings");
      }
      const data = await response.json();
      setMeetings(data);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      toast({
        title: "Error",
        description: "Failed to fetch meetings. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/faculty/courses");
      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch courses. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/faculty/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          date: format(formData.date, "yyyy-MM-dd"),
          time: format(formData.date, "HH:mm"),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to schedule meeting");
      }

      const newMeeting = await response.json();
      setMeetings((prev) => [...prev, newMeeting]);
      setIsDialogOpen(false);
      setFormData({
        title: "",
        courseId: "",
        date: new Date(),
        description: "",
      });
      toast({
        title: "Success",
        description: "Meeting scheduled successfully",
      });
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      toast({
        title: "Error",
        description: "Failed to schedule meeting. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredMeetings = meetings.filter((meeting) =>
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollBy = (amount: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: amount, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Meetings</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Meeting
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col p-0">
            <DialogHeader className="px-4 pt-5 pb-4">
              <DialogTitle>Schedule New Meeting</DialogTitle>
            </DialogHeader>
              <div className="relative flex flex-1 overflow-hidden">
              {/* Scroll Buttons */}
                <div className="absolute right-2 top-2 z-10">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={!canScrollUp}
                    onClick={() => scrollBy(-200)}
                    className="rounded-full"
                    >
                      <ChevronUp className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute right-2 bottom-20 z-10">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={!canScrollDown}
                    onClick={() => scrollBy(200)}
                    className="rounded-full"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>

    {/* Scrollable Form */}
              <form
                    onSubmit={handleSubmit}
                    ref={formRef}
                    >
               <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute right-4 top-2 z-10 rounded-full opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => scrollBy(200)}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-4 scroll-smooth">
              <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 scroll-smooth" ref={scrollContainerRef}>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Course</label>
                  <Select
                    value={formData.courseId}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, courseId: value }))
                    }
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
                  <label className="text-sm font-medium">Date & Time</label>
                  <div className="space-y-4">
                    <div className="rounded-md border">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) =>
                          setFormData((prev) => ({ ...prev, date: date || new Date() }))
                        }
                        initialFocus
                        className="[&.rdp-nav_button]:transition-colors [&.rdp-nav_button]:duration-200"
                      />
                    </div>
                    <TimePicker
                      date={formData.date}
                      setDate={(date) => {
                        const newDate = new Date(formData.date)
                        newDate.setHours(date.getHours())
                        newDate.setMinutes(date.getMinutes())
                        setFormData((prev) => ({ ...prev, date: newDate }))
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute right-4 bottom-20 z-10 rounded-full opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => scrollBy(200)}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>

              {/* Submit button */}
                <div className="border-t p-4 mt-2">
                  <Button type="submit" className="w-full">
                    Schedule Meeting
                  </Button>
                </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search meetings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No meetings found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMeetings.map((meeting) => (
            <Card key={meeting.id}>
              <CardHeader>
                <CardTitle>{meeting.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Course: {meeting.courseName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Date: {format(new Date(meeting.date), "PPP")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Time: {meeting.time}
                  </p>
                  {meeting.description && (
                    <p className="text-sm text-muted-foreground">
                      {meeting.description}
                    </p>
                  )}
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => window.open(meeting.link, "_blank")}
                  >
                    Join Meeting
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
