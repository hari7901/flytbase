"use client"

import { useState, useEffect } from "react"
import {
  droneOperations,
  missionOperations,
  surveyOperations,
  flightStatsOperations,
  organizationStatsOperations,
  missionPatternOperations,
} from "@/lib/firebase-operations"
import type { Drone, Mission, SurveyReport, FlightStats, OrganizationStats, MissionPattern } from "@/lib/types"

// Custom hook for drones with real-time updates
export const useDrones = () => {
  const [drones, setDrones] = useState<Drone[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = droneOperations.listen((dronesData) => {
      setDrones(dronesData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const updateDrone = async (id: string, updates: Partial<Drone>) => {
    try {
      await droneOperations.update(id, updates)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update drone")
    }
  }

  const updateDroneBattery = async (id: string, battery: number) => {
    try {
      await droneOperations.updateBattery(id, battery)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update drone battery")
    }
  }

  const updateDroneLocation = async (id: string, coordinates: { lat: number; lng: number }, location: string) => {
    try {
      await droneOperations.updateLocation(id, coordinates, location)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update drone location")
    }
  }

  return { drones, loading, error, updateDrone, updateDroneBattery, updateDroneLocation }
}

// Custom hook for missions with real-time updates
export const useMissions = () => {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = missionOperations.listen((missionsData) => {
      setMissions(missionsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const updateMission = async (id: string, updates: Partial<Mission>) => {
    try {
      await missionOperations.update(id, updates)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update mission")
    }
  }

  const updateMissionProgress = async (id: string, progress: number) => {
    try {
      await missionOperations.updateProgress(id, progress)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update mission progress")
    }
  }

  const addMission = async (mission: Omit<Mission, "id">) => {
    try {
      return await missionOperations.add(mission)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add mission")
      throw err
    }
  }

  const getActiveMissions = async () => {
    try {
      return await missionOperations.getActiveMissions()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get active missions")
      return []
    }
  }

  return { missions, loading, error, updateMission, updateMissionProgress, addMission, getActiveMissions }
}

// Custom hook for surveys
export const useSurveys = () => {
  const [surveys, setSurveys] = useState<SurveyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const surveysData = await surveyOperations.getAll()
        setSurveys(surveysData)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch surveys")
        setLoading(false)
      }
    }

    fetchSurveys()
  }, [])

  const getSurveysByDateRange = async (startDate: string, endDate: string) => {
    try {
      return await surveyOperations.getByDateRange(startDate, endDate)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch surveys by date range")
      return []
    }
  }

  return { surveys, loading, error, getSurveysByDateRange }
}

// Custom hook for flight stats
export const useFlightStats = () => {
  const [flightStats, setFlightStats] = useState<FlightStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFlightStats = async () => {
      try {
        const statsData = await flightStatsOperations.getAll()
        setFlightStats(statsData)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch flight stats")
        setLoading(false)
      }
    }

    fetchFlightStats()
  }, [])

  return { flightStats, loading, error }
}

// Custom hook for organization stats with real-time updates
export const useOrganizationStats = () => {
  const [stats, setStats] = useState<OrganizationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = organizationStatsOperations.listen((statsData) => {
      setStats(statsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { stats, loading, error }
}

// Custom hook for mission patterns
export const useMissionPatterns = () => {
  const [patterns, setPatterns] = useState<MissionPattern[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPatterns = async () => {
      try {
        const patternsData = await missionPatternOperations.getAll()
        setPatterns(patternsData)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch mission patterns")
        setLoading(false)
      }
    }

    fetchPatterns()
  }, [])

  return { patterns, loading, error }
}

// Custom hook for real-time mission simulation
export const useRealTimeSimulation = () => {
  const { missions, updateMissionProgress } = useMissions()
  const { updateDroneBattery, updateDroneLocation } = useDrones()

  useEffect(() => {
    const interval = setInterval(() => {
      missions.forEach(async (mission) => {
        if (mission.status === "in-progress" && mission.progress < 100) {
          // Simulate mission progress
          const progressIncrement = Math.random() * 3 + 1 // 1-4% progress per update
          const newProgress = Math.min(mission.progress + progressIncrement, 100)
          await updateMissionProgress(mission.id, newProgress)

          // Simulate drone battery drain
          const batteryDrain = Math.random() * 2 + 0.5 // 0.5-2.5% battery drain
          // Note: We'd need to get current battery level first in a real implementation

          // Simulate drone position updates (would be real GPS coordinates)
          const positionVariation = 0.001 // Small GPS variation
          const newLat = mission.coordinates[0].lat + (Math.random() - 0.5) * positionVariation
          const newLng = mission.coordinates[0].lng + (Math.random() - 0.5) * positionVariation

          await updateDroneLocation(mission.droneId, { lat: newLat, lng: newLng }, mission.location)
        }
      })
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [missions, updateMissionProgress, updateDroneBattery, updateDroneLocation])
}
