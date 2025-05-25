"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Zap } from "lucide-react"
import type { Mission, Drone } from "@/lib/types"

interface MissionMapProps {
  mission: Mission
  drone?: Drone
  showRealTime?: boolean
}

export function MissionMap({ mission, drone, showRealTime = false }: MissionMapProps) {
  const [currentPosition, setCurrentPosition] = useState(mission.coordinates[0])
  const [flightPath, setFlightPath] = useState<{ lat: number; lng: number }[]>([])

  // Simulate real-time flight path updates
  useEffect(() => {
    if (showRealTime && mission.status === "in-progress") {
      const interval = setInterval(() => {
        // Simulate drone movement along the mission path
        const progress = mission.progress / 100
        const totalPoints = mission.coordinates.length
        const currentIndex = Math.floor(progress * (totalPoints - 1))

        if (currentIndex < totalPoints - 1) {
          const start = mission.coordinates[currentIndex]
          const end = mission.coordinates[currentIndex + 1]
          const segmentProgress = progress * (totalPoints - 1) - currentIndex

          const newPosition = {
            lat: start.lat + (end.lat - start.lat) * segmentProgress,
            lng: start.lng + (end.lng - start.lng) * segmentProgress,
          }

          setCurrentPosition(newPosition)
          setFlightPath((prev) => [...prev.slice(-20), newPosition]) // Keep last 20 positions
        }
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [mission, showRealTime])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "in-progress":
        return "bg-blue-500"
      case "scheduled":
        return "bg-yellow-500"
      case "paused":
        return "bg-orange-500"
      case "aborted":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Mission Flight Path
        </CardTitle>
        <CardDescription>
          {showRealTime ? "Real-time tracking" : "Planned route"} for {mission.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Mission Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(mission.status)}`} />
              <span className="font-medium capitalize">{mission.status.replace("-", " ")}</span>
            </div>
            <Badge variant="outline">{Math.round(mission.progress)}% Complete</Badge>
          </div>

          {/* Map Placeholder */}
          <div className="relative h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 font-medium">Interactive Map View</p>
              <p className="text-sm text-gray-400">Real-time flight path visualization would be displayed here</p>
              {showRealTime && (
                <div className="mt-2 text-xs text-blue-600">
                  Live Position: {currentPosition.lat.toFixed(6)}, {currentPosition.lng.toFixed(6)}
                </div>
              )}
            </div>

            {/* Simulated waypoints overlay */}
            <div className="absolute inset-4">
              {mission.coordinates.map((coord, index) => (
                <div
                  key={index}
                  className="absolute w-2 h-2 bg-blue-500 rounded-full"
                  style={{
                    left: `${(index / (mission.coordinates.length - 1)) * 100}%`,
                    top: `${Math.sin(index * 0.5) * 20 + 50}%`,
                  }}
                />
              ))}

              {/* Current position indicator */}
              {showRealTime && mission.status === "in-progress" && (
                <div
                  className="absolute w-3 h-3 bg-red-500 rounded-full animate-pulse"
                  style={{
                    left: `${(mission.progress / 100) * 100}%`,
                    top: `${Math.sin((mission.progress / 100) * 5) * 20 + 50}%`,
                  }}
                />
              )}
            </div>
          </div>

          {/* Flight Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-gray-500" />
              <span>Altitude: {mission.altitude}m</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-gray-500" />
              <span>Speed: {mission.speed}m/s</span>
            </div>
            <div>
              <span className="text-gray-500">Pattern: </span>
              <span>{mission.flightPattern}</span>
            </div>
            <div>
              <span className="text-gray-500">Distance: </span>
              <span>{mission.estimatedDistance}km</span>
            </div>
          </div>

          {/* Waypoint List */}
          <div>
            <h4 className="font-medium mb-2">Waypoints ({mission.coordinates.length})</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {mission.coordinates.map((coord, index) => (
                <div key={index} className="flex justify-between text-xs bg-gray-50 p-2 rounded">
                  <span>WP{index + 1}</span>
                  <span>
                    {coord.lat.toFixed(6)}, {coord.lng.toFixed(6)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Data */}
          {showRealTime && drone && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Live Telemetry</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Battery: {drone.battery}%</div>
                <div>Signal: Strong</div>
                <div>Wind: {mission.weatherConditions.windSpeed}km/h</div>
                <div>Temp: {mission.weatherConditions.temperature}°C</div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
