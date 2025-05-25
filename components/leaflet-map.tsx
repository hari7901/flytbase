"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Square, Trash2, Save, Navigation } from "lucide-react"

interface LeafletMapProps {
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

export function LeafletMap({
  center = { lat: 40.7128, lng: -74.006 },
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
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentArea, setCurrentArea] = useState<{ lat: number; lng: number }[]>(initialArea)
  const [waypoints, setWaypoints] = useState<{ lat: number; lng: number; id: string }[]>(initialWaypoints)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const drawingLayerRef = useRef<any>(null)
  const waypointsLayerRef = useRef<any>(null)
  const realTimeMarkerRef = useRef<any>(null)

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window === "undefined") return

      // Load Leaflet CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }

      // Load Leaflet JS
      if (!(window as any).L) {
        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.onload = () => setLeafletLoaded(true)
        document.head.appendChild(script)
      } else {
        setLeafletLoaded(true)
      }
    }

    loadLeaflet()
  }, [])

  // Initialize map
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapLoaded) return

    const L = (window as any).L
    if (!L) return

    // Create map instance
    const map = L.map(mapRef.current).setView([center.lat, center.lng], zoom)

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map)

    // Create layer groups
    const drawingLayer = L.layerGroup().addTo(map)
    const waypointsLayer = L.layerGroup().addTo(map)

    mapInstanceRef.current = map
    drawingLayerRef.current = drawingLayer
    waypointsLayerRef.current = waypointsLayer

    // Add click handler for drawing
    map.on("click", (e: any) => {
      if (mode === "edit" && isDrawing) {
        const newPoint = { lat: e.latlng.lat, lng: e.latlng.lng }
        const updatedArea = [...currentArea, newPoint]
        setCurrentArea(updatedArea)
        onAreaChange?.(updatedArea)
        updateDrawingLayer(updatedArea)
      } else if (mode === "waypoints") {
        const newWaypoint = {
          id: `wp_${Date.now()}`,
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        }
        const updatedWaypoints = [...waypoints, newWaypoint]
        setWaypoints(updatedWaypoints)
        onWaypointsChange?.(updatedWaypoints)
        updateWaypointsLayer(updatedWaypoints)
      }
    })

    setMapLoaded(true)

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [leafletLoaded, center, zoom, mode, isDrawing])

  // Update drawing layer
  const updateDrawingLayer = (area: { lat: number; lng: number }[]) => {
    if (!drawingLayerRef.current) return
    const L = (window as any).L

    drawingLayerRef.current.clearLayers()

    if (area.length > 0) {
      // Add markers for each point
      area.forEach((point, index) => {
        L.circleMarker([point.lat, point.lng], {
          color: "#3b82f6",
          fillColor: "#3b82f6",
          fillOpacity: 0.8,
          radius: 6,
        })
          .bindPopup(`Point ${index + 1}<br>${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}`)
          .addTo(drawingLayerRef.current)
      })

      // Add polygon if we have enough points
      if (area.length >= 3) {
        L.polygon(
          area.map((p) => [p.lat, p.lng]),
          {
            color: "#3b82f6",
            fillColor: "#3b82f6",
            fillOpacity: 0.2,
            weight: 2,
          },
        ).addTo(drawingLayerRef.current)
      }

      // Add lines connecting points
      if (area.length >= 2) {
        L.polyline(
          area.map((p) => [p.lat, p.lng]),
          {
            color: "#3b82f6",
            weight: 2,
            dashArray: "5, 5",
          },
        ).addTo(drawingLayerRef.current)
      }
    }
  }

  // Update waypoints layer
  const updateWaypointsLayer = (waypointList: { lat: number; lng: number; id: string }[]) => {
    if (!waypointsLayerRef.current) return
    const L = (window as any).L

    waypointsLayerRef.current.clearLayers()

    waypointList.forEach((waypoint, index) => {
      const marker = L.marker([waypoint.lat, waypoint.lng], {
        icon: L.divIcon({
          className: "custom-waypoint-marker",
          html: `<div style="background: #f97316; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${index + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        }),
      })
        .bindPopup(
          `Waypoint ${index + 1}<br>${waypoint.lat.toFixed(6)}, ${waypoint.lng.toFixed(6)}<br><button onclick="removeWaypoint('${waypoint.id}')" style="background: #ef4444; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Remove</button>`,
        )
        .addTo(waypointsLayerRef.current)
    })

    // Add flight path if we have waypoints
    if (waypointList.length >= 2) {
      L.polyline(
        waypointList.map((wp) => [wp.lat, wp.lng]),
        {
          color: "#22c55e",
          weight: 3,
          dashArray: "10, 5",
        },
      ).addTo(waypointsLayerRef.current)
    }
  }

  // Update real-time position
  useEffect(() => {
    if (!mapInstanceRef.current || !realTimePosition) return
    const L = (window as any).L

    if (realTimeMarkerRef.current) {
      realTimeMarkerRef.current.remove()
    }

    realTimeMarkerRef.current = L.marker([realTimePosition.lat, realTimePosition.lng], {
      icon: L.divIcon({
        className: "custom-drone-marker",
        html: `<div style="background: #ef4444; border-radius: 50%; width: 16px; height: 16px; border: 3px solid white; box-shadow: 0 0 10px rgba(239, 68, 68, 0.6); animation: pulse 2s infinite;"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      }),
    }).addTo(mapInstanceRef.current)

    // Center map on drone position
    mapInstanceRef.current.setView([realTimePosition.lat, realTimePosition.lng], mapInstanceRef.current.getZoom())
  }, [realTimePosition])

  // Update initial data
  useEffect(() => {
    if (mapLoaded) {
      updateDrawingLayer(currentArea)
      updateWaypointsLayer(waypoints)
    }
  }, [mapLoaded, currentArea, waypoints])

  const handleStartDrawing = () => {
    setIsDrawing(true)
    setCurrentArea([])
    if (drawingLayerRef.current) {
      drawingLayerRef.current.clearLayers()
    }
  }

  const handleFinishDrawing = () => {
    setIsDrawing(false)
  }

  const handleClearArea = () => {
    setCurrentArea([])
    onAreaChange?.([])
    if (drawingLayerRef.current) {
      drawingLayerRef.current.clearLayers()
    }
  }

  const handleClearWaypoints = () => {
    setWaypoints([])
    onWaypointsChange?.([])
    if (waypointsLayerRef.current) {
      waypointsLayerRef.current.clearLayers()
    }
  }

  const generateGridPattern = () => {
    if (currentArea.length < 3) return

    const lats = currentArea.map((p) => p.lat)
    const lngs = currentArea.map((p) => p.lng)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)

    const gridWaypoints = []
    const steps = 4

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
    updateWaypointsLayer(gridWaypoints)
  }

  // Global function for removing waypoints from popup
  useEffect(() => {
    ;(window as any).removeWaypoint = (id: string) => {
      const updatedWaypoints = waypoints.filter((wp) => wp.id !== id)
      setWaypoints(updatedWaypoints)
      onWaypointsChange?.(updatedWaypoints)
      updateWaypointsLayer(updatedWaypoints)
    }
  }, [waypoints, onWaypointsChange])

  if (!leafletLoaded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Loading Map...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading Leaflet map...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Interactive Survey Map
        </CardTitle>
        <CardDescription>
          {mode === "edit" && "Click on the map to define survey area boundaries"}
          {mode === "waypoints" && "Click on the map to add waypoints for the flight path"}
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
                  Clear Area
                </Button>
              </>
            )}
            {mode === "waypoints" && (
              <>
                <Button onClick={generateGridPattern} size="sm" disabled={currentArea.length < 3}>
                  <Square className="h-4 w-4 mr-2" />
                  Generate Grid
                </Button>
                <Button onClick={handleClearWaypoints} size="sm" variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Waypoints
                </Button>
              </>
            )}
            <div className="flex gap-2 ml-auto">
              <Badge variant="outline">Area Points: {currentArea.length}</Badge>
              <Badge variant="outline">Waypoints: {waypoints.length}</Badge>
              {realTimePosition && (
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  <Navigation className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              )}
            </div>
          </div>
        )}

        <div ref={mapRef} className="w-full border-2 border-gray-300 rounded-lg overflow-hidden" style={{ height }} />

        {/* Area Information */}
        {currentArea.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Survey Area Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Points:</span> {currentArea.length}
              </div>
              <div>
                <span className="text-gray-500">Estimated Area:</span> ~{(currentArea.length * 0.1).toFixed(2)} km²
              </div>
            </div>
          </div>
        )}

        {/* Waypoints Information */}
        {waypoints.length > 0 && (
          <div className="mt-4 p-3 bg-orange-50 rounded-lg">
            <h4 className="font-medium mb-2">Flight Plan Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Waypoints:</span> {waypoints.length}
              </div>
              <div>
                <span className="text-gray-500">Est. Flight Time:</span> ~{Math.ceil(waypoints.length * 0.5)} min
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
