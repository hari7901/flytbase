// Import Firebase functions with error handling
import { db, isUsingFirebase } from "./firebase"

// Only import Firebase functions if we're using real Firebase
let collection: any,
  doc: any,
  getDocs: any,
  getDoc: any,
  addDoc: any,
  updateDoc: any,
  onSnapshot: any,
  query: any,
  where: any,
  orderBy: any,
  serverTimestamp: any

const initializeFirebaseFunctions = async () => {
  if (isUsingFirebase()) {
    try {
      const firestore = await import("firebase/firestore")
      collection = firestore.collection
      doc = firestore.doc
      getDocs = firestore.getDocs
      getDoc = firestore.getDoc
      addDoc = firestore.addDoc
      updateDoc = firestore.updateDoc
      onSnapshot = firestore.onSnapshot
      query = firestore.query
      where = firestore.where
      orderBy = firestore.orderBy
      serverTimestamp = firestore.serverTimestamp
      console.log("Firebase functions loaded successfully")
    } catch (error) {
      console.warn("Failed to load Firebase functions:", error)
    }
  }
}

// Initialize Firebase functions
initializeFirebaseFunctions()

import type { Drone, Mission, SurveyReport, FlightStats, MissionPattern, OrganizationStats } from "./types"

// Check if we're using mock database
const isMockDB = db && db._isMock

// Collections
export const COLLECTIONS = {
  DRONES: "drones",
  MISSIONS: "missions",
  SURVEYS: "surveys",
  FLIGHT_STATS: "flightStats",
  WAYPOINTS: "waypoints",
  MISSION_PATTERNS: "missionPatterns",
  ORGANIZATION_STATS: "organizationStats",
  REAL_TIME_TRACKING: "realTimeTracking",
}

// Mock data for fallback
const mockDrones: Drone[] = [
  {
    id: "D001",
    name: "Surveyor Alpha",
    model: "DJI Matrice 300 RTK",
    status: "available",
    battery: 85,
    location: "Site A - Building 1",
    lastMission: "2024-01-15 14:30",
    totalFlightTime: 45.5,
    coordinates: { lat: 40.7128, lng: -74.006 },
    maxAltitude: 150,
    maxSpeed: 17,
    sensors: ["RGB Camera", "Thermal Camera", "LiDAR"],
    specifications: {
      maxFlightTime: 55,
      maxPayload: 2.7,
      operatingTemperature: "-20°C to 50°C",
      windResistance: "15 m/s",
    },
    maintenanceStatus: "good",
    lastMaintenance: "2024-01-10",
    nextMaintenance: "2024-02-10",
  },
  {
    id: "D002",
    name: "Mapper Beta",
    model: "DJI Phantom 4 RTK",
    status: "in-mission",
    battery: 67,
    location: "Site B - Warehouse",
    lastMission: "2024-01-15 16:00",
    totalFlightTime: 32.2,
    coordinates: { lat: 40.7589, lng: -73.9851 },
    maxAltitude: 120,
    maxSpeed: 20,
    sensors: ["RGB Camera", "RTK GPS"],
    specifications: {
      maxFlightTime: 30,
      maxPayload: 0.5,
      operatingTemperature: "0°C to 40°C",
      windResistance: "10 m/s",
    },
    maintenanceStatus: "good",
    lastMaintenance: "2024-01-08",
    nextMaintenance: "2024-02-08",
  },
  {
    id: "D003",
    name: "Inspector Gamma",
    model: "Autel EVO II Pro",
    status: "charging",
    battery: 23,
    location: "Base Station",
    lastMission: "2024-01-15 12:15",
    totalFlightTime: 67.8,
    coordinates: { lat: 40.7505, lng: -73.9934 },
    maxAltitude: 140,
    maxSpeed: 15,
    sensors: ["RGB Camera", "Thermal Camera"],
    specifications: {
      maxFlightTime: 40,
      maxPayload: 1.0,
      operatingTemperature: "-10°C to 40°C",
      windResistance: "12 m/s",
    },
    maintenanceStatus: "good",
    lastMaintenance: "2024-01-12",
    nextMaintenance: "2024-02-12",
  },
  {
    id: "D004",
    name: "Scout Delta",
    model: "DJI Mini 3 Pro",
    status: "available",
    battery: 92,
    location: "Site C - Parking Lot",
    lastMission: "2024-01-15 10:45",
    totalFlightTime: 28.9,
    coordinates: { lat: 40.7282, lng: -74.0776 },
    maxAltitude: 100,
    maxSpeed: 16,
    sensors: ["RGB Camera"],
    specifications: {
      maxFlightTime: 34,
      maxPayload: 0.249,
      operatingTemperature: "-10°C to 40°C",
      windResistance: "10.7 m/s",
    },
    maintenanceStatus: "good",
    lastMaintenance: "2024-01-05",
    nextMaintenance: "2024-02-05",
  },
  {
    id: "D005",
    name: "Guardian Echo",
    model: "DJI Matrice 30T",
    status: "maintenance",
    battery: 0,
    location: "Maintenance Bay",
    lastMission: "2024-01-14 18:20",
    totalFlightTime: 89.3,
    coordinates: { lat: 40.7614, lng: -73.9776 },
    maxAltitude: 160,
    maxSpeed: 23,
    sensors: ["RGB Camera", "Thermal Camera", "Zoom Camera"],
    specifications: {
      maxFlightTime: 41,
      maxPayload: 0.9,
      operatingTemperature: "-20°C to 50°C",
      windResistance: "15 m/s",
    },
    maintenanceStatus: "maintenance",
    lastMaintenance: "2024-01-15",
    nextMaintenance: "2024-01-20",
  },
]

const mockMissions: Mission[] = [
  {
    id: "M001",
    name: "Site A Comprehensive Facility Inspection",
    description: "Detailed thermal and visual inspection of Site A facilities including structural analysis",
    droneId: "D002",
    droneName: "Mapper Beta",
    status: "in-progress",
    progress: 65,
    startTime: "2024-01-15T14:30:00Z",
    estimatedEndTime: "2024-01-15T16:00:00Z",
    surveyType: "Facility Inspection",
    location: "Site A - Building 1",
    coordinates: [
      { lat: 40.7128, lng: -74.006 },
      { lat: 40.7138, lng: -74.005 },
      { lat: 40.7148, lng: -74.007 },
      { lat: 40.7118, lng: -74.008 },
    ],
    altitude: 50,
    flightPattern: "Grid Pattern",
    sensors: ["RGB Camera", "Thermal Camera"],
    overlap: 70,
    speed: 5,
    dataCollectionFrequency: 2,
    estimatedDistance: 12.5,
    estimatedDuration: 90,
    priority: "high",
    weatherConditions: {
      temperature: 22,
      windSpeed: 8,
      visibility: "good",
      precipitation: "none",
    },
  },
  {
    id: "M002",
    name: "Perimeter Security Patrol - Zone B",
    description: "Automated security patrol with thermal imaging for perimeter monitoring",
    droneId: "D005",
    droneName: "Guardian Echo",
    status: "completed",
    progress: 100,
    startTime: "2024-01-15T12:00:00Z",
    estimatedEndTime: "2024-01-15T13:30:00Z",
    actualEndTime: "2024-01-15T13:25:00Z",
    surveyType: "Security Patrol",
    location: "Site B - Perimeter",
    coordinates: [
      { lat: 40.7589, lng: -73.9851 },
      { lat: 40.7599, lng: -73.9841 },
      { lat: 40.7609, lng: -73.9861 },
      { lat: 40.7579, lng: -73.9871 },
    ],
    altitude: 75,
    flightPattern: "Perimeter Pattern",
    sensors: ["RGB Camera", "Thermal Camera"],
    overlap: 60,
    speed: 8,
    dataCollectionFrequency: 1,
    estimatedDistance: 8.2,
    estimatedDuration: 85,
    priority: "medium",
    weatherConditions: {
      temperature: 20,
      windSpeed: 5,
      visibility: "excellent",
      precipitation: "none",
    },
  },
  {
    id: "M003",
    name: "Warehouse Complex Mapping Survey",
    description: "High-resolution mapping with LiDAR for warehouse expansion planning",
    droneId: "D001",
    droneName: "Surveyor Alpha",
    status: "scheduled",
    progress: 0,
    startTime: "2024-01-15T18:00:00Z",
    estimatedEndTime: "2024-01-15T20:30:00Z",
    surveyType: "Site Mapping",
    location: "Site C - Warehouse Complex",
    coordinates: [
      { lat: 40.7282, lng: -74.0776 },
      { lat: 40.7292, lng: -74.0766 },
      { lat: 40.7302, lng: -74.0786 },
      { lat: 40.7272, lng: -74.0796 },
    ],
    altitude: 60,
    flightPattern: "Crosshatch Pattern",
    sensors: ["RGB Camera", "LiDAR", "Multispectral"],
    overlap: 80,
    speed: 4,
    dataCollectionFrequency: 3,
    estimatedDistance: 18.7,
    estimatedDuration: 150,
    priority: "high",
    weatherConditions: {
      temperature: 18,
      windSpeed: 12,
      visibility: "good",
      precipitation: "light clouds",
    },
  },
  {
    id: "M004",
    name: "Environmental Monitoring - Industrial Zone",
    description: "Environmental data collection with multispectral analysis for compliance monitoring",
    droneId: "D004",
    droneName: "Scout Delta",
    status: "paused",
    progress: 35,
    startTime: "2024-01-15T15:45:00Z",
    estimatedEndTime: "2024-01-15T17:15:00Z",
    surveyType: "Environmental Monitoring",
    location: "Site D - Industrial Area",
    coordinates: [
      { lat: 40.7505, lng: -73.9934 },
      { lat: 40.7515, lng: -73.9924 },
      { lat: 40.7525, lng: -73.9944 },
      { lat: 40.7495, lng: -73.9954 },
    ],
    altitude: 45,
    flightPattern: "Spiral Pattern",
    sensors: ["Multispectral", "Thermal Camera"],
    overlap: 65,
    speed: 6,
    dataCollectionFrequency: 4,
    estimatedDistance: 14.3,
    estimatedDuration: 90,
    priority: "medium",
    weatherConditions: {
      temperature: 25,
      windSpeed: 6,
      visibility: "good",
      precipitation: "none",
    },
  },
]

