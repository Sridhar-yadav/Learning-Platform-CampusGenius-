"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Download, Upload, Plus, Search, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import PreviewDialog from "./preview-dialog";
import { useSession } from "next-auth/react";

interface Note {
  id: string;
  title: string;
  description: string;
  subject: string;
  type: string;
  fileUrl: string;
  createdAt: string;
}

const initialNotes: Note[] = [
  {
    id: "1",
    title: "Introduction to Programming",
    description: "Basic programming concepts and syntax",
    subject: "Computer Science",
    type: "lecture",
    fileUrl: "/notes/intro-programming.pdf",
    createdAt: "2024-03-20",
  },
  {
    id: "2",
    title: "Data Structures Overview",
    description: "Common data structures and their implementations",
    subject: "Computer Science",
    type: "study",
    fileUrl: "/notes/data-structures.pdf",
    createdAt: "2024-03-21",
  },
  {
    id: "3",
    title: "Algorithm Analysis",
    description: "Time and space complexity analysis",
    subject: "Computer Science",
    type: "lecture",
    fileUrl: "/notes/algorithm-analysis.pdf",
    createdAt: "2024-03-22",
  },
];

export default function NotesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddNote, setShowAddNote] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({
    title: "",
    description: "",
    subject: "",
    type: "lecture",
    file: null as File | null,
  });

  // Fetch notes on component mount
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/notes");
      if (!response.ok) throw new Error("Failed to fetch notes");
      const data = await response.json();
      // Map Django fields to Frontend interface
      const mappedNotes = data.map((item: any) => ({
        id: item.id.toString(),
        title: item.title,
        description: item.description,
        subject: item.subject || "General", // Handle null subject
        type: item.type || "lecture",
        fileUrl: item.file, // Map 'file' to 'fileUrl'
        createdAt: item.created_at, // Map 'created_at' to 'createdAt'
      }));
      setNotes(mappedNotes);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch notes",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewNote({ ...newNote, file });
    }
  };

  const handleAddNote = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      if (!newNote.file) {
        throw new Error("Please select a file");
      }

      // Consolidate to single request
      const formData = new FormData();
      formData.append("title", newNote.title);
      formData.append("description", newNote.description);
      formData.append("subject", newNote.subject);
      formData.append("type", newNote.type);
      formData.append("file", newNote.file); // Django expects 'file'

      const response = await fetch("/api/notes", {
        method: "POST",
        body: formData, // No Content-Type header (browser sets boundary)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to create note");
      }

      const createdNoteRaw = await response.json();
      const createdNote: Note = {
        id: createdNoteRaw.id.toString(),
        title: createdNoteRaw.title,
        description: createdNoteRaw.description,
        subject: createdNoteRaw.subject || "General",
        type: createdNoteRaw.type || "lecture",
        fileUrl: createdNoteRaw.file,
        createdAt: createdNoteRaw.created_at,
      };

      setNotes([createdNote, ...notes]);
      setShowAddNote(false);
      toast({
        title: "Success",
        description: "Note created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create note",
        variant: "destructive",
      });
      return;
    }

    setNewNote({
      title: "",
      description: "",
      subject: "",
      type: "lecture",
      file: null,
    });
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "lecture":
        return <Badge className="bg-blue-500">Lecture</Badge>;
      case "assignment":
        return <Badge className="bg-green-500">Assignment</Badge>;
      case "study":
        return <Badge className="bg-purple-500">Study</Badge>;
      default:
        return <Badge className="bg-gray-500">{type}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Notes</h1>
        <Button onClick={() => setShowAddNote(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Note
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search notes..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {showAddNote && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Note</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddNote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={newNote.description}
                  onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <Input
                  value={newNote.subject}
                  onChange={(e) => setNewNote({ ...newNote, subject: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={newNote.type}
                  onChange={(e) => setNewNote({ ...newNote, type: e.target.value })}
                >
                  <option value="lecture">Lecture</option>
                  <option value="assignment">Assignment</option>
                  <option value="study">Study</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">File</label>
                <Input type="file" onChange={handleFileUpload} required />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Upload Note</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddNote(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <Card key={note.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{note.title}</CardTitle>
              <CardDescription>{note.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{note.subject}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {getTypeBadge(note.type)}
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                className="flex-1"
                variant="outline"
                onClick={() => setSelectedNote(note)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                className="flex-1"
                onClick={() => window.open(note.fileUrl, "_blank")}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedNote && (
        <PreviewDialog
          isOpen={!!selectedNote}
          onCloseAction={() => setSelectedNote(null)}
          note={selectedNote}
        />
      )}
    </div>
  );
}