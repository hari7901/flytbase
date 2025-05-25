"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Save, Play } from "lucide-react"
import Link from "next/link"
import { useDrones, useMissions } from "@/hooks/use-firebase-data"
import type { Mission } from "@/lib/types"
import { SurveyAreaEditor } from "@/components/survey-area-editor"
import { WaypointEditor } from "@/components/waypoint-editor"

interface MissionPlan {
  name: string
  description: string
  droneId: string
  surveyType: string
  area: {
    coordinates: { lat: number; lng: number }[]
    altitude: number
    overlap: number
  }
  flightPattern: string
  sensors: string[]
  schedule: {
    startTime: string
    estimatedDuration: number
  }
}

const surveyTypes = [
  { id: "inspection", name: "Facility Inspection", description: "Detailed inspection of buildings and infrastructure" },
  { id: "mapping", name: "Site Mapping", description: "Comprehensive mapping and surveying" },
  { id: "security", name: "Security Patrol", description: "Perimeter and security monitoring" },
  { id: "monitoring", name: "Environmental Monitoring", description: "Environmental data collection" },
]

const flightPatterns = [
  { id: "grid", name: "Grid Pattern", description: "Systematic grid coverage" },
  { id: "crosshatch", name: "Crosshatch Pattern", description: "Overlapping grid for maximum coverage" },
  { id: "perimeter", name: "Perimeter Pattern", description: "Follow boundary lines" },
  { id: "spiral", name: "Spiral Pattern", description: "Spiral from center outward" },
]

const availableSensors = [
  { id: "rgb", name: "RGB Camera", description: "High-resolution visible light camera" },
  { id: "thermal", name: "Thermal Camera", description: "Infrared thermal imaging" },
  { id: "lidar", name: "LiDAR", description: "Laser distance measurement" },
  { id: "multispectral", name: "Multispectral", description: "Multiple wavelength imaging" },
]

