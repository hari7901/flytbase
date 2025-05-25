"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { DrillIcon as Drone, MapPin, Battery, Activity, BarChart3, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useDrones, useMissions, useOrganizationStats, useRealTimeSimulation } from "@/hooks/use-firebase-data"
import { initializeDatabase } from "@/lib/firebase-operations"
import { db } from "@/lib/firebase"
import { getConnectionStatus } from "@/lib/firebase"

export default function Dashboard() {
  const { drones, loading: dronesLoading } = useDrones()
  const { missions, loading: missionsLoading } = useMissions()
  const { stats, loading: statsLoading } = useOrganizationStats()

  // Enable real-time simulation
  useRealTimeSimulation()

  // Initialize database on first load
  useEffect(() => {
    initializeDatabase()
  }, [])

  // Calculate real-time stats from Firebase data
  const realTimeStats = {
    totalDrones: drones.length,
    activeMissions: missions.filter((m) => m.status === "in-progress").length,
    scheduledMissions: missions.filter((m) => m.status === "scheduled").length,
    completedMissions: missions.filter((m) => m.status === "completed").length,
    availableDrones: drones.filter((d) => d.status === "available").length,
    dronesInMission: drones.filter((d) => d.status === "in-mission").length,
    dronesCharging: drones.filter((d) => d.status === "charging").length,
    dronesMaintenance: drones.filter((d) => d.status === "maintenance").length,
    averageBattery: drones.length > 0 ? Math.round(drones.reduce((acc, d) => acc + d.battery, 0) / drones.length) : 0,
    totalFlightHours: Math.round(drones.reduce((acc, d) => acc + d.totalFlightTime, 0)),
  }

  const activeMissions = missions.filter((m) => m.status === "in-progress")
  const criticalAlerts = drones.filter((d) => d.battery < 20 || d.status === "maintenance").length

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "in-mission":
        return "bg-blue-500"
      case "charging":
        return "bg-yellow-500"
      case "maintenance":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getMissionStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "in-progress":
        return "bg-blue-500"
      case "scheduled":
        return "bg-yellow-500"
      case "aborted":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const isFirebaseConnected = db && !db._isMock
  const connectionStatus = getConnectionStatus()

  if (dronesLoading || missionsLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard from Firebase...</p>
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
              <Drone className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Drone Survey Management</h1>
                <p className="text-sm text-gray-500">Real-time fleet monitoring and mission control</p>
              </div>
            </div>
            <nav className="flex space-x-4">
              <Link href="/fleet" className="text-gray-600 hover:text-gray-900">
                Fleet
              </Link>
              <Link href="/missions" className="text-gray-600 hover:text-gray-900">
                Missions
              </Link>
              <Link href="/monitoring" className="text-gray-600 hover:text-gray-900">
                Live Monitor
              </Link>
              <Link href="/planning" className="text-gray-600 hover:text-gray-900">
                Planning
              </Link>
              <Link href="/reports" className="text-gray-600 hover:text-gray-900">
                Reports
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Critical Alerts */}
        {criticalAlerts > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800 font-medium">
                {criticalAlerts} drone(s) require attention (low battery or maintenance needed)
              </span>
            </div>
          </div>
        )}

        {/* Real-time Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fleet Status</CardTitle>
              <Drone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realTimeStats.totalDrones}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {realTimeStats.availableDrones} available • {realTimeStats.dronesInMission} in mission
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realTimeStats.activeMissions}</div>
              <div className="text-xs text-muted-foreground mt-1">{realTimeStats.scheduledMissions} scheduled</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realTimeStats.completedMissions}</div>
              <div className="text-xs text-muted-foreground mt-1">{stats?.totalSurveys || 0} total surveys</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fleet Health</CardTitle>
              <Battery className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realTimeStats.averageBattery}%</div>
              <div className="text-xs text-muted-foreground mt-1">
                {realTimeStats.totalFlightHours}h total flight time
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Organization-wide Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Surveys</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSurveys}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Data Collected</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDataPoints.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">{stats.totalImages.toLocaleString()} images</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Distance Covered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDistance.toLocaleString()}km</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageEfficiency}%</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="drones">Fleet Status</TabsTrigger>
            <TabsTrigger value="missions">Active Missions</TabsTrigger>
            <TabsTrigger value="alerts">System Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and operations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/planning">
                    <Button className="w-full justify-start">
                      <MapPin className="mr-2 h-4 w-4" />
                      Plan New Mission
                    </Button>
                  </Link>
                  <Link href="/fleet">
                    <Button variant="outline" className="w-full justify-start">
                      <Drone className="mr-2 h-4 w-4" />
                      Manage Fleet
                    </Button>
                  </Link>
                  <Link href="/reports">
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Reports
                    </Button>
                  </Link>
                  <Link href="/monitoring">
                    <Button variant="outline" className="w-full justify-start">
                      <Activity className="mr-2 h-4 w-4" />
                      Live Monitoring
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Real-time system status from Firebase</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Fleet Availability</span>
                    <Badge variant="secondary">
                      {realTimeStats.availableDrones}/{realTimeStats.totalDrones} Available
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Mission Success Rate</span>
                    <Badge variant="secondary">{stats?.averageEfficiency || 0}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Battery Level</span>
                    <Badge variant="secondary">{realTimeStats.averageBattery}%</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Data Connection</span>
                    <Badge
                      variant="secondary"
                      className={
                        connectionStatus.isConnected ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {connectionStatus.database} {connectionStatus.isConnected ? "Connected" : "Mode"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="drones" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Real-time Fleet Status</CardTitle>
                <CardDescription>Live data from Firebase - updates automatically</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {drones.map((drone) => (
                    <div key={drone.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(drone.status)}`} />
                        <div>
                          <h3 className="font-medium">{drone.name}</h3>
                          <p className="text-sm text-gray-500">
                            {drone.id} • {drone.model}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-sm font-medium">{drone.location}</p>
                          <p className="text-sm text-gray-500 capitalize">{drone.status.replace("-", " ")}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Battery
                            className={`h-4 w-4 ${drone.battery > 60 ? "text-green-600" : drone.battery > 30 ? "text-yellow-600" : "text-red-600"}`}
                          />
                          <span className="text-sm font-medium">{drone.battery}%</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Flight Time</p>
                          <p className="text-sm font-medium">{drone.totalFlightTime}h</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="missions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Missions</CardTitle>
                <CardDescription>Real-time mission monitoring with live progress updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeMissions.length > 0 ? (
                    activeMissions.map((mission) => (
                      <div key={mission.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${getMissionStatusColor(mission.status)}`} />
                            <div>
                              <h3 className="font-medium">{mission.name}</h3>
                              <p className="text-sm text-gray-500">
                                {mission.droneName} • {mission.location}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{mission.priority} priority</Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              ETA: {new Date(mission.estimatedEndTime).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>
                              {Math.round(mission.progress)}% • {mission.estimatedDistance}km
                            </span>
                          </div>
                          <Progress value={mission.progress} className="h-2" />
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-4 text-xs text-gray-600">
                          <div>Pattern: {mission.flightPattern}</div>
                          <div>Altitude: {mission.altitude}m</div>
                          <div>Sensors: {mission.sensors.length}</div>
                          <div>Weather: {mission.weatherConditions.temperature}°C</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No active missions</p>
                      <p className="text-sm">All drones are available for new missions</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>Real-time monitoring alerts and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Low Battery Alerts */}
                  {drones
                    .filter((d) => d.battery < 20)
                    .map((drone) => (
                      <div
                        key={`battery-${drone.id}`}
                        className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                        <div className="flex-1">
                          <p className="font-medium text-red-800">Low Battery Alert</p>
                          <p className="text-sm text-red-600">
                            {drone.name} battery at {drone.battery}% - Return to base recommended
                          </p>
                        </div>
                        <Badge variant="destructive">{drone.battery}%</Badge>
                      </div>
                    ))}

                  {/* Maintenance Alerts */}
                  {drones
                    .filter((d) => d.status === "maintenance")
                    .map((drone) => (
                      <div
                        key={`maintenance-${drone.id}`}
                        className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                      >
                        <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                        <div className="flex-1">
                          <p className="font-medium text-yellow-800">Maintenance Required</p>
                          <p className="text-sm text-yellow-600">
                            {drone.name} scheduled for maintenance - Next service: {drone.nextMaintenance}
                          </p>
                        </div>
                        <Badge variant="outline">Maintenance</Badge>
                      </div>
                    ))}

                  {/* Weather Alerts */}
                  {missions
                    .filter((m) => m.status === "in-progress" && m.weatherConditions.windSpeed > 10)
                    .map((mission) => (
                      <div
                        key={`weather-${mission.id}`}
                        className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <AlertTriangle className="h-5 w-5 text-blue-600 mr-3" />
                        <div className="flex-1">
                          <p className="font-medium text-blue-800">Weather Advisory</p>
                          <p className="text-sm text-blue-600">
                            High winds detected for {mission.name} - {mission.weatherConditions.windSpeed}km/h
                          </p>
                        </div>
                        <Badge variant="outline">Weather</Badge>
                      </div>
                    ))}

                  {/* Success Message if no alerts */}
                  {drones.filter((d) => d.battery < 20 || d.status === "maintenance").length === 0 &&
                    missions.filter((m) => m.status === "in-progress" && m.weatherConditions.windSpeed > 10).length ===
                      0 && (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                        <p className="font-medium text-green-800">All Systems Operational</p>
                        <p className="text-sm">No alerts or warnings detected</p>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
