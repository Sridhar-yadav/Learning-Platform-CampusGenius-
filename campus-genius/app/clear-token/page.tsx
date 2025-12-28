"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ClearTokenPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear all cookies
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }

    // Call the logout API
    fetch("/api/auth/logout", {
      method: "POST",
    }).finally(() => {
      // Redirect to login page
      router.push("/auth/login");
    });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Clearing tokens...</h1>
        <p>Please wait while we clear your session.</p>
      </div>
    </div>
  );
} 