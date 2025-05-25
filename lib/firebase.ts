// Firebase configuration and initialization with enhanced error handling
import { initializeApp, getApps } from "firebase/app"
import { getFirestore, enableNetwork } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyCIfWDfRabPsh2RUQM1l-shVbvxO2n-MXU",
  authDomain: "newflyt-7a9f5.firebaseapp.com",
  projectId: "newflyt-7a9f5",
  storageBucket: "newflyt-7a9f5.firebasestorage.app",
  messagingSenderId: "766006709457",
  appId: "1:766006709457:web:02f2ca7f4f30cb27eb49f0",
  measurementId: "G-VPBMBKLCFS",
  databaseURL: "https://newflyt-7a9f5-default-rtdb.firebaseio.com",
}

// Global variables for Firebase state
let db: any = null
let app: any = null
let isFirebaseAvailable = false

// Create mock database interface
const createMockDB = () => ({
  _isMock: true,
  collection: (name: string) => ({
    doc: (id?: string) => ({
      set: async (data: any) => {
        console.log(`Mock: Setting document in ${name}:`, data)
        return Promise.resolve()
      },
      get: async () => {
        console.log(`Mock: Getting document from ${name}`)
        return Promise.resolve({
          exists: () => false,
          data: () => ({}),
          id: id || "mock-id",
        })
      },
      update: async (data: any) => {
        console.log(`Mock: Updating document in ${name}:`, data)
        return Promise.resolve()
      },
      delete: async () => {
        console.log(`Mock: Deleting document from ${name}`)
        return Promise.resolve()
      },
      onSnapshot: (callback: any) => {
        console.log(`Mock: Setting up snapshot listener for ${name}`)
        // Simulate initial call
        setTimeout(
          () =>
            callback({
              exists: () => false,
              data: () => ({}),
              id: id || "mock-id",
            }),
          100,
        )
        // Return unsubscribe function
        return () => console.log(`Mock: Unsubscribing from ${name}`)
      },
    }),
    add: async (data: any) => {
      console.log(`Mock: Adding document to ${name}:`, data)
      return Promise.resolve({ id: `mock-${Date.now()}` })
    },
    get: async () => {
      console.log(`Mock: Getting collection ${name}`)
      return Promise.resolve({
        docs: [],
        empty: true,
        forEach: () => {},
        size: 0,
      })
    },
    where: (field: string, operator: string, value: any) => ({
      get: async () => {
        console.log(`Mock: Querying ${name} where ${field} ${operator} ${value}`)
        return Promise.resolve({
          docs: [],
          empty: true,
          forEach: () => {},
          size: 0,
        })
      },
      onSnapshot: (callback: any) => {
        console.log(`Mock: Setting up query snapshot listener for ${name}`)
        setTimeout(
          () =>
            callback({
              docs: [],
              empty: true,
              forEach: () => {},
              size: 0,
            }),
          100,
        )
        return () => console.log(`Mock: Unsubscribing from query ${name}`)
      },
    }),
    orderBy: (field: string, direction?: string) => ({
      get: async () => {
        console.log(`Mock: Getting ordered collection ${name} by ${field}`)
        return Promise.resolve({
          docs: [],
          empty: true,
          forEach: () => {},
          size: 0,
        })
      },
      onSnapshot: (callback: any) => {
        console.log(`Mock: Setting up ordered snapshot listener for ${name}`)
        setTimeout(
          () =>
            callback({
              docs: [],
              empty: true,
              forEach: () => {},
              size: 0,
            }),
          100,
        )
        return () => console.log(`Mock: Unsubscribing from ordered ${name}`)
      },
    }),
    onSnapshot: (callback: any) => {
      console.log(`Mock: Setting up collection snapshot listener for ${name}`)
      setTimeout(
        () =>
          callback({
            docs: [],
            empty: true,
            forEach: () => {},
            size: 0,
          }),
        100,
      )
      return () => console.log(`Mock: Unsubscribing from collection ${name}`)
    },
  }),
})

// Initialize Firebase with comprehensive error handling
const initializeFirebase = async () => {
  try {
    console.log("Attempting to initialize Firebase...")

    // Check if Firebase is already initialized
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
      console.log("Firebase app initialized successfully")
    } else {
      app = getApps()[0]
      console.log("Using existing Firebase app")
    }

    // Try to initialize Firestore
    try {
      db = getFirestore(app)
      console.log("Firestore initialized")

      // Test Firestore availability
      await enableNetwork(db)
      console.log("Firestore network enabled")

      isFirebaseAvailable = true
      console.log("✅ Firebase is fully available and connected")
    } catch (firestoreError) {
      console.warn("Firestore initialization failed:", firestoreError)
      throw firestoreError
    }
  } catch (error) {
    console.error("Firebase initialization failed:", error)
    console.log("🔄 Falling back to mock database mode")

    // Create mock database
    db = createMockDB()
    isFirebaseAvailable = false
  }
}

// Initialize Firebase immediately
initializeFirebase()

// Export database instance and availability status
export { db, isFirebaseAvailable }
export default app

// Helper function to check if we're using real Firebase
export const isUsingFirebase = () => isFirebaseAvailable && db && !db._isMock

// Helper function to get connection status
export const getConnectionStatus = () => ({
  isConnected: isFirebaseAvailable,
  isUsingMock: !isFirebaseAvailable || (db && db._isMock),
  database: isFirebaseAvailable ? "Firebase" : "Mock",
})
