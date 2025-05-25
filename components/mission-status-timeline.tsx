"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Play, Pause, Square, AlertTriangle } from "lucide-react"
import type { Mission } from "@/lib/types"

interface MissionStatusTimelineProps {
  mission: Mission
}

interface StatusEvent {
  id: string
  timestamp: string
  status: string
  message: string
  type: "info" | "success" | "warning" | "error"
}

export function MissionStatusTimeline({ mission }: MissionStatusTimelineProps) {
  const [statusEvents, setStatusEvents] = useState<StatusEvent[]>([])

  useEffect(() => {
    // Initialize with mission creation event
    const initialEvents: StatusEvent[] = [
      {
        id: "created",
        timestamp: mission.startTime,
        status: "created",
        message: "Mission created and scheduled",
        type: "info",
      },
    ]

    // Add status-based events
    if (mission.status === "in-progress") {
      initialEvents.push({
        id: "started",
        timestamp: mission.startTime,
        status: "started",
        message: "Mission started - Drone deployed",
        type: "success",
      })
    }

    if (mission.status === "completed") {
      initialEvents.push(
        {
          id: "started",
          timestamp: mission.startTime,
          status: "started",
          message: "Mission started - Drone deployed",
          type: "success",
        },
        {
          id: "completed",
          timestamp: mission.actualEndTime || mission.estimatedEndTime,
          status: "completed",
          message: "Mission completed successfully",
          type: "success",
        },
      )
    }

    if (mission.status === "paused") {
      initialEvents.push(
        {
          id: "started",
          timestamp: mission.startTime,
          status: "started",
          message: "Mission started - Drone deployed",
          type: "success",
        },
        {
          id: "paused",
          timestamp: new Date().toISOString(),
          status: "paused",
          message: "Mission paused by operator",
          type: "warning",
        },
      )
    }

    if (mission.status === "aborted") {
      initialEvents.push(
        {
          id: "started",
          timestamp: mission.startTime,
          status: "started",
          message: "Mission started - Drone deployed",
          type: "success",
        },
        {
          id: "aborted",
          timestamp: mission.actualEndTime || new Date().toISOString(),
          status: "aborted",
          message: "Mission aborted - Drone returning to base",
          type: "error",
        },
      )
    }

    // Add progress milestones for active missions
    if (mission.status === "in-progress") {
      const progressMilestones = [25, 50, 75]
      progressMilestones.forEach((milestone) => {
        if (mission.progress >= milestone) {
          initialEvents.push({
            id: `progress-${milestone}`,
            timestamp: new Date(
              new Date(mission.startTime).getTime() + (milestone / 100) * mission.estimatedDuration * 60000,
            ).toISOString(),
            status: "progress",
            message: `${milestone}% mission progress completed`,
            type: "info",
          })
        }
      })
    }

    // Add weather warnings if applicable
    if (mission.weatherConditions.windSpeed > 10) {
      initialEvents.push({
        id: "weather-warning",
        timestamp: new Date().toISOString(),
        status: "weather",
        message: `High wind warning: ${mission.weatherConditions.windSpeed} km/h`,
        type: "warning",
      })
    }

    // Sort events by timestamp
    initialEvents.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    setStatusEvents(initialEvents)
  }, [mission])

  const getEventIcon = (status: string, type: string) => {
    switch (status) {
      case "created":
        return <Clock className="h-4 w-4" />
      case "started":
        return <Play className="h-4 w-4" />
      case "paused":
        return <Pause className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "aborted":
        return <Square className="h-4 w-4" />
      case "weather":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-600 bg-green-100"
      case "warning":
        return "text-yellow-600 bg-yellow-100"
      case "error":
        return "text-red-600 bg-red-100"
      default:
        return "text-blue-600 bg-blue-100"
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mission Timeline</CardTitle>
        <CardDescription>Real-time status updates and events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statusEvents.map((event, index) => (
            <div key={event.id} className="flex items-start gap-4">
              <div className={`p-2 rounded-full ${getEventColor(event.type)}`}>
                {getEventIcon(event.status, event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">{event.message}</p>
                  <Badge variant="outline" className="text-xs">
                    {event.status}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">{formatTimestamp(event.timestamp)}</p>
              </div>
              {index < statusEvents.length - 1 && <div className="absolute left-6 mt-8 w-px h-8 bg-gray-200" />}
            </div>
          ))}

          {/* Live indicator for active missions */}
          {mission.status === "in-progress" && (
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-green-100 text-green-600 animate-pulse">
                <div className="w-4 h-4 bg-green-500 rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Mission in progress...</p>
                <p className="text-xs text-gray-500">Live updates every 2 seconds</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
