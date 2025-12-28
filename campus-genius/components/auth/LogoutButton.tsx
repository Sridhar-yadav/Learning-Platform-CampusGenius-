"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface LogoutButtonProps {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    className?: string;
    showText?: boolean;
}

export function LogoutButton({ variant = "destructive", className, showText = true }: LogoutButtonProps) {
    const handleLogout = async () => {
        await signOut({ callbackUrl: "/auth/login" });
    };

    return (
        <Button
            variant={variant}
            onClick={handleLogout}
            className={className}
        >
            <LogOut className={`h-4 w-4 ${showText ? "mr-2" : ""}`} />
            {showText && "Sign Out"}
        </Button>
    );
}
