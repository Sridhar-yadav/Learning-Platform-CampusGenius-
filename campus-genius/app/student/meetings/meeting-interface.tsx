"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Video, VideoOff, Phone, MessageSquare, Users, Share2 } from "lucide-react";

interface MeetingInterfaceProps {
  meeting: {
    id: number;
    title: string;
    instructor: string;
  };
  onCloseAction: () => void;
}

export default function MeetingInterface({ meeting, onCloseAction }: MeetingInterfaceProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [participants, setParticipants] = useState([
    { id: 1, name: meeting.instructor, isHost: true },
    { id: 2, name: "You", isHost: false },
  ]);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // In a real app, this would be replaced with actual WebRTC implementation
    if (videoRef.current) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error("Error accessing camera:", err));
    }

    return () => {
      // Clean up video stream
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleVideo = () => setIsVideoOff(!isVideoOff);

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex">
      <div className="flex-1 p-4">
        <div className="flex flex-col h-full">
          {/* Meeting header */}
          <div className="flex justify-between items-center mb-4 text-white">
            <h2 className="text-xl font-bold">{meeting.title}</h2>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>

          {/* Main content area */}
          <div className="flex-1 flex gap-4">
            {/* Video grid */}
            <div className="flex-1 grid grid-cols-2 gap-4">
              {/* Instructor video */}
              <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                <div className="absolute bottom-4 left-4 bg-black/50 px-2 py-1 rounded text-white">
                  {meeting.instructor} (Host)
                </div>
              </div>
              {/* Your video */}
              <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
                />
                {isVideoOff && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    Camera Off
                  </div>
                )}
                <div className="absolute bottom-4 left-4 bg-black/50 px-2 py-1 rounded text-white">
                  You
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <Card className="w-64 bg-gray-800/50 text-white">
              <div className="p-4">
                <h3 className="font-semibold mb-2">Participants ({participants.length})</h3>
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <div key={participant.id} className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{participant.name}</span>
                      {participant.isHost && (
                        <Badge className="bg-blue-500 text-xs">Host</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Controls */}
          <div className="mt-4 flex justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full ${isMuted ? 'bg-red-500 text-white' : ''}`}
              onClick={toggleMute}
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full ${isVideoOff ? 'bg-red-500 text-white' : ''}`}
              onClick={toggleVideo}
            >
              {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="rounded-full"
              onClick={onCloseAction}
            >
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