export default function MissionPlanning() {
  const { drones, loading: dronesLoading } = useDrones()
  const { addMission } = useMissions()
  const [missionPlan, setMissionPlan] = useState<MissionPlan>({
    name: "",
    description: "",
    droneId: "",
    surveyType: "",
    area: {
      coordinates: [],
      altitude: 50,
      overlap: 70,
    },
    flightPattern: "",
    sensors: [],
    schedule: {
      startTime: "",
      estimatedDuration: 30,
    },
  })

  const [activeTab, setActiveTab] = useState("basic")
  const [saving, setSaving] = useState(false)

  const availableDrones = drones.filter((drone) => drone.status === "available")

  const handleInputChange = (field: string, value: any) => {
    setMissionPlan((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAreaChange = (field: string, value: any) => {
    setMissionPlan((prev) => ({
      ...prev,
      area: {
        ...prev.area,
        [field]: value,
      },
    }))
  }

  const handleScheduleChange = (field: string, value: any) => {
    setMissionPlan((prev) => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [field]: value,
      },
    }))
  }

  const handleSensorToggle = (sensorId: string) => {
    setMissionPlan((prev) => ({
      ...prev,
      sensors: prev.sensors.includes(sensorId)
        ? prev.sensors.filter((s) => s !== sensorId)
        : [...prev.sensors, sensorId],
    }))
  }

  const handleSaveMission = async () => {
    setSaving(true)
    try {
      const selectedDrone = drones.find((d) => d.id === missionPlan.droneId)
      const mission: Omit<Mission, "id"> = {
        name: missionPlan.name,
        description: missionPlan.description,
        droneId: missionPlan.droneId,
        droneName: selectedDrone?.name || "",
        status: "scheduled",
        progress: 0,
        startTime: missionPlan.schedule.startTime,
        estimatedEndTime: new Date(
          new Date(missionPlan.schedule.startTime).getTime() + missionPlan.schedule.estimatedDuration * 60000,
        ).toISOString(),
        surveyType: surveyTypes.find((t) => t.id === missionPlan.surveyType)?.name || "",
        location: "TBD", // Would be set based on coordinates
        coordinates: missionPlan.area.coordinates,
        altitude: missionPlan.area.altitude,
        flightPattern: flightPatterns.find((p) => p.id === missionPlan.flightPattern)?.name || "",
        sensors: missionPlan.sensors.map((s) => availableSensors.find((sensor) => sensor.id === s)?.name || s),
        overlap: missionPlan.area.overlap,
      }

      await addMission(mission)
      alert("Mission plan saved successfully!")

      // Reset form
      setMissionPlan({
        name: "",
        description: "",
        droneId: "",
        surveyType: "",
        area: {
          coordinates: [],
          altitude: 50,
          overlap: 70,
        },
        flightPattern: "",
        sensors: [],
        schedule: {
          startTime: "",
          estimatedDuration: 30,
        },
      })
    } catch (error) {
      alert("Failed to save mission plan. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleStartMission = async () => {
    await handleSaveMission()
    // Additional logic to start mission immediately would go here
  }

  if (dronesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading planning interface...</p>
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
                <MapPin className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Mission Planning</h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Mission Configuration */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Create New Mission</CardTitle>
                <CardDescription>Configure your drone survey mission parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="area">Survey Area</TabsTrigger>
                    <TabsTrigger value="waypoints">Waypoints</TabsTrigger>
                    <TabsTrigger value="flight">Flight Plan</TabsTrigger>
                    <TabsTrigger value="sensors">Sensors</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="mission-name">Mission Name</Label>
                        <Input
                          id="mission-name"
                          placeholder="Enter mission name"
                          value={missionPlan.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="mission-description">Description</Label>
                        <Textarea
                          id="mission-description"
                          placeholder="Describe the mission objectives"
                          value={missionPlan.description}
                          onChange={(e) => handleInputChange("description", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="drone-select">Select Drone</Label>
                        <Select
                          value={missionPlan.droneId}
                          onValueChange={(value) => handleInputChange("droneId", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a drone" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableDrones.map((drone) => (
                              <SelectItem key={drone.id} value={drone.id}>
                                {drone.name} ({drone.model})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="survey-type">Survey Type</Label>
                        <Select
                          value={missionPlan.surveyType}
                          onValueChange={(value) => handleInputChange("surveyType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select survey type" />
                          </SelectTrigger>
                          <SelectContent>
                            {surveyTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="area" className="space-y-6 mt-6">
                    <SurveyAreaEditor
                      onAreaChange={(area) => {
                        handleAreaChange("coordinates", area.coordinates)
                        // Update center if needed
                      }}
                      initialArea={missionPlan.area.coordinates}
                    />
                  </TabsContent>

                  <TabsContent value="waypoints" className="space-y-6 mt-6">
                    <WaypointEditor
                      surveyArea={missionPlan.area.coordinates}
                      flightPattern={missionPlan.flightPattern}
                      altitude={missionPlan.area.altitude}
                      overlap={missionPlan.area.overlap}
                      onWaypointsChange={(waypoints) => {
                        // Handle waypoints change
                        console.log("Waypoints updated:", waypoints)
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="flight" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Flight Pattern</Label>
                        <div className="grid grid-cols-1 gap-3 mt-2">
                          {flightPatterns.map((pattern) => (
                            <div
                              key={pattern.id}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                missionPlan.flightPattern === pattern.id
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => handleInputChange("flightPattern", pattern.id)}
                            >
                              <div className="font-medium">{pattern.name}</div>
                              <div className="text-sm text-gray-500">{pattern.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Estimated Duration (minutes)</Label>
                        <div className="mt-2">
                          <Slider
                            value={[missionPlan.schedule.estimatedDuration]}
                            onValueChange={(value) => handleScheduleChange("estimatedDuration", value[0])}
                            max={180}
                            min={15}
                            step={15}
                            className="w-full"
                          />
                          <div className="flex justify-between text-sm text-gray-500 mt-1">
                            <span>15 min</span>
                            <span>{missionPlan.schedule.estimatedDuration} min</span>
                            <span>180 min</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="start-time">Scheduled Start Time</Label>
                        <Input
                          id="start-time"
                          type="datetime-local"
                          value={missionPlan.schedule.startTime}
                          onChange={(e) => handleScheduleChange("startTime", e.target.value)}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="sensors" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      <Label>Select Sensors</Label>
                      {availableSensors.map((sensor) => (
                        <div key={sensor.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{sensor.name}</div>
                            <div className="text-sm text-gray-500">{sensor.description}</div>
                          </div>
                          <Switch
                            checked={missionPlan.sensors.includes(sensor.id)}
                            onCheckedChange={() => handleSensorToggle(sensor.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Mission Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Mission Summary</CardTitle>
                <CardDescription>Review your mission configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Mission Name</Label>
                  <p className="text-sm text-gray-600">{missionPlan.name || "Not set"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Drone</Label>
                  <p className="text-sm text-gray-600">
                    {availableDrones.find((d) => d.id === missionPlan.droneId)?.name || "Not selected"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Survey Type</Label>
                  <p className="text-sm text-gray-600">
                    {surveyTypes.find((t) => t.id === missionPlan.surveyType)?.name || "Not selected"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Flight Pattern</Label>
                  <p className="text-sm text-gray-600">
                    {flightPatterns.find((p) => p.id === missionPlan.flightPattern)?.name || "Not selected"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Altitude</Label>
                  <p className="text-sm text-gray-600">{missionPlan.area.altitude}m</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Overlap</Label>
                  <p className="text-sm text-gray-600">{missionPlan.area.overlap}%</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Duration</Label>
                  <p className="text-sm text-gray-600">{missionPlan.schedule.estimatedDuration} minutes</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Sensors</Label>
                  <p className="text-sm text-gray-600">
                    {missionPlan.sensors.length > 0
                      ? missionPlan.sensors
                          .map((s) => availableSensors.find((sensor) => sensor.id === s)?.name)
                          .join(", ")
                      : "None selected"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 space-y-3">
              <Button onClick={handleSaveMission} disabled={saving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Mission Plan"}
              </Button>
              <Button onClick={handleStartMission} disabled={saving} variant="outline" className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Start Mission Now
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