const mockSurveys: SurveyReport[] = [
  {
    id: "S001",
    missionId: "M001",
    name: "Site A Comprehensive Facility Inspection",
    date: "2024-01-15",
    duration: "1h 30m",
    distance: "12.5 km",
    area: "45 hectares",
    drone: "Mapper Beta",
    status: "completed",
    dataPoints: 1250,
    images: 340,
    thermalImages: 85,
    videoFootage: "2.5 hours",
    coverage: "98.5%",
    accuracy: "±2cm",
    weatherConditions: "Clear, 22°C, Wind 8km/h",
    anomaliesDetected: 3,
    reportUrl: "/reports/survey-001.pdf",
  },
  {
    id: "S002",
    missionId: "M002",
    name: "Perimeter Security Patrol - Zone B",
    date: "2024-01-15",
    duration: "1h 25m",
    distance: "8.2 km",
    area: "28 hectares",
    drone: "Guardian Echo",
    status: "completed",
    dataPoints: 890,
    images: 180,
    thermalImages: 45,
    videoFootage: "1.4 hours",
    coverage: "100%",
    accuracy: "±5cm",
    weatherConditions: "Clear, 20°C, Wind 5km/h",
    anomaliesDetected: 0,
    reportUrl: "/reports/survey-002.pdf",
  },
  {
    id: "S003",
    missionId: "M003",
    name: "Warehouse Complex Mapping Survey",
    date: "2024-01-14",
    duration: "2h 15m",
    distance: "18.7 km",
    area: "62 hectares",
    drone: "Surveyor Alpha",
    status: "completed",
    dataPoints: 2100,
    images: 520,
    thermalImages: 0,
    videoFootage: "2.2 hours",
    coverage: "99.2%",
    accuracy: "±1cm",
    weatherConditions: "Partly cloudy, 18°C, Wind 12km/h",
    anomaliesDetected: 1,
    reportUrl: "/reports/survey-003.pdf",
  },
  {
    id: "S004",
    missionId: "M004",
    name: "Environmental Monitoring - Industrial Zone",
    date: "2024-01-14",
    duration: "1h 45m",
    distance: "14.3 km",
    area: "38 hectares",
    drone: "Scout Delta",
    status: "completed",
    dataPoints: 1680,
    images: 290,
    thermalImages: 72,
    videoFootage: "1.7 hours",
    coverage: "96.8%",
    accuracy: "±3cm",
    weatherConditions: "Clear, 25°C, Wind 6km/h",
    anomaliesDetected: 2,
    reportUrl: "/reports/survey-004.pdf",
  },
]

