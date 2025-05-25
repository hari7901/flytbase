"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { LeafletMap } from "./leaflet-map"
import { Navigation, ArrowUp, ArrowDown, Trash2, RotateCcw } from "lucide-react"

interface WaypointEditorProps {
  surveyArea: { lat: number; lng: number }[]
  flightPattern: string
  altitude: number
  overlap: number
  onWaypointsChange?: (waypoints: { lat: number; lng: number; id: string; action: string }[]) => void
}

export function WaypointEditor({
  surveyArea,
  flightPattern,
  altitude,
  overlap,
  onWaypointsChange,
}: WaypointEditorProps) {
  const [waypoints, setWaypoints] = useState<{ lat: number; lng: number; id: string; action: string }[]>([])
  const [selectedWaypoint, setSelectedWaypoint] = useState<string | null>(null)

  const waypointActions = [
    { id: "photo", name: "Take Photo", description: "Capture high-resolution image" },
    { id: "video", name: "Record Video", description: "Start video recording" },
    { id: "hover", name: "Hover", description: "Maintain position for detailed scan" },
    { id: "scan", name: "360° Scan", description: "Perform panoramic capture" },
  ]

  // Calculate center of survey area
  const getAreaCenter = () => {
    if (surveyArea.length === 0) return { lat: 40.7128, lng: -74.006 }

    const avgLat = surveyArea.reduce((sum, coord) => sum + coord.lat, 0) / surveyArea.length
    const avgLng = surveyArea.reduce((sum, coord) => sum + coord.lng, 0) / surveyArea.length
    return { lat: avgLat, lng: avgLng }
  }

  const handleWaypointsChange = (newWaypoints: { lat: number; lng: number; id: string }[]) => {
    const waypointsWithActions = newWaypoints.map((wp) => ({
      ...wp,
      action: waypoints.find((existing) => existing.id === wp.id)?.action || "photo",
    }))
    setWaypoints(waypointsWithActions)
    onWaypointsChange?.(waypointsWithActions)
  }

  const updateWaypointAction = (waypointId: string, action: string) => {
    const updatedWaypoints = waypoints.map((wp) => (wp.id === waypointId ? { ...wp, action } : wp))
    setWaypoints(updatedWaypoints)
    onWaypointsChange?.(updatedWaypoints)
  }

  const moveWaypoint = (waypointId: string, direction: "up" | "down") => {
    const currentIndex = waypoints.findIndex((wp) => wp.id === waypointId)
    if (currentIndex === -1) return

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= waypoints.length) return

    const updatedWaypoints = [...waypoints]
    const [movedWaypoint] = updatedWaypoints.splice(currentIndex, 1)
    updatedWaypoints.splice(newIndex, 0, movedWaypoint)

    setWaypoints(updatedWaypoints)
    onWaypointsChange?.(updatedWaypoints)
  }

  const removeWaypoint = (waypointId: string) => {
    const updatedWaypoints = waypoints.filter((wp) => wp.id !== waypointId)
    setWaypoints(updatedWaypoints)
    onWaypointsChange?.(updatedWaypoints)
  }

  const optimizeRoute = () => {
    if (waypoints.length < 3) return

    // Simple nearest neighbor optimization
    const optimized = [waypoints[0]]
    const remaining = waypoints.slice(1)

    while (remaining.length > 0) {
      const current = optimized[optimized.length - 1]
      let nearestIndex = 0
      let nearestDistance = Number.MAX_VALUE

      remaining.forEach((wp, index) => {
        const distance = Math.sqrt(Math.pow(current.lat - wp.lat, 2) + Math.pow(current.lng - wp.lng, 2))
        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestIndex = index
        }
      })

      optimized.push(remaining[nearestIndex])
      remaining.splice(nearestIndex, 1)
    }

    setWaypoints(optimized)
    onWaypointsChange?.(optimized)
  }

  const estimateFlightTime = () => {
    if (waypoints.length === 0) return 0

    // Estimate based on waypoints, actions, and flight pattern
    const baseTime = waypoints.length * 30 // 30 seconds per waypoint
    const actionTime = waypoints.reduce((total, wp) => {
      switch (wp.action) {
        case "video":
          return total + 60
        case "hover":
          return total + 45
        case "scan":
          return total + 90
        default:
          return total + 15
      }
    }, 0)

    return Math.ceil((baseTime + actionTime) / 60) // Convert to minutes
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Waypoint Editor
          </CardTitle>
          <CardDescription>Define flight waypoints and actions for your survey mission</CardDescription>
        </CardHeader>
        <CardContent>
          <LeafletMap
            center={getAreaCenter()}
            zoom={15}
            height="400px"
            mode="waypoints"
            onWaypointsChange={handleWaypointsChange}
            initialArea={surveyArea}
            initialWaypoints={waypoints}
            showControls={true}
          />
        </CardContent>
      </Card>

      {waypoints.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Flight Plan Configuration</CardTitle>
            <CardDescription>Configure actions and optimize the flight route</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Badge variant="outline">{waypoints.length} Waypoints</Badge>
                  <Badge variant="outline">~{estimateFlightTime()} min flight</Badge>
                  <Badge variant="outline">{altitude}m altitude</Badge>
                </div>
                <Button onClick={optimizeRoute} size="sm" variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Optimize Route
                </Button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {waypoints.map((waypoint, index) => (
                  <div
                    key={waypoint.id}
                    className={`p-3 border rounded-lg ${
                      selectedWaypoint === waypoint.id ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    }`}
                    onClick={() => setSelectedWaypoint(waypoint.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">Waypoint {index + 1}</div>
                          <div className="text-sm text-gray-500">
                            {waypoint.lat.toFixed(6)}, {waypoint.lng.toFixed(6)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Select
                          value={waypoint.action}
                          onValueChange={(value) => updateWaypointAction(waypoint.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {waypointActions.map((action) => (
                              <SelectItem key={action.id} value={action.id}>
                                {action.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => moveWaypoint(waypoint.id, "up")}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => moveWaypoint(waypoint.id, "down")}
                            disabled={index === waypoints.length - 1}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => removeWaypoint(waypoint.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      {waypointActions.find((a) => a.id === waypoint.action)?.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
