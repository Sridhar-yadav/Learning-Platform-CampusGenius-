"use client";

import * as React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export interface ScrollButtonProps {}

export function ScrollButton({}: ScrollButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  // Check if we should show the button
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Check if we're at the bottom of the page
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      
      setIsAtBottom(windowHeight + scrollTop >= documentHeight - 100);
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <div className="fixed right-4 bottom-4 flex flex-col gap-2">
      {isVisible && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className="rounded-full shadow-lg hover:shadow-xl transition-all"
          variant="default"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      )}
      {!isAtBottom && (
        <Button
          onClick={scrollToBottom}
          size="icon"
          className="rounded-full shadow-lg hover:shadow-xl transition-all"
          variant="default"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
} 