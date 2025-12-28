"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"

interface TimePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date?: Date
  setDate?: (date: Date) => void
}

export function TimePicker({ date, setDate, className }: TimePickerProps) {
  const minutesList = Array.from({ length: 60 }, (_, i) => i)
  const hoursList = Array.from({ length: 12 }, (_, i) => i + 1)

  const [hour, setHour] = React.useState<number>(() => {
    if (!date) return 12
    const h = date.getHours()
    return h === 0 ? 12 : h > 12 ? h - 12 : h
  })

  const [minute, setMinute] = React.useState<number>(() => {
    return date ? date.getMinutes() : 0
  })

  const [meridiem, setMeridiem] = React.useState<"AM" | "PM">(() => {
    if (!date) return "AM"
    return date.getHours() >= 12 ? "PM" : "AM"
  })

  React.useEffect(() => {
    if (!setDate) return

    const newDate = new Date()
    let hours = hour
    if (meridiem === "PM" && hours !== 12) hours += 12
    if (meridiem === "AM" && hours === 12) hours = 0
    newDate.setHours(hours)
    newDate.setMinutes(minute)

    setDate(newDate)
  }, [hour, minute, meridiem, setDate])

  return (
    <div className={cn("flex items-end gap-2", className)}>
      <div className="grid gap-1 text-center">
        <Select
          value={hour.toString()}
          onValueChange={(value) => setHour(parseInt(value))}
        >
          <SelectTrigger className="w-[65px]">
            <SelectValue placeholder="Hour" />
          </SelectTrigger>
          <SelectContent position="popper" className="h-[200px]">
            {hoursList.map((hour) => (
              <SelectItem key={hour} value={hour.toString()}>
                {hour.toString().padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">Hour</span>
      </div>
      <div className="grid gap-1 text-center">
        <Select
          value={minute.toString()}
          onValueChange={(value) => setMinute(parseInt(value))}
        >
          <SelectTrigger className="w-[65px]">
            <SelectValue placeholder="Min" />
          </SelectTrigger>
          <SelectContent position="popper" className="h-[200px]">
            {minutesList.map((minute) => (
              <SelectItem key={minute} value={minute.toString()}>
                {minute.toString().padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">Min</span>
      </div>
      <div className="grid gap-1 text-center">
        <Select
          value={meridiem}
          onValueChange={(value) => setMeridiem(value as "AM" | "PM")}
        >
          <SelectTrigger className="w-[65px]">
            <SelectValue placeholder="AM/PM" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">AM/PM</span>
      </div>
      <div className="flex h-10 items-center">
        <Clock className="ml-2 h-4 w-4 opacity-50" />
      </div>
    </div>
  )
} 