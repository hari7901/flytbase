"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Square, Trash2, Save } from "lucide-react"

interface MapProps {
  center?: { lat: number; lng: number }
  zoom?: number
  height?: string
  onAreaChange?: (coordinates: { lat: number; lng: number }[]) => void
  onWaypointsChange?: (waypoints: { lat: number; lng: number; id: string }[]) => void
  initialArea?: { lat: number; lng: number }[]
  initialWaypoints?: { lat: number; lng: number; id: string }[]
  mode?: "view" | "edit" | "waypoints"
  showControls?: boolean
  realTimePosition?: { lat: number; lng: number }
  flightPath?: { lat: number; lng: number }[]
}

export function InteractiveMap({
  center = { lat: 40.7128, lng: -74.006 }, // Default to NYC
  zoom = 15,
  height = "400px",
  onAreaChange,
  onWaypointsChange,
  initialArea = [],
  initialWaypoints = [],
  mode = "view",
  showControls = true,
  realTimePosition,
  flightPath = [],
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentArea, setCurrentArea] = useState<{ lat: number; lng: number }[]>(initialArea)
  const [waypoints, setWaypoints] = useState<{ lat: number; lng: number; id: string }[]>(initialWaypoints)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Simulate Leaflet map functionality
  useEffect(() => {
    if (!mapRef.current || mapLoaded) return

    // Simulate map initialization
    const mapInstance = {
      center,
      zoom,
      markers: [],
      polygons: [],
      polylines: [],
    }

    setMap(mapInstance)
    setMapLoaded(true)
  }, [center, zoom, mapLoaded])

  const handleStartDrawing = () => {
    setIsDrawing(true)
    setCurrentArea([])
  }

  const handleMapClick = (event: React.MouseEvent) => {
    if (!isDrawing || mode !== "edit") return

    const rect = mapRef.current?.getBoundingClientRect()
    if (!rect) return

    // Convert click position to approximate coordinates
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Simulate coordinate conversion (in real implementation, this would use map projection)
    const lat = center.lat + (rect.height / 2 - y) * 0.0001
    const lng = center.lng + (x - rect.width / 2) * 0.0001

    const newPoint = { lat, lng }
    const updatedArea = [...currentArea, newPoint]
    setCurrentArea(updatedArea)
    onAreaChange?.(updatedArea)
  }

  const handleFinishDrawing = () => {
    setIsDrawing(false)
    if (currentArea.length >= 3) {
      onAreaChange?.(currentArea)
    }
  }

  const handleClearArea = () => {
    setCurrentArea([])
    onAreaChange?.([])
  }

  const addWaypoint = (event: React.MouseEvent) => {
    if (mode !== "waypoints") return

    const rect = mapRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const lat = center.lat + (rect.height / 2 - y) * 0.0001
    const lng = center.lng + (x - rect.width / 2) * 0.0001

    const newWaypoint = {
      id: `wp_${Date.now()}`,
      lat,
      lng,
    }

    const updatedWaypoints = [...waypoints, newWaypoint]
    setWaypoints(updatedWaypoints)
    onWaypointsChange?.(updatedWaypoints)
  }

  const removeWaypoint = (id: string) => {
    const updatedWaypoints = waypoints.filter((wp) => wp.id !== id)
    setWaypoints(updatedWaypoints)
    onWaypointsChange?.(updatedWaypoints)
  }

  const generateGridPattern = () => {
    if (currentArea.length < 3) return

    // Calculate bounding box
    const lats = currentArea.map((p) => p.lat)
    const lngs = currentArea.map((p) => p.lng)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    // Generate grid waypoints
    const gridWaypoints = []
    const steps = 5 // 5x5 grid

    for (let i = 0; i <= steps; i++) {
      for (let j = 0; j <= steps; j++) {
        const lat = minLat + (maxLat - minLat) * (i / steps)
        const lng = minLng + (maxLng - minLng) * (j / steps)

        gridWaypoints.push({
          id: `grid_${i}_${j}`,
          lat,
          lng,
        })
      }
    }

    setWaypoints(gridWaypoints)
    onWaypointsChange?.(gridWaypoints)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Interactive Survey Map
        </CardTitle>
        <CardDescription>
          {mode === "edit" && "Click to define survey area boundaries"}
          {mode === "waypoints" && "Click to add waypoints for the flight path"}
          {mode === "view" && "View mission area and flight path"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showControls && (
          <div className="flex flex-wrap gap-2 mb-4">
            {mode === "edit" && (
              <>
                <Button
                  onClick={handleStartDrawing}
                  disabled={isDrawing}
                  size="sm"
                  variant={isDrawing ? "secondary" : "default"}
                >
                  <Square className="h-4 w-4 mr-2" />
                  {isDrawing ? "Drawing..." : "Draw Area"}
                </Button>
                <Button
                  onClick={handleFinishDrawing}
                  disabled={!isDrawing || currentArea.length < 3}
                  size="sm"
                  variant="outline"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Finish
                </Button>
                <Button onClick={handleClearArea} size="sm" variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </>
            )}
            {mode === "waypoints" && (
              <>
                <Button onClick={generateGridPattern} size="sm" disabled={currentArea.length < 3}>
                  <Square className="h-4 w-4 mr-2" />
                  Generate Grid
                </Button>
                <Button onClick={() => setWaypoints([])} size="sm" variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Waypoints
                </Button>
              </>
            )}
            <div className="flex gap-2 ml-auto">
              <Badge variant="outline">Area Points: {currentArea.length}</Badge>
              <Badge variant="outline">Waypoints: {waypoints.length}</Badge>
            </div>
          </div>
        )}

        <div
          ref={mapRef}
          className="relative border-2 border-gray-300 rounded-lg overflow-hidden cursor-crosshair"
          style={{ height }}
          onClick={mode === "edit" ? handleMapClick : mode === "waypoints" ? addWaypoint : undefined}
        >
          {/* Map Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100">
            {/* Grid overlay to simulate map tiles */}
            <div className="absolute inset-0 opacity-20">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={`h-${i}`}
                  className="absolute border-t border-gray-400"
                  style={{ top: `${i * 5}%`, width: "100%" }}
                />
              ))}
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={`v-${i}`}
                  className="absolute border-l border-gray-400"
                  style={{ left: `${i * 5}%`, height: "100%" }}
                />
              ))}
            </div>
          </div>

          {/* Survey Area Polygon */}
          {currentArea.length > 0 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {currentArea.length >= 3 && (
                <polygon
                  points={currentArea
                    .map((point, index) => {
                      const x = ((point.lng - center.lng) / 0.0001 + 400) % 800
                      const y = (-(point.lat - center.lat) / 0.0001 + 200) % 400
                      return `${x},${y}`
                    })
                    .join(" ")}
                  fill="rgba(59, 130, 246, 0.2)"
                  stroke="rgb(59, 130, 246)"
                  strokeWidth="2"
                />
              )}
              {/* Area points */}
              {currentArea.map((point, index) => {
                const x = ((point.lng - center.lng) / 0.0001 + 400) % 800
                const y = (-(point.lat - center.lat) / 0.0001 + 200) % 400
                return (
                  <circle key={index} cx={x} cy={y} r="4" fill="rgb(59, 130, 246)" stroke="white" strokeWidth="2" />
                )
              })}
            </svg>
          )}

          {/* Waypoints */}
          {waypoints.map((waypoint, index) => {
            const x = ((waypoint.lng - center.lng) / 0.0001 + 400) % 800
            const y = (-(waypoint.lat - center.lat) / 0.0001 + 200) % 400
            return (
              <div
                key={waypoint.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: x, top: y }}
              >
                <div className="w-6 h-6 bg-orange-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-xs font-bold text-white">
                  {index + 1}
                </div>
                {mode === "waypoints" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeWaypoint(waypoint.id)
                    }}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                )}
              </div>
            )
          })}

          {/* Flight Path */}
          {flightPath.length > 1 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <polyline
                points={flightPath
                  .map((point) => {
                    const x = ((point.lng - center.lng) / 0.0001 + 400) % 800
                    const y = (-(point.lat - center.lat) / 0.0001 + 200) % 400
                    return `${x},${y}`
                  })
                  .join(" ")}
                fill="none"
                stroke="rgb(34, 197, 94)"
                strokeWidth="3"
                strokeDasharray="5,5"
              />
            </svg>
          )}

          {/* Real-time Position */}
          {realTimePosition && (
            <div
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: ((realTimePosition.lng - center.lng) / 0.0001 + 400) % 800,
                top: (-(realTimePosition.lat - center.lat) / 0.0001 + 200) % 400,
              }}
            >
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-lg border-2 border-white" />
              <div className="absolute inset-0 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-75" />
            </div>
          )}

          {/* Map Instructions */}
          {mode === "edit" && isDrawing && (
            <div className="absolute top-4 left-4 bg-white p-2 rounded shadow-lg text-sm">
              Click to add points. Need at least 3 points to create an area.
            </div>
          )}

          {mode === "waypoints" && (
            <div className="absolute top-4 left-4 bg-white p-2 rounded shadow-lg text-sm">
              Click to add waypoints or use "Generate Grid" for automatic pattern.
            </div>
          )}

          {/* Coordinates Display */}
          <div className="absolute bottom-4 right-4 bg-white p-2 rounded shadow-lg text-xs font-mono">
            Center: {center.lat.toFixed(6)}, {center.lng.toFixed(6)}
          </div>
        </div>

        {/* Area Information */}
        {currentArea.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Survey Area Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Points:</span> {currentArea.length}
              </div>
              <div>
                <span className="text-gray-500">Area:</span> ~{(currentArea.length * 0.1).toFixed(2)} km²
              </div>
            </div>
            <div className="mt-2 max-h-20 overflow-y-auto">
              <div className="text-xs font-mono space-y-1">
                {currentArea.map((point, index) => (
                  <div key={index}>
                    Point {index + 1}: {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
