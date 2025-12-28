"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Bot, User, Upload, File, FileText, Image, Video, BookOpen, Brain } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type: "text" | "file" | "summary" | "quiz";
  fileUrl?: string;
  fileName?: string;
  mimeType?: string;
}

export default function AIToolsPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply || "No response from AI.",
        timestamp: new Date(),
        type: "text",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileAction = async (action: "summarize" | "generate-quiz") => {
    if (!fileInputRef.current?.files?.[0]) {
      fileInputRef.current?.click();
      return;
    }

    setIsUploading(true);
    const file = fileInputRef.current.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("action", action);

    try {
      const userMessage: Message = {
        role: "user",
        content: `Uploaded ${file.name} for ${action === "summarize" ? "summarization" : "quiz generation"}`,
        timestamp: new Date(),
        type: "file",
        fileName: file.name,
        mimeType: file.type
      };
      setMessages(prev => [...prev, userMessage]);

      const response = await fetch("/api/faculty/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const resultMessage: Message = {
          role: "assistant",
          content: data.content,
          timestamp: new Date(),
          type: data.type === "generate-quiz" ? "quiz" : "summary",
          fileUrl: data.fileUrl,
          fileName: data.fileName
        };
        setMessages(prev => [...prev, resultMessage]);
      } else {
        throw new Error(data.error || "Error processing file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, there was an error processing your file.",
        timestamp: new Date(),
        type: "text"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Faculty AI Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="chat" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <Bot className="h-4 w-4" /> Chat
              </TabsTrigger>
              <TabsTrigger value="summarize" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Summarize
              </TabsTrigger>
              <TabsTrigger value="quiz" className="flex items-center gap-2">
                <Brain className="h-4 w-4" /> Generate Quiz
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-4">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[400px] max-h-[600px]">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {message.role === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium">
                          {message.role === "user" ? "You" : "AI Assistant"}
                        </span>
                      </div>

                      {message.type === "file" ? (
                        <div className="flex items-center gap-2 text-sm">
                          {message.mimeType?.startsWith("image/") ? (
                            <Image className="h-4 w-4" />
                          ) : message.mimeType?.startsWith("video/") ? (
                            <Video className="h-4 w-4" />
                          ) : message.mimeType?.includes("pdf") ? (
                            <FileText className="h-4 w-4" />
                          ) : (
                            <File className="h-4 w-4" />
                          )}
                          <span>{message.fileName}</span>
                        </div>
                      ) : message.type === "quiz" ? (
                        <div className="space-y-4">
                          <p className="font-medium">Generated Quiz Questions:</p>
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}

                      <span className="text-xs opacity-70 mt-2 block">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}

                {(isLoading || isUploading) && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg p-4 bg-muted">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        <span className="text-sm font-medium">AI Assistant</span>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-100" />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.mp4"
                />
                <div className="flex-1">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything..."
                    className="min-h-[60px] max-h-[180px]"
                  />
                </div>
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="summarize" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <FileText className="h-12 w-12 mx-auto text-primary" />
                    <div>
                      <h3 className="text-lg font-medium">Upload File for Summary</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload a file (PDF, PPT, or document) to get an AI-generated summary
                      </p>
                    </div>
                    <Button
                      onClick={() => handleFileAction("summarize")}
                      disabled={isUploading}
                      className="w-full max-w-sm"
                    >
                      {isUploading ? "Processing..." : "Upload & Summarize"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="quiz" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <Brain className="h-12 w-12 mx-auto text-primary" />
                    <div>
                      <h3 className="text-lg font-medium">Generate Quiz Questions</h3>
                      <p className="text-sm text-muted-foreground">
                        Upload course material to generate multiple-choice quiz questions
                      </p>
                    </div>
                    <Button
                      onClick={() => handleFileAction("generate-quiz")}
                      disabled={isUploading}
                      className="w-full max-w-sm"
                    >
                      {isUploading ? "Generating..." : "Upload & Generate Quiz"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
