import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'
import { SecurityLogger } from '../utils/security'

// Validate Firebase configuration
const validateFirebaseConfig = (config) => {
  const required = ['apiKey', 'authDomain', 'projectId', 'appId']
  const missing = required.filter(key => !config[key])
  
  if (missing.length > 0) {
    SecurityLogger.logSecurityEvent('Missing Firebase configuration', { missing })
    return false
  }
  
  // Additional validation for security
  if (config.apiKey && config.apiKey.length < 20) {
    SecurityLogger.logSecurityEvent('Invalid Firebase API key format detected')
    return false
  }
  
  return true
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`,
  // Add security settings
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || null
}

// Use validation function instead of simple check
export const isFirebaseConfigured = validateFirebaseConfig(firebaseConfig)

let auth = null
let database = null

if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig)
    
    // Configure auth with security settings
    auth = getAuth(app)
    auth.tenantId = import.meta.env.VITE_FIREBASE_TENANT_ID || null
    
    // Configure database with security rules
    database = getDatabase(app)
    
    SecurityLogger.log('info', 'Firebase initialized successfully', {
      projectId: firebaseConfig.projectId,
      hasAuth: !!auth,
      hasDatabase: !!database
    })
  } catch (error) {
    SecurityLogger.logError(error, { context: 'firebase_initialization' })
    console.warn('Firebase initialization failed. App will run without auth/data features.')
  }
} else {
  SecurityLogger.logSecurityEvent('Firebase not properly configured', {
    hasApiKey: !!firebaseConfig.apiKey,
    hasProjectId: !!firebaseConfig.projectId,
    hasAppId: !!firebaseConfig.appId
  })
  console.warn('Firebase env values are missing or invalid. App will run without auth/data features.')
}

export { auth, database }
