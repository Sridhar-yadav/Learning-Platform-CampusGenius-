"use client"

import * as React from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { LogoutButton } from "@/components/auth/LogoutButton";

const stats = [
  {
    title: "Performance",
    value: "85%",
    description: "+2.5% from last month",
    href: "/student/performance"
  },
  {
    title: "Pending Quizzes",
    value: "5",
    description: "Due in the next 7 days",
    href: "/student/quizzes"
  },
  {
    title: "Upcoming Meetings",
    value: "3",
    description: "Scheduled for this week",
    href: "/student/meetings"
  },
  {
    title: "New Content",
    value: "8",
    description: "New video lectures available",
    href: "/student/lectures"
  }
]

const features = [
  {
    title: "Quizzes",
    description: "Take quizzes created by faculty members",
    href: "/student/quizzes",
    count: "5 quizzes",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  {
    title: "Meetings",
    description: "Join meetings organized by faculty",
    href: "/student/meetings",
    count: "3 meetings",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    title: "Notes",
    description: "Access and manage your study notes",
    href: "/student/notes",
    count: "12 notes",
    icon: (
      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  }
]



export default function DashboardPage() {
  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-foreground">Welcome back!</h1>
          <p className="text-muted-foreground">Here's what's happening with your courses today.</p>
        </div>
        <LogoutButton />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="p-6 bg-card text-card-foreground hover:bg-accent/50 transition-colors">
              <h3 className="text-lg font-semibold mb-2">{stat.title}</h3>
              <div className="text-4xl font-bold">{stat.value}</div>
              <p className="text-muted-foreground">{stat.description}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Link key={feature.title} href={feature.href}>
            <Card className="p-6 bg-card text-card-foreground hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
              </div>
              <p className="text-muted-foreground mb-4">{feature.description}</p>
              <div className="inline-block px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                {feature.count}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
} 