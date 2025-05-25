"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { MapPin, Navigation, Zap, Play, Pause, Square, AlertTriangle, Clock } from "lucide-react"
import type { Mission, Drone } from "@/lib/types"

interface RealTimeMapProps {
  mission: Mission
  drone?: Drone
  onMissionControl: (action: string) => void
}

interface FlightPathPoint {
  lat: number
  lng: number
  timestamp: number
  altitude: number
  speed: number
  battery: number
}

export function RealTimeMap({ mission, drone, onMissionControl }: RealTimeMapProps) {
  const [currentPosition, setCurrentPosition] = useState(mission.coordinates[0])
  const [flightPath, setFlightPath] = useState<FlightPathPoint[]>([])
  const [telemetryData, setTelemetryData] = useState({
    altitude: mission.altitude,
    speed: mission.speed,
    heading: 0,
    battery: drone?.battery || 100,
    signal: "Strong",
    gpsAccuracy: "±1m",
  })
  const [missionStats, setMissionStats] = useState({
    timeElapsed: 0,
    timeRemaining: mission.estimatedDuration,
    distanceCovered: 0,
    distanceRemaining: mission.estimatedDistance,
    waypointsCompleted: 0,
    totalWaypoints: mission.coordinates.length,
  })

  const mapRef = useRef<HTMLDivElement>(null)

  // Simulate real-time flight path updates
  useEffect(() => {
    if (mission.status === "in-progress") {
      const interval = setInterval(() => {
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

          const newFlightPoint: FlightPathPoint = {
            ...newPosition,
            timestamp: Date.now(),
            altitude: telemetryData.altitude + (Math.random() - 0.5) * 5,
            speed: telemetryData.speed + (Math.random() - 0.5) * 2,
            battery: Math.max(10, telemetryData.battery - 0.1),
          }

          setCurrentPosition(newPosition)
          setFlightPath((prev) => [...prev.slice(-50), newFlightPoint]) // Keep last 50 positions

          // Update telemetry
          setTelemetryData((prev) => ({
            ...prev,
            altitude: newFlightPoint.altitude,
            speed: newFlightPoint.speed,
            battery: newFlightPoint.battery,
            heading: (prev.heading + Math.random() * 10 - 5) % 360,
          }))

          // Update mission stats
          setMissionStats((prev) => ({
            ...prev,
            timeElapsed: prev.timeElapsed + 2,
            timeRemaining: Math.max(0, prev.timeRemaining - 2),
            distanceCovered: progress * mission.estimatedDistance,
            distanceRemaining: (1 - progress) * mission.estimatedDistance,
            waypointsCompleted: Math.floor(progress * mission.coordinates.length),
          }))
        }
      }, 2000) // Update every 2 seconds

      return () => clearInterval(interval)
    }
  }, [mission, telemetryData.altitude, telemetryData.speed, telemetryData.battery])

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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      {/* Mission Control Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${getStatusColor(mission.status)} animate-pulse`} />
              <div>
                <CardTitle className="text-lg">{mission.name}</CardTitle>
                <CardDescription>
                  {mission.droneName} • {mission.surveyType} • Priority: {mission.priority}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {mission.status.replace("-", " ")}
              </Badge>
              <Badge variant="secondary">{Math.round(mission.progress)}% Complete</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Mission Progress</span>
                <span>{Math.round(mission.progress)}%</span>
              </div>
              <Progress value={mission.progress} className="h-3" />
            </div>

            {/* Mission Control Buttons */}
            <div className="flex gap-2">
              {mission.status === "scheduled" && (
                <Button onClick={() => onMissionControl("start")} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Start Mission
                </Button>
              )}
              {mission.status === "in-progress" && (
                <>
                  <Button onClick={() => onMissionControl("pause")} variant="outline" className="flex-1">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                  <Button onClick={() => onMissionControl("abort")} variant="destructive" className="flex-1">
                    <Square className="h-4 w-4 mr-2" />
                    Abort
                  </Button>
                </>
              )}
              {mission.status === "paused" && (
                <>
                  <Button onClick={() => onMissionControl("resume")} className="flex-1">
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                  <Button onClick={() => onMissionControl("abort")} variant="destructive" className="flex-1">
                    <Square className="h-4 w-4 mr-2" />
                    Abort
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Flight Map */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Live Flight Path
              </CardTitle>
              <CardDescription>Real-time drone position and flight path visualization</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                ref={mapRef}
                className="relative h-96 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden"
              >
                {/* Map Background Grid */}
                <div className="absolute inset-0 opacity-20">
                  <svg width="100%" height="100%">
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#94a3b8" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>

                {/* Planned Waypoints */}
                {mission.coordinates.map((coord, index) => (
                  <div
                    key={`waypoint-${index}`}
                    className={`absolute w-3 h-3 rounded-full border-2 border-white shadow-md ${
                      index <= missionStats.waypointsCompleted ? "bg-green-500" : "bg-blue-400"
                    }`}
                    style={{
                      left: `${10 + (index / (mission.coordinates.length - 1)) * 80}%`,
                      top: `${20 + Math.sin(index * 0.8) * 30 + Math.cos(index * 0.5) * 20}%`,
                    }}
                    title={`Waypoint ${index + 1}`}
                  />
                ))}

                {/* Flight Path Trail */}
                {flightPath.length > 1 && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <path
                      d={`M ${flightPath
                        .map((point, index) => {
                          const x = 10 + (index / (flightPath.length - 1)) * 80
                          const y = 20 + Math.sin(index * 0.1) * 30 + Math.cos(index * 0.05) * 20
                          return `${x}% ${y}%`
                        })
                        .join(" L ")}`}
                      stroke="#3b82f6"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="5,5"
                      className="animate-pulse"
                    />
                  </svg>
                )}

                {/* Current Drone Position */}
                {mission.status === "in-progress" && (
                  <div
                    className="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-2000 ease-linear"
                    style={{
                      left: `${10 + (mission.progress / 100) * 80}%`,
                      top: `${20 + Math.sin((mission.progress / 100) * 10) * 30 + Math.cos((mission.progress / 100) * 5) * 20}%`,
                    }}
                  >
                    <div className="relative">
                      <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping" />
                      <Navigation
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-3 w-3 text-white"
                        style={{ transform: `translate(-50%, -50%) rotate(${telemetryData.heading}deg)` }}
                      />
                    </div>
                  </div>
                )}

                {/* Mission Area Overlay */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md">
                  <div className="text-xs space-y-1">
                    <div className="font-medium">Mission Area</div>
                    <div>Pattern: {mission.flightPattern}</div>
                    <div>Altitude: {Math.round(telemetryData.altitude)}m</div>
                    <div>Coverage: {mission.overlap}%</div>
                  </div>
                </div>

                {/* Real-time Position Info */}
                {mission.status === "in-progress" && (
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md">
                    <div className="text-xs space-y-1">
                      <div className="font-medium">Live Position</div>
                      <div>Lat: {currentPosition.lat.toFixed(6)}</div>
                      <div>Lng: {currentPosition.lng.toFixed(6)}</div>
                      <div>Speed: {telemetryData.speed.toFixed(1)} m/s</div>
                    </div>
                  </div>
                )}

                {/* Status Indicators */}
                <div className="absolute top-4 right-4 space-y-2">
                  {mission.status === "in-progress" && (
                    <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium animate-pulse">
                      LIVE
                    </div>
                  )}
                  {mission.status === "paused" && (
                    <div className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">PAUSED</div>
                  )}
                  {mission.weatherConditions.windSpeed > 10 && (
                    <div className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      HIGH WIND
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mission Stats and Telemetry */}
        <div className="space-y-6">
          {/* Mission Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Mission Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Time Elapsed</div>
                  <div className="font-medium">{formatTime(missionStats.timeElapsed)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Time Remaining</div>
                  <div className="font-medium">{formatTime(missionStats.timeRemaining)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Distance Covered</div>
                  <div className="font-medium">{missionStats.distanceCovered.toFixed(1)} km</div>
                </div>
                <div>
                  <div className="text-gray-500">Distance Remaining</div>
                  <div className="font-medium">{missionStats.distanceRemaining.toFixed(1)} km</div>
                </div>
                <div>
                  <div className="text-gray-500">Waypoints</div>
                  <div className="font-medium">
                    {missionStats.waypointsCompleted}/{missionStats.totalWaypoints}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Completion</div>
                  <div className="font-medium">{Math.round(mission.progress)}%</div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-gray-500 mb-2">Progress Breakdown</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Flight Path</span>
                    <span>{Math.round(mission.progress)}%</span>
                  </div>
                  <Progress value={mission.progress} className="h-2" />
                  <div className="flex justify-between text-xs">
                    <span>Data Collection</span>
                    <span>{Math.round(mission.progress * 0.9)}%</span>
                  </div>
                  <Progress value={mission.progress * 0.9} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Telemetry */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Live Telemetry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Altitude</div>
                  <div className="font-medium">{Math.round(telemetryData.altitude)}m</div>
                </div>
                <div>
                  <div className="text-gray-500">Speed</div>
                  <div className="font-medium">{telemetryData.speed.toFixed(1)} m/s</div>
                </div>
                <div>
                  <div className="text-gray-500">Heading</div>
                  <div className="font-medium">{Math.round(telemetryData.heading)}°</div>
                </div>
                <div>
                  <div className="text-gray-500">Battery</div>
                  <div
                    className={`font-medium ${
                      telemetryData.battery > 60
                        ? "text-green-600"
                        : telemetryData.battery > 30
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {Math.round(telemetryData.battery)}%
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Signal</div>
                  <div className="font-medium text-green-600">{telemetryData.signal}</div>
                </div>
                <div>
                  <div className="text-gray-500">GPS Accuracy</div>
                  <div className="font-medium">{telemetryData.gpsAccuracy}</div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-gray-500 mb-2">Battery Level</div>
                <Progress
                  value={telemetryData.battery}
                  className={`h-3 ${
                    telemetryData.battery > 60
                      ? "[&>div]:bg-green-500"
                      : telemetryData.battery > 30
                        ? "[&>div]:bg-yellow-500"
                        : "[&>div]:bg-red-500"
                  }`}
                />
                <div className="flex justify-between text-xs mt-1">
                  <span>0%</span>
                  <span>{Math.round(telemetryData.battery)}%</span>
                  <span>100%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weather Conditions */}
          <Card>
            <CardHeader>
              <CardTitle>Weather Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Temperature</span>
                <span>{mission.weatherConditions.temperature}°C</span>
              </div>
              <div className="flex justify-between">
                <span>Wind Speed</span>
                <span
                  className={mission.weatherConditions.windSpeed > 10 ? "text-yellow-600 font-medium" : "text-gray-600"}
                >
                  {mission.weatherConditions.windSpeed} km/h
                </span>
              </div>
              <div className="flex justify-between">
                <span>Visibility</span>
                <span>{mission.weatherConditions.visibility}</span>
              </div>
              <div className="flex justify-between">
                <span>Precipitation</span>
                <span>{mission.weatherConditions.precipitation}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
