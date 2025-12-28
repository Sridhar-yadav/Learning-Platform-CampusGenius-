"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Campus Genius
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/about"
              className={cn(
                "transition-colors hover:text-foreground/80",
                isActive("/about")
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={cn(
                "transition-colors hover:text-foreground/80",
                isActive("/contact")
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              Contact
            </Link>
            {status === "authenticated" ? (
              <>
                <Link
                  href={`/${session?.user?.role}/dashboard`}
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    isActive(`/${session?.user?.role}/dashboard`)
                      ? "text-foreground"
                      : "text-foreground/60"
                  )}
                >
                  Dashboard
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    isActive("/login")
                      ? "text-foreground"
                      : "text-foreground/60"
                  )}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    isActive("/register")
                      ? "text-foreground"
                      : "text-foreground/60"
                  )}
                >
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </nav>
  );
} 