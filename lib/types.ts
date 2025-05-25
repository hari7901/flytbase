export interface Drone {
  id: string
  name: string
  model: string
  status: "available" | "in-mission" | "charging" | "maintenance"
  battery: number
  location: string
  lastMission: string
  totalFlightTime: number
  coordinates: { lat: number; lng: number }
  maxAltitude: number
  maxSpeed: number
  sensors: string[]
  specifications: {
    maxFlightTime: number
    maxPayload: number
    operatingTemperature: string
    windResistance: string
  }
  maintenanceStatus: string
  lastMaintenance: string
  nextMaintenance: string
  createdAt?: any
  updatedAt?: any
}

export interface Mission {
  id: string
  name: string
  description: string
  droneId: string
  droneName: string
  status: "scheduled" | "in-progress" | "completed" | "paused" | "aborted"
  progress: number
  startTime: string
  estimatedEndTime: string
  actualEndTime?: string
  surveyType: string
  location: string
  coordinates: { lat: number; lng: number }[]
  altitude: number
  flightPattern: string
  sensors: string[]
  overlap: number
  speed: number
  dataCollectionFrequency: number
  estimatedDistance: number
  estimatedDuration: number
  priority: "low" | "medium" | "high"
  weatherConditions: {
    temperature: number
    windSpeed: number
    visibility: string
    precipitation: string
  }
  createdAt?: any
  updatedAt?: any
}

export interface SurveyReport {
  id: string
  missionId: string
  name: string
  date: string
  duration: string
  distance: string
  area: string
  drone: string
  status: "completed" | "processing" | "failed"
  dataPoints: number
  images: number
  thermalImages?: number
  videoFootage?: string
  coverage: string
  accuracy: string
  weatherConditions: string
  anomaliesDetected: number
  reportUrl?: string
  createdAt?: any
}

export interface FlightStats {
  id?: string
  month: string
  flights: number
  hours: number
  distance: number
  surveys: number
  efficiency: number
}

export interface Waypoint {
  id: string
  missionId: string
  order: number
  coordinates: { lat: number; lng: number }
  altitude: number
  action: "photo" | "video" | "hover" | "scan"
  duration?: number
  parameters?: any
}

export interface MissionPattern {
  id: string
  name: string
  description: string
  type: "grid" | "crosshatch" | "perimeter" | "spiral"
  parameters: any
  efficiency: number
  bestFor: string[]
}

export interface OrganizationStats {
  id: string
  totalDrones: number
  totalMissions: number
  completedMissions: number
  totalSurveys: number
  totalFlightHours: number
  totalDistance: number
  totalDataPoints: number
  totalImages: number
  averageEfficiency: number
  createdAt?: any
  updatedAt?: any
}

export interface RealTimeTracking {
  id: string
  droneId: string
  position: { lat: number; lng: number }
  altitude: number
  timestamp: any
}