const mockFlightStats: FlightStats[] = [
  { id: "FS001", month: "Jan", flights: 45, hours: 120, distance: 850, surveys: 38, efficiency: 92.5 },
  { id: "FS002", month: "Feb", flights: 52, hours: 140, distance: 920, surveys: 44, efficiency: 89.2 },
  { id: "FS003", month: "Mar", flights: 38, hours: 95, distance: 680, surveys: 32, efficiency: 91.8 },
  { id: "FS004", month: "Apr", flights: 61, hours: 165, distance: 1100, surveys: 55, efficiency: 88.7 },
  { id: "FS005", month: "May", flights: 48, hours: 130, distance: 890, surveys: 41, efficiency: 90.3 },
  { id: "FS006", month: "Jun", flights: 55, hours: 148, distance: 980, surveys: 47, efficiency: 93.1 },
]

const mockOrganizationStats: OrganizationStats = {
  id: "main",
  totalDrones: 5,
  totalMissions: 4,
  completedMissions: 2,
  totalSurveys: 4,
  totalFlightHours: 263.7,
  totalDistance: 4440,
  totalDataPoints: 5920,
  totalImages: 1330,
  averageEfficiency: 90.9,
}

// Helper function to simulate async operations
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Drone Operations with fallback
export const droneOperations = {
  getAll: async (): Promise<Drone[]> => {
    if (isMockDB) {
      await delay(500) // Simulate network delay
      return mockDrones
    }

    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.DRONES))
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Drone)
    } catch (error) {
      console.warn("Firebase error, using mock data:", error)
      return mockDrones
    }
  },

  getById: async (id: string): Promise<Drone | null> => {
    if (isMockDB) {
      await delay(200)
      return mockDrones.find((d) => d.id === id) || null
    }

    try {
      const docRef = doc(db, COLLECTIONS.DRONES, id)
      const docSnap = await getDoc(docRef)
      return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as Drone) : null
    } catch (error) {
      console.warn("Firebase error, using mock data:", error)
      return mockDrones.find((d) => d.id === id) || null
    }
  },

  add: async (drone: Omit<Drone, "id">): Promise<string> => {
    if (isMockDB) {
      await delay(300)
      const newId = `D${String(mockDrones.length + 1).padStart(3, "0")}`
      mockDrones.push({ ...drone, id: newId })
      return newId
    }

    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.DRONES), {
        ...drone,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.warn("Firebase error, using mock operation:", error)
      const newId = `D${String(mockDrones.length + 1).padStart(3, "0")}`
      mockDrones.push({ ...drone, id: newId })
      return newId
    }
  },

  update: async (id: string, updates: Partial<Drone>): Promise<void> => {
    if (isMockDB) {
      await delay(200)
      const index = mockDrones.findIndex((d) => d.id === id)
      if (index !== -1) {
        mockDrones[index] = { ...mockDrones[index], ...updates }
      }
      return
    }

    try {
      const docRef = doc(db, COLLECTIONS.DRONES, id)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.warn("Firebase error, using mock operation:", error)
      const index = mockDrones.findIndex((d) => d.id === id)
      if (index !== -1) {
        mockDrones[index] = { ...mockDrones[index], ...updates }
      }
    }
  },

  updateBattery: async (id: string, battery: number): Promise<void> => {
    return droneOperations.update(id, { battery })
  },

  updateLocation: async (id: string, coordinates: { lat: number; lng: number }, location: string): Promise<void> => {
    return droneOperations.update(id, { coordinates, location })
  },

  listen: (callback: (drones: Drone[]) => void) => {
    if (!isUsingFirebase() || !collection || !onSnapshot) {
      // Mock mode - provide immediate data and simulate updates
      console.log("Using mock drone listener")
      callback(mockDrones)

      // Simulate real-time updates
      const interval = setInterval(() => {
        // Simulate battery drain and status changes
        mockDrones.forEach((drone, index) => {
          if (drone.status === "in-mission" && drone.battery > 10) {
            mockDrones[index] = { ...drone, battery: Math.max(10, drone.battery - Math.random() * 2) }
          }
        })
        callback([...mockDrones])
      }, 10000) // Update every 10 seconds

      return () => {
        console.log("Unsubscribing from mock drone updates")
        clearInterval(interval)
      }
    }

    try {
      console.log("Setting up Firebase drone listener")
      return onSnapshot(
        collection(db, COLLECTIONS.DRONES),
        (snapshot: any) => {
          const drones = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }) as Drone)
          console.log("Received drone updates from Firebase:", drones.length)
          callback(drones)
        },
        (error: any) => {
          console.error("Firebase listener error, falling back to mock:", error)
          callback(mockDrones)
        },
      )
    } catch (error) {
      console.warn("Firebase listener setup failed, using mock data:", error)
      callback(mockDrones)
      return () => {}
    }
  },
}

// Mission Operations with fallback
export const missionOperations = {
  getAll: async (): Promise<Mission[]> => {
    if (isMockDB) {
      await delay(500)
      return mockMissions
    }

    try {
      const querySnapshot = await getDocs(query(collection(db, COLLECTIONS.MISSIONS), orderBy("createdAt", "desc")))
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Mission)
    } catch (error) {
      console.warn("Firebase error, using mock data:", error)
      return mockMissions
    }
  },

  getByStatus: async (status: string): Promise<Mission[]> => {
    if (isMockDB) {
      await delay(300)
      return mockMissions.filter((m) => m.status === status)
    }

    try {
      const q = query(collection(db, COLLECTIONS.MISSIONS), where("status", "==", status))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Mission)
    } catch (error) {
      console.warn("Firebase error, using mock data:", error)
      return mockMissions.filter((m) => m.status === status)
    }
  },

  getActiveMissions: async (): Promise<Mission[]> => {
    if (isMockDB) {
      await delay(300)
      return mockMissions.filter((m) => m.status === "in-progress" || m.status === "scheduled")
    }

    try {
      const q = query(
        collection(db, COLLECTIONS.MISSIONS),
        where("status", "in", ["in-progress", "scheduled"]),
        orderBy("startTime", "asc"),
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Mission)
    } catch (error) {
      console.warn("Firebase error, using mock data:", error)
      return mockMissions.filter((m) => m.status === "in-progress" || m.status === "scheduled")
    }
  },

  add: async (mission: Omit<Mission, "id">): Promise<string> => {
    if (isMockDB) {
      await delay(300)
      const newId = `M${String(mockMissions.length + 1).padStart(3, "0")}`
      mockMissions.push({ ...mission, id: newId })
      return newId
    }

    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.MISSIONS), {
        ...mission,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.warn("Firebase error, using mock operation:", error)
      const newId = `M${String(mockMissions.length + 1).padStart(3, "0")}`
      mockMissions.push({ ...mission, id: newId })
      return newId
    }
  },

  update: async (id: string, updates: Partial<Mission>): Promise<void> => {
    if (isMockDB) {
      await delay(200)
      const index = mockMissions.findIndex((m) => m.id === id)
      if (index !== -1) {
        mockMissions[index] = { ...mockMissions[index], ...updates }
      }
      return
    }

    try {
      const docRef = doc(db, COLLECTIONS.MISSIONS, id)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.warn("Firebase error, using mock operation:", error)
      const index = mockMissions.findIndex((m) => m.id === id)
      if (index !== -1) {
        mockMissions[index] = { ...mockMissions[index], ...updates }
      }
    }
  },

  updateProgress: async (id: string, progress: number): Promise<void> => {
    const updates: any = { progress }
    if (progress >= 100) {
      updates.status = "completed"
      updates.actualEndTime = new Date().toISOString()
    }
    return missionOperations.update(id, updates)
  },

  listen: (callback: (missions: Mission[]) => void) => {
    if (isMockDB) {
      callback(mockMissions)
      const interval = setInterval(() => {
        callback([...mockMissions])
      }, 5000)
      return () => clearInterval(interval)
    }

    try {
      return onSnapshot(query(collection(db, COLLECTIONS.MISSIONS), orderBy("createdAt", "desc")), (snapshot) => {
        const missions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Mission)
        callback(missions)
      })
    } catch (error) {
      console.warn("Firebase error, using mock data:", error)
      callback(mockMissions)
      return () => {}
    }
  },
}

// Survey Operations with fallback
export const surveyOperations = {
  getAll: async (): Promise<SurveyReport[]> => {
    if (isMockDB) {
      await delay(500)
      return mockSurveys
    }

    try {
      const querySnapshot = await getDocs(query(collection(db, COLLECTIONS.SURVEYS), orderBy("date", "desc")))
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as SurveyReport)
    } catch (error) {
      console.warn("Firebase error, using mock data:", error)
      return mockSurveys
    }
  },

  add: async (survey: Omit<SurveyReport, "id">): Promise<string> => {
    if (isMockDB) {
      await delay(300)
      const newId = `S${String(mockSurveys.length + 1).padStart(3, "0")}`
      mockSurveys.push({ ...survey, id: newId })
      return newId
    }

    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.SURVEYS), {
        ...survey,
        createdAt: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.warn("Firebase error, using mock operation:", error)
      const newId = `S${String(mockSurveys.length + 1).padStart(3, "0")}`
      mockSurveys.push({ ...survey, id: newId })
      return newId
    }
  },

  getByDateRange: async (startDate: string, endDate: string): Promise<SurveyReport[]> => {
    if (isMockDB) {
      await delay(300)
      return mockSurveys.filter((s) => s.date >= startDate && s.date <= endDate)
    }

    try {
      const q = query(
        collection(db, COLLECTIONS.SURVEYS),
        where("date", ">=", startDate),
        where("date", "<=", endDate),
        orderBy("date", "desc"),
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as SurveyReport)
    } catch (error) {
      console.warn("Firebase error, using mock data:", error)
      return mockSurveys.filter((s) => s.date >= startDate && s.date <= endDate)
    }
  },
}

// Flight Stats Operations with fallback
export const flightStatsOperations = {
  getAll: async (): Promise<FlightStats[]> => {
    if (isMockDB) {
      await delay(400)
      return mockFlightStats
    }

    try {
      const querySnapshot = await getDocs(query(collection(db, COLLECTIONS.FLIGHT_STATS), orderBy("month", "asc")))
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as FlightStats)
    } catch (error) {
      console.warn("Firebase error, using mock data:", error)
      return mockFlightStats
    }
  },

  add: async (stats: Omit<FlightStats, "id">): Promise<string> => {
    if (isMockDB) {
      await delay(200)
      const newId = `FS${String(mockFlightStats.length + 1).padStart(3, "0")}`
      mockFlightStats.push({ ...stats, id: newId })
      return newId
    }

    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.FLIGHT_STATS), stats)
      return docRef.id
    } catch (error) {
      console.warn("Firebase error, using mock operation:", error)
      const newId = `FS${String(mockFlightStats.length + 1).padStart(3, "0")}`
      mockFlightStats.push({ ...stats, id: newId })
      return newId
    }
  },
}

// Organization Stats Operations with fallback
export const organizationStatsOperations = {
  get: async (): Promise<OrganizationStats | null> => {
    if (isMockDB) {
      await delay(300)
      return mockOrganizationStats
    }

    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.ORGANIZATION_STATS))
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        return { id: doc.id, ...doc.data() } as OrganizationStats
      }
      return null
    } catch (error) {
      console.warn("Firebase error, using mock data:", error)
      return mockOrganizationStats
    }
  },

  listen: (callback: (stats: OrganizationStats | null) => void) => {
    if (isMockDB) {
      callback(mockOrganizationStats)
      const interval = setInterval(() => {
        callback({ ...mockOrganizationStats })
      }, 10000)
      return () => clearInterval(interval)
    }

    try {
      return onSnapshot(collection(db, COLLECTIONS.ORGANIZATION_STATS), (snapshot) => {
        if (!snapshot.empty) {
          const doc = snapshot.docs[0]
          callback({ id: doc.id, ...doc.data() } as OrganizationStats)
        } else {
          callback(null)
        }
      })
    } catch (error) {
      console.warn("Firebase error, using mock data:", error)
      callback(mockOrganizationStats)
      return () => {}
    }
  },
}

// Mission Pattern Operations with fallback
export const missionPatternOperations = {
  getAll: async (): Promise<MissionPattern[]> => {
    const mockPatterns: MissionPattern[] = [
      {
        id: "MP001",
        name: "Grid Pattern",
        description: "Systematic grid coverage for comprehensive area mapping",
        type: "grid",
        parameters: { spacing: 50, overlap: 70, direction: "north-south" },
        efficiency: 95,
        bestFor: ["mapping", "inspection", "surveying"],
      },
      {
        id: "MP002",
        name: "Crosshatch Pattern",
        description: "Overlapping grid pattern for maximum coverage and accuracy",
        type: "crosshatch",
        parameters: { spacing: 40, overlap: 80, angles: [0, 90] },
        efficiency: 98,
        bestFor: ["high-precision mapping", "detailed inspection"],
      },
      {
        id: "MP003",
        name: "Perimeter Pattern",
        description: "Follow boundary lines for security and perimeter monitoring",
        type: "perimeter",
        parameters: { offset: 10, loops: 2, direction: "clockwise" },
        efficiency: 85,
        bestFor: ["security", "perimeter monitoring", "boundary surveys"],
      },
      {
        id: "MP004",
        name: "Spiral Pattern",
        description: "Spiral from center outward for focused area coverage",
        type: "spiral",
        parameters: { startRadius: 20, spacing: 30, direction: "outward" },
        efficiency: 88,
        bestFor: ["environmental monitoring", "point-of-interest surveys"],
      },
    ]

    if (isMockDB) {
      await delay(300)
      return mockPatterns
    }

    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.MISSION_PATTERNS))
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as MissionPattern)
    } catch (error) {
      console.warn("Firebase error, using mock data:", error)
      return mockPatterns
    }
  },

  add: async (pattern: Omit<MissionPattern, "id">): Promise<string> => {
    if (isMockDB) {
      await delay(200)
      return `MP${String(Date.now()).slice(-3)}`
    }

    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.MISSION_PATTERNS), pattern)
      return docRef.id
    } catch (error) {
      console.warn("Firebase error, using mock operation:", error)
      return `MP${String(Date.now()).slice(-3)}`
    }
  },
}

// Initialize database with error handling
export const initializeDatabase = async () => {
  if (isMockDB) {
    console.log("Using mock database - Firebase not available")
    return
  }

  try {
    const dronesSnapshot = await getDocs(collection(db, COLLECTIONS.DRONES))
    if (dronesSnapshot.empty) {
      console.log("Database is empty, would seed with data in production")
      // In production, you would seed the database here
    } else {
      console.log("Database already contains data")
    }
  } catch (error) {
    console.warn("Error checking database, using mock data:", error)
  }
}
