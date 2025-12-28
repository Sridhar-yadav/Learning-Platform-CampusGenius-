"use client";

import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

interface BaseLayoutProps {
  children: React.ReactNode;
}

export function BaseLayout({ children }: BaseLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {children}
      <Toaster />
    </div>
  );
} 