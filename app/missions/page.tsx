"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, MapPin, Play, Pause, Square, Eye } from "lucide-react"
import Link from "next/link"
import { useMissions } from "@/hooks/use-firebase-data"
import type { Mission } from "@/lib/types"

export default function MissionMonitoring() {
  const { missions, loading, error, updateMission } = useMissions()
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)

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

  const handleMissionAction = async (missionId: string, action: string) => {
    try {
      switch (action) {
        case "start":
          await updateMission(missionId, { status: "in-progress" })
          break
        case "pause":
          await updateMission(missionId, { status: "paused" })
          break
        case "resume":
          await updateMission(missionId, { status: "in-progress" })
          break
        case "abort":
          await updateMission(missionId, { status: "aborted" })
          break
      }
    } catch (err) {
      console.error("Failed to update mission:", err)
    }
  }

  const activeMissions = missions.filter((m) => m.status === "in-progress")
  const scheduledMissions = missions.filter((m) => m.status === "scheduled")
  const completedMissions = missions.filter((m) => m.status === "completed")

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading missions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading missions: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Activity className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Mission Monitoring</h1>
              </Link>
            </div>
            <nav className="flex space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/fleet" className="text-gray-600 hover:text-gray-900">
                Fleet
              </Link>
              <Link href="/planning" className="text-gray-600 hover:text-gray-900">
                Planning
              </Link>
              <Link href="/reports" className="text-gray-600 hover:text-gray-900">
                Reports
              </Link>
              <Link href="/monitoring" className="text-gray-600 hover:text-gray-900">
                Live Monitor
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mission Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{activeMissions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{scheduledMissions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedMissions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Missions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{missions.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mission List */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="active" className="space-y-6">
              <TabsList>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="all">All Missions</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-4">
                {activeMissions.map((mission) => (
                  <Card
                    key={mission.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedMission(mission)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(mission.status)}`} />
                          <div>
                            <CardTitle className="text-lg">{mission.name}</CardTitle>
                            <CardDescription>
                              {mission.droneName} • {mission.location}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(mission.status)} className="capitalize">
                          {mission.status.replace("-", " ")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(mission.progress)}%</span>
                        </div>
                        <Progress value={mission.progress} className="h-2" />
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Started: {mission.startTime}</span>
                        <span>ETA: {mission.estimatedEndTime}</span>
                      </div>
                      <div className="flex space-x-2">
                        {mission.status === "in-progress" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMissionAction(mission.id, "pause")
                              }}
                            >
                              <Pause className="h-4 w-4 mr-1" />
                              Pause
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMissionAction(mission.id, "abort")
                              }}
                            >
                              <Square className="h-4 w-4 mr-1" />
                              Abort
                            </Button>
                          </>
                        )}
                        {mission.status === "paused" && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMissionAction(mission.id, "resume")
                            }}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Resume
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {activeMissions.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <p className="text-gray-500">No active missions</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="scheduled" className="space-y-4">
                {scheduledMissions.map((mission) => (
                  <Card
                    key={mission.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedMission(mission)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(mission.status)}`} />
                          <div>
                            <CardTitle className="text-lg">{mission.name}</CardTitle>
                            <CardDescription>
                              {mission.droneName} • {mission.location}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(mission.status)} className="capitalize">
                          {mission.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm text-gray-600 mb-4">
                        <span>Scheduled: {mission.startTime}</span>
                        <span>Duration: {mission.estimatedEndTime}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMissionAction(mission.id, "start")
                        }}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                {completedMissions.map((mission) => (
                  <Card
                    key={mission.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedMission(mission)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(mission.status)}`} />
                          <div>
                            <CardTitle className="text-lg">{mission.name}</CardTitle>
                            <CardDescription>
                              {mission.droneName} • {mission.location}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(mission.status)} className="capitalize">
                          {mission.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Completed: {mission.actualEndTime || mission.estimatedEndTime}</span>
                        <span>Duration: {mission.estimatedEndTime}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="all" className="space-y-4">
                {missions.map((mission) => (
                  <Card
                    key={mission.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedMission(mission)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(mission.status)}`} />
                          <div>
                            <CardTitle className="text-lg">{mission.name}</CardTitle>
                            <CardDescription>
                              {mission.droneName} • {mission.location}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(mission.status)} className="capitalize">
                          {mission.status.replace("-", " ")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {mission.status === "in-progress" && (
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{Math.round(mission.progress)}%</span>
                          </div>
                          <Progress value={mission.progress} className="h-2" />
                        </div>
                      )}
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Start: {mission.startTime}</span>
                        <span>
                          {mission.status === "completed"
                            ? `Completed: ${mission.actualEndTime}`
                            : `ETA: ${mission.estimatedEndTime}`}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          {/* Mission Details */}
          <div>
            {selectedMission ? (
              <Card>
                <CardHeader>
                  <CardTitle>Mission Details</CardTitle>
                  <CardDescription>{selectedMission.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedMission.status)}`} />
                      <span className="text-sm capitalize">{selectedMission.status.replace("-", " ")}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Drone</label>
                    <p className="text-sm text-gray-600">
                      {selectedMission.droneName} ({selectedMission.droneId})
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Survey Type</label>
                    <p className="text-sm text-gray-600">{selectedMission.surveyType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <p className="text-sm text-gray-600">{selectedMission.location}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Flight Pattern</label>
                    <p className="text-sm text-gray-600">{selectedMission.flightPattern}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Altitude</label>
                    <p className="text-sm text-gray-600">{selectedMission.altitude}m</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Sensors</label>
                    <p className="text-sm text-gray-600">{selectedMission.sensors.join(", ")}</p>
                  </div>
                  {selectedMission.status === "in-progress" && (
                    <div>
                      <label className="text-sm font-medium">Progress</label>
                      <div className="mt-2">
                        <Progress value={selectedMission.progress} className="h-2" />
                        <p className="text-sm text-gray-600 mt-1">{Math.round(selectedMission.progress)}% complete</p>
                      </div>
                    </div>
                  )}
                  <div className="pt-4 border-t">
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Real-time Flight Path</p>
                      <p className="text-sm text-gray-400">Live map tracking would be displayed here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a mission to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
