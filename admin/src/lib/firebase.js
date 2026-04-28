import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`
}

const requiredValues = Object.values(firebaseConfig)
export const isFirebaseConfigured = requiredValues.every((value) => Boolean(value))

let auth = null
let database = null

if (isFirebaseConfigured) {
  console.log('🔧 Admin Firebase config loaded:', firebaseConfig.projectId)
  const app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  database = getDatabase(app)
  console.log('✅ Admin Firebase auth and database initialized')
  console.log('🔧 Database URL:', firebaseConfig.databaseURL)
} else {
  console.error('❌ Admin Firebase env values are missing!')
  console.error('Config values:', firebaseConfig)
}

export { auth, database }
