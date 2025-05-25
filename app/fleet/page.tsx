"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DrillIcon as Drone, Battery, MapPin, Settings, Play, Pause, Square, Wrench, Zap } from "lucide-react"
import Link from "next/link"
import { useDrones } from "@/hooks/use-firebase-data"

export default function FleetManagement() {
  const { drones, loading, error, updateDrone } = useDrones()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedDrone, setSelectedDrone] = useState<string | null>(null)

  const filteredDrones = drones.filter((drone) => {
    const matchesSearch =
      drone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drone.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drone.model.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || drone.status === statusFilter
    return matchesSearch && matchesStatus
  })

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

  const getBatteryColor = (battery: number) => {
    if (battery > 60) return "text-green-600"
    if (battery > 30) return "text-yellow-600"
    return "text-red-600"
  }

  const getMaintenanceStatus = (drone: any) => {
    const nextMaintenance = new Date(drone.nextMaintenance)
    const today = new Date()
    const daysUntilMaintenance = Math.ceil((nextMaintenance.getTime() - today.getTime()) / (1000 * 3600 * 24))

    if (daysUntilMaintenance <= 0) return { status: "overdue", color: "text-red-600" }
    if (daysUntilMaintenance <= 7) return { status: "due soon", color: "text-yellow-600" }
    return { status: "good", color: "text-green-600" }
  }

  const handleDroneAction = async (droneId: string, action: string) => {
    try {
      switch (action) {
        case "start":
          await updateDrone(droneId, { status: "in-mission" })
          break
        case "pause":
          await updateDrone(droneId, { status: "available" })
          break
        case "stop":
          await updateDrone(droneId, { status: "available" })
          break
        case "charge":
          await updateDrone(droneId, { status: "charging" })
          break
        case "maintenance":
          await updateDrone(droneId, { status: "maintenance" })
          break
      }
    } catch (err) {
      console.error("Failed to update drone:", err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading fleet data from Firebase...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading fleet data: {error}</p>
        </div>
      </div>
    )
  }

  const selectedDroneData = selectedDrone ? drones.find((d) => d.id === selectedDrone) : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Drone className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Fleet Management</h1>
                  <p className="text-sm text-gray-500">Real-time drone monitoring and control</p>
                </div>
              </Link>
            </div>
            <nav className="flex space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <Link href="/missions" className="text-gray-600 hover:text-gray-900">
                Missions
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
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            placeholder="Search drones by name, ID, or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="max-w-sm">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="in-mission">In Mission</SelectItem>
              <SelectItem value="charging">Charging</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Fleet Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Drones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{drones.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {drones.filter((d) => d.status === "available").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">In Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {drones.filter((d) => d.status === "in-mission").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Charging</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {drones.filter((d) => d.status === "charging").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Battery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {drones.length > 0 ? Math.round(drones.reduce((acc, d) => acc + d.battery, 0) / drones.length) : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Drone List */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="grid" className="space-y-6">
              <TabsList>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="map">Map View</TabsTrigger>
              </TabsList>

              <TabsContent value="grid" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredDrones.map((drone) => {
                    const maintenanceStatus = getMaintenanceStatus(drone)
                    return (
                      <Card
                        key={drone.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${selectedDrone === drone.id ? "ring-2 ring-blue-500" : ""}`}
                        onClick={() => setSelectedDrone(drone.id)}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${getStatusColor(drone.status)}`} />
                              <div>
                                <CardTitle className="text-lg">{drone.name}</CardTitle>
                                <CardDescription>
                                  {drone.id} • {drone.model}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {drone.status.replace("-", " ")}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <Battery className={`h-4 w-4 ${getBatteryColor(drone.battery)}`} />
                              <span className="text-sm font-medium">{drone.battery}%</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-gray-500" />
                              <span className="text-sm truncate">{drone.location}</span>
                            </div>
                          </div>

                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex justify-between">
                              <span>Flight Time:</span>
                              <span>{drone.totalFlightTime}h</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Max Altitude:</span>
                              <span>{drone.maxAltitude}m</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Maintenance:</span>
                              <span className={maintenanceStatus.color}>{maintenanceStatus.status}</span>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            {drone.status === "available" && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDroneAction(drone.id, "start")
                                }}
                                className="flex-1"
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Deploy
                              </Button>
                            )}
                            {drone.status === "in-mission" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDroneAction(drone.id, "pause")
                                  }}
                                  className="flex-1"
                                >
                                  <Pause className="h-4 w-4 mr-1" />
                                  Pause
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDroneAction(drone.id, "stop")
                                  }}
                                  className="flex-1"
                                >
                                  <Square className="h-4 w-4 mr-1" />
                                  Return
                                </Button>
                              </>
                            )}
                            {drone.status === "charging" && (
                              <Button size="sm" variant="outline" disabled className="flex-1">
                                <Zap className="h-4 w-4 mr-1" />
                                Charging...
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>

              <TabsContent value="list" className="space-y-4">
                {filteredDrones.map((drone) => {
                  const maintenanceStatus = getMaintenanceStatus(drone)
                  return (
                    <Card
                      key={drone.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${selectedDrone === drone.id ? "ring-2 ring-blue-500" : ""}`}
                      onClick={() => setSelectedDrone(drone.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
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
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Battery</p>
                              <p className={`text-sm font-medium ${getBatteryColor(drone.battery)}`}>
                                {drone.battery}%
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Status</p>
                              <p className="text-sm font-medium capitalize">{drone.status.replace("-", " ")}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Location</p>
                              <p className="text-sm font-medium">{drone.location}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Maintenance</p>
                              <p className={`text-sm font-medium ${maintenanceStatus.color}`}>
                                {maintenanceStatus.status}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </TabsContent>

              <TabsContent value="map" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Fleet Location Map</CardTitle>
                    <CardDescription>Real-time drone positions and status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative">
                      <div className="text-center">
                        <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 font-medium">Interactive Fleet Map</p>
                        <p className="text-sm text-gray-400">Real-time drone locations would be displayed here</p>
                      </div>

                      {/* Simulated drone positions */}
                      {filteredDrones.slice(0, 5).map((drone, index) => (
                        <div
                          key={drone.id}
                          className={`absolute w-4 h-4 rounded-full ${getStatusColor(drone.status)} cursor-pointer`}
                          style={{
                            left: `${20 + index * 15}%`,
                            top: `${30 + Math.sin(index) * 20}%`,
                          }}
                          title={`${drone.name} - ${drone.status}`}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Drone Details Panel */}
          <div>
            {selectedDroneData ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Drone className="h-5 w-5" />
                    {selectedDroneData.name}
                  </CardTitle>
                  <CardDescription>
                    {selectedDroneData.id} • {selectedDroneData.model}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Status Overview */}
                  <div>
                    <h4 className="font-medium mb-3">Current Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Status</span>
                        <Badge variant="outline" className="capitalize">
                          {selectedDroneData.status.replace("-", " ")}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Battery</span>
                        <span className={`text-sm font-medium ${getBatteryColor(selectedDroneData.battery)}`}>
                          {selectedDroneData.battery}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Location</span>
                        <span className="text-sm">{selectedDroneData.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Specifications */}
                  <div>
                    <h4 className="font-medium mb-3">Specifications</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Max Flight Time</span>
                        <span>{selectedDroneData.specifications.maxFlightTime} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Payload</span>
                        <span>{selectedDroneData.specifications.maxPayload} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Altitude</span>
                        <span>{selectedDroneData.maxAltitude} m</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Speed</span>
                        <span>{selectedDroneData.maxSpeed} m/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Wind Resistance</span>
                        <span>{selectedDroneData.specifications.windResistance}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sensors */}
                  <div>
                    <h4 className="font-medium mb-3">Sensors</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedDroneData.sensors.map((sensor) => (
                        <Badge key={sensor} variant="secondary" className="text-xs">
                          {sensor}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Maintenance */}
                  <div>
                    <h4 className="font-medium mb-3">Maintenance</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Status</span>
                        <span className={getMaintenanceStatus(selectedDroneData).color}>
                          {getMaintenanceStatus(selectedDroneData).status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Service</span>
                        <span>{selectedDroneData.lastMaintenance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next Service</span>
                        <span>{selectedDroneData.nextMaintenance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Flight Time</span>
                        <span>{selectedDroneData.totalFlightTime}h</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDroneAction(selectedDroneData.id, "charge")}
                        disabled={selectedDroneData.status === "charging"}
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Charge
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDroneAction(selectedDroneData.id, "maintenance")}
                        disabled={selectedDroneData.status === "maintenance"}
                      >
                        <Wrench className="h-4 w-4 mr-1" />
                        Service
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Drone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a drone to view details</p>
                  <p className="text-sm text-gray-400">Click on any drone card to see specifications and controls</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
