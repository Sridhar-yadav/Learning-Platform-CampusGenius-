"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PreviewDialogProps {
  isOpen: boolean;
  onCloseAction: () => void;
  note: {
    title: string;
    fileUrl: string;
  };
}

export default function PreviewDialog({ isOpen, onCloseAction, note }: PreviewDialogProps) {
  const fileExtension = note.fileUrl?.split(".").pop()?.toLowerCase();
  const isPDF = fileExtension === "pdf";
  const isImage = ["jpg", "jpeg", "png", "gif"].includes(fileExtension || "");

  return (
    <Dialog open={isOpen} onOpenChange={onCloseAction}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{note.title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 w-full h-full min-h-0">
          {isPDF ? (
            <iframe
              src={note.fileUrl}
              className="w-full h-full"
              title={note.title}
            />
          ) : isImage ? (
            <img
              src={note.fileUrl}
              alt={note.title}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p>Preview not available for this file type. Please download to view.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
