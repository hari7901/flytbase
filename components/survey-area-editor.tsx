"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeafletMap } from "./leaflet-map"
import { MapPin, Upload, Download } from "lucide-react"

interface SurveyAreaEditorProps {
  onAreaChange?: (area: { coordinates: { lat: number; lng: number }[]; center: { lat: number; lng: number } }) => void
  initialArea?: { lat: number; lng: number }[]
  initialCenter?: { lat: number; lng: number }
}

export function SurveyAreaEditor({ onAreaChange, initialArea = [], initialCenter }: SurveyAreaEditorProps) {
  const [activeTab, setActiveTab] = useState("map")
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }[]>(initialArea)
  const [center, setCenter] = useState(initialCenter || { lat: 40.7128, lng: -74.006 })
  const [manualCoords, setManualCoords] = useState("")

  const handleAreaChange = (newCoordinates: { lat: number; lng: number }[]) => {
    setCoordinates(newCoordinates)

    if (newCoordinates.length > 0) {
      const avgLat = newCoordinates.reduce((sum, coord) => sum + coord.lat, 0) / newCoordinates.length
      const avgLng = newCoordinates.reduce((sum, coord) => sum + coord.lng, 0) / newCoordinates.length
      const newCenter = { lat: avgLat, lng: avgLng }
      setCenter(newCenter)

      onAreaChange?.({
        coordinates: newCoordinates,
        center: newCenter,
      })
    }
  }

  const handleManualCoordsSubmit = () => {
    try {
      const lines = manualCoords.trim().split("\n")
      const newCoordinates = lines
        .map((line) => {
          const [lat, lng] = line.split(",").map((coord) => Number.parseFloat(coord.trim()))
          if (isNaN(lat) || isNaN(lng)) {
            throw new Error("Invalid coordinates")
          }
          return { lat, lng }
        })
        .filter((coord) => coord.lat && coord.lng)

      if (newCoordinates.length >= 3) {
        handleAreaChange(newCoordinates)
        setActiveTab("map")
      } else {
        alert("Please provide at least 3 coordinate pairs")
      }
    } catch (error) {
      alert("Invalid coordinate format. Please use: lat, lng (one pair per line)")
    }
  }

  const exportCoordinates = () => {
    const coordText = coordinates.map((coord) => `${coord.lat}, ${coord.lng}`).join("\n")
    const blob = new Blob([coordText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "survey-area-coordinates.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  const importCoordinates = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setManualCoords(content)
    }
    reader.readAsText(file)
  }

  const presetLocations = [
    { name: "New York Central Park", lat: 40.7829, lng: -73.9654 },
    { name: "San Francisco Golden Gate", lat: 37.8199, lng: -122.4783 },
    { name: "London Hyde Park", lat: 51.5074, lng: -0.1278 },
    { name: "Tokyo Imperial Palace", lat: 35.6762, lng: 139.7503 },
    { name: "Sydney Opera House", lat: -33.8568, lng: 151.2153 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Survey Area Editor
        </CardTitle>
        <CardDescription>Define the survey area using interactive map or manual coordinates</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="map">Interactive Map</TabsTrigger>
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="presets">Quick Presets</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-4">
            <LeafletMap
              center={center}
              zoom={15}
              height="500px"
              mode="edit"
              onAreaChange={handleAreaChange}
              initialArea={coordinates}
              showControls={true}
            />
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="manual-coords">Coordinates (lat, lng per line)</Label>
                <textarea
                  id="manual-coords"
                  className="w-full h-40 p-3 border rounded-md font-mono text-sm"
                  placeholder="40.7829, -73.9654&#10;40.7831, -73.9650&#10;40.7825, -73.9648&#10;40.7823, -73.9652"
                  value={manualCoords}
                  onChange={(e) => setManualCoords(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleManualCoordsSubmit}>Apply Coordinates</Button>
                <Button variant="outline" onClick={() => setManualCoords("")}>
                  Clear
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportCoordinates} disabled={coordinates.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <div className="relative">
                  <Button variant="outline" asChild>
                    <label htmlFor="import-coords" className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </label>
                  </Button>
                  <input
                    id="import-coords"
                    type="file"
                    accept=".txt,.csv"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={importCoordinates}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="presets" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Quick Location Presets</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {presetLocations.map((location) => (
                    <Button
                      key={location.name}
                      variant="outline"
                      className="justify-start"
                      onClick={() => {
                        const newCenter = { lat: location.lat, lng: location.lng }
                        setCenter(newCenter)
                        const offset = 0.002
                        const sampleArea = [
                          { lat: location.lat - offset, lng: location.lng - offset },
                          { lat: location.lat - offset, lng: location.lng + offset },
                          { lat: location.lat + offset, lng: location.lng + offset },
                          { lat: location.lat + offset, lng: location.lng - offset },
                        ]
                        handleAreaChange(sampleArea)
                        setActiveTab("map")
                      }}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {location.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <Label>Custom Center Point</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Input
                      placeholder="Latitude"
                      type="number"
                      step="any"
                      value={center.lat}
                      onChange={(e) => setCenter((prev) => ({ ...prev, lat: Number.parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Longitude"
                      type="number"
                      step="any"
                      value={center.lng}
                      onChange={(e) => setCenter((prev) => ({ ...prev, lng: Number.parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <Button className="w-full mt-2" variant="outline" onClick={() => setActiveTab("map")}>
                  Go to Location
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {coordinates.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Area Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Points:</span> {coordinates.length}
              </div>
              <div>
                <span className="text-gray-500">Center:</span> {center.lat.toFixed(4)}, {center.lng.toFixed(4)}
              </div>
              <div>
                <span className="text-gray-500">Estimated Area:</span> ~{(coordinates.length * 0.1).toFixed(2)} km²
              </div>
              <div>
                <span className="text-gray-500">Perimeter:</span> ~{(coordinates.length * 0.2).toFixed(2)} km
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
