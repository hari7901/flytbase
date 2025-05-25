"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Activity, MapPin, AlertTriangle, CheckCircle, Clock, Zap, Play, Pause, Square } from "lucide-react"
import Link from "next/link"
import { useDrones, useMissions } from "@/hooks/use-firebase-data"
import { LeafletMap } from "@/components/leaflet-map"
import type { Mission } from "@/lib/types"

export default function RealTimeMonitoring() {
  const { drones, loading: dronesLoading } = useDrones()
  const { missions, loading: missionsLoading, updateMission } = useMissions()
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [realTimePosition, setRealTimePosition] = useState<{ lat: number; lng: number } | null>(null)
  const [flightPath, setFlightPath] = useState<{ lat: number; lng: number }[]>([])

  // Auto-select first active mission
  useEffect(() => {
    if (missions.length > 0 && !selectedMission) {
      const activeMission = missions.find((m) => m.status === "in-progress") || missions[0]
      setSelectedMission(activeMission)
    }
  }, [missions, selectedMission])

  // Simulate real-time position updates
  useEffect(() => {
    if (selectedMission && selectedMission.status === "in-progress") {
      const interval = setInterval(() => {
        // Generate realistic movement within survey area
        const baseCoords = selectedMission.surveyArea?.[0] || { lat: 40.7128, lng: -74.006 }
        const progress = selectedMission.progress / 100

        // Simulate movement along survey pattern
        const latOffset = (Math.random() - 0.5) * 0.002 * (1 + progress)
        const lngOffset = (Math.random() - 0.5) * 0.002 * (1 + progress)

        const newPosition = {
          lat: baseCoords.lat + latOffset,
          lng: baseCoords.lng + lngOffset,
        }

        setRealTimePosition(newPosition)
        setFlightPath((prev) => [...prev.slice(-20), newPosition]) // Keep last 20 positions
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [selectedMission])

  // Auto-refresh data
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        // Update mission progress simulation
        if (selectedMission && selectedMission.status === "in-progress") {
          const newProgress = Math.min(selectedMission.progress + Math.random() * 2, 100)
          setSelectedMission((prev) => (prev ? { ...prev, progress: newProgress } : null))
        }
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [autoRefresh, selectedMission])

  const handleMissionControl = async (action: string) => {
    if (!selectedMission) return

    try {
      let updates: Partial<Mission> = {}

      switch (action) {
        case "start":
          updates = {
            status: "in-progress",
            startTime: new Date().toISOString(),
            progress: 0,
          }
          break
        case "pause":
          updates = { status: "paused" }
          break
        case "resume":
          updates = { status: "in-progress" }
          break
        case "abort":
          updates = {
            status: "aborted",
            actualEndTime: new Date().toISOString(),
          }
          break
      }

      await updateMission(selectedMission.id, updates)
      setSelectedMission((prev) => (prev ? { ...prev, ...updates } : null))
    } catch (error) {
      console.error("Failed to update mission:", error)
      alert("Failed to update mission. Please try again.")
    }
  }

  const filteredMissions = missions.filter((mission) => {
    if (filterStatus === "all") return true
    if (filterStatus === "active") return mission.status === "in-progress"
    if (filterStatus === "scheduled") return mission.status === "scheduled"
    if (filterStatus === "completed") return mission.status === "completed"
    return mission.status === filterStatus
  })

  const activeMissions = missions.filter((m) => m.status === "in-progress")
  const scheduledMissions = missions.filter((m) => m.status === "scheduled")
  const completedToday = missions.filter((m) => m.status === "completed")

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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "in-progress":
        return "default"
      case "scheduled":
        return "secondary"
      case "paused":
        return "destructive"
      case "aborted":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (dronesLoading || missionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading real-time monitoring...</p>
        </div>
      </div>
    )
  }

  const selectedDrone = selectedMission ? drones.find((d) => d.id === selectedMission.droneId) : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Activity className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Real-Time Mission Monitoring</h1>
                  <p className="text-sm text-gray-500">Live flight tracking and mission control</p>
                </div>
              </Link>
            </div>
            <nav className="flex space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/fleet" className="text-gray-600 hover:text-gray-900">
                Fleet
              </Link>
              <Link href="/missions" className="text-gray-600 hover:text-gray-900">
                Missions
              </Link>
              <Link href="/planning" className="text-gray-600 hover:text-gray-900">
                Planning
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Real-Time Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Active Missions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{activeMissions.length}</div>
              <div className="text-xs text-gray-500">Currently in progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Scheduled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{scheduledMissions.length}</div>
              <div className="text-xs text-gray-500">Awaiting start</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Completed Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedToday.length}</div>
              <div className="text-xs text-gray-500">Successfully finished</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{autoRefresh ? "LIVE" : "PAUSED"}</div>
              <div className="text-xs text-gray-500">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className="h-auto p-0 text-xs"
                >
                  {autoRefresh ? "Pause" : "Resume"} updates
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Mission List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Mission Control</CardTitle>
                <CardDescription>Select a mission to monitor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter missions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Missions</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredMissions.map((mission) => (
                    <div
                      key={mission.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedMission?.id === mission.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
                      }`}
                      onClick={() => setSelectedMission(mission)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(mission.status)}`} />
                          <span className="font-medium text-sm truncate">{mission.name}</span>
                        </div>
                        <Badge variant={getStatusBadgeVariant(mission.status)} className="text-xs">
                          {mission.status.replace("-", " ")}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>{mission.droneName}</div>
                        <div>{mission.location}</div>
                        {mission.status === "in-progress" && (
                          <div className="flex items-center gap-1">
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div
                                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                                style={{ width: `${mission.progress}%` }}
                              />
                            </div>
                            <span className="text-xs">{Math.round(mission.progress)}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Real-Time Map and Controls */}
          <div className="lg:col-span-3">
            {selectedMission ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        {selectedMission.name}
                      </CardTitle>
                      <CardDescription>
                        {selectedDrone?.name} • {selectedMission.location}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {selectedMission.status === "scheduled" && (
                        <Button size="sm" onClick={() => handleMissionControl("start")}>
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      )}
                      {selectedMission.status === "in-progress" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleMissionControl("pause")}>
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleMissionControl("abort")}>
                            <Square className="h-4 w-4 mr-1" />
                            Abort
                          </Button>
                        </>
                      )}
                      {selectedMission.status === "paused" && (
                        <Button size="sm" onClick={() => handleMissionControl("resume")}>
                          <Play className="h-4 w-4 mr-1" />
                          Resume
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Mission Progress */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{Math.round(selectedMission.progress)}%</div>
                        <div className="text-sm text-gray-500">Progress</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedMission.estimatedDuration -
                            Math.round((selectedMission.progress / 100) * selectedMission.estimatedDuration)}
                        </div>
                        <div className="text-sm text-gray-500">Minutes Left</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{selectedDrone?.batteryLevel || 85}%</div>
                        <div className="text-sm text-gray-500">Battery</div>
                      </div>
                    </div>

                    {/* Interactive Map */}
                    <LeafletMap
                      center={selectedMission.surveyArea?.[0] || { lat: 40.7128, lng: -74.006 }}
                      zoom={16}
                      height="400px"
                      mode="view"
                      initialArea={selectedMission.surveyArea || []}
                      realTimePosition={realTimePosition}
                      flightPath={flightPath}
                      showControls={false}
                    />

                    {/* Mission Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Altitude:</span> {selectedMission.altitude}m
                      </div>
                      <div>
                        <span className="font-medium">Pattern:</span> {selectedMission.pattern}
                      </div>
                      <div>
                        <span className="font-medium">Overlap:</span> {selectedMission.overlap}%
                      </div>
                      <div>
                        <span className="font-medium">Weather:</span>{" "}
                        {selectedMission.weatherConditions?.condition || "Clear"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-16">
                  <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Mission Selected</h3>
                  <p className="text-gray-500">Select a mission from the list to view real-time monitoring</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* System Alerts */}
        {activeMissions.some((m) => m.weatherConditions?.windSpeed && m.weatherConditions.windSpeed > 10) && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <AlertTriangle className="h-5 w-5" />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeMissions
                  .filter((m) => m.weatherConditions?.windSpeed && m.weatherConditions.windSpeed > 10)
                  .map((mission) => (
                    <div key={mission.id} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <div className="flex-1">
                        <div className="font-medium">High Wind Warning</div>
                        <div className="text-sm text-gray-600">
                          {mission.name} - Wind speed: {mission.weatherConditions?.windSpeed} km/h
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setSelectedMission(mission)}>
                        Monitor
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
