import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { 
  SecurityLogger, 
  rateLimiter, 
  isSessionValid, 
  extendSession,
  sessionTimeout,
  generateCSRFToken
} from '../utils/security'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return () => {}
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Validate user session
        const sessionData = JSON.parse(localStorage.getItem('session') || '{}')
        
        // Check for suspicious activity
        if (sessionData.userId && sessionData.userId !== currentUser.uid) {
          SecurityLogger.logSecurityEvent('Session hijacking attempt detected', {
            sessionUserId: sessionData.userId,
            currentUserUid: currentUser.uid,
            email: currentUser.email
          })
          
          // Force logout for security
          signOut(auth).then(() => {
            localStorage.clear()
            sessionStorage.clear()
            setSessionExpired(true)
          })
          return
        }

        // Create secure session
        const secureSession = {
          userId: currentUser.uid,
          email: currentUser.email,
          expiresAt: Date.now() + sessionTimeout,
          csrfToken: generateCSRFToken(),
          lastActivity: Date.now(),
          loginTime: Date.now()
        }
        
        localStorage.setItem('session', JSON.stringify(secureSession))
        setUser(currentUser)
        
        SecurityLogger.log('info', 'User authenticated successfully', {
          userId: currentUser.uid,
          email: currentUser.email
        })
      } else {
        // Clear session on logout
        localStorage.removeItem('session')
        sessionStorage.clear()
        setUser(null)
      }
      setLoading(false)
    })

    // Session timeout monitoring
    const sessionMonitor = setInterval(() => {
      if (user && !isSessionValid()) {
        SecurityLogger.logSecurityEvent('Session expired', {
          userId: user.uid,
          timestamp: Date.now()
        })
        
        signOut(auth).then(() => {
          localStorage.clear()
          sessionStorage.clear()
          setSessionExpired(true)
          setUser(null)
        })
      }
    }, 60000) // Check every minute

    return () => {
      unsubscribe()
      clearInterval(sessionMonitor)
    }
  }, [])

  const logout = async () => {
    if (!auth) return Promise.resolve()
    
    try {
      // Rate limiting for logout attempts
      const logoutKey = `logout_${user?.uid || 'anonymous'}`
      if (!rateLimiter.isAllowed(logoutKey)) {
        SecurityLogger.logSecurityEvent('Logout rate limit exceeded', {
          userId: user?.uid
        })
        throw new Error('Too many logout attempts. Please try again later.')
      }

      await signOut(auth)
      
      // Clear all session data
      localStorage.removeItem('session')
      sessionStorage.clear()
      setUser(null)
      setSessionExpired(false)
      
      SecurityLogger.log('info', 'User logged out successfully', {
        userId: user?.uid
      })
    } catch (error) {
      SecurityLogger.logError(error, { context: 'logout' })
      throw error
    }
  }

  const extendUserSession = () => {
    if (user && isSessionValid()) {
      extendSession()
      SecurityLogger.log('info', 'Session extended', {
        userId: user.uid
      })
    }
  }

  const refreshSession = async () => {
    if (!auth || !user) return false
    
    try {
      await user.getIdToken(true) // Force token refresh
      extendUserSession()
      return true
    } catch (error) {
      SecurityLogger.logError(error, { context: 'session_refresh' })
      return false
    }
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        logout, 
        sessionExpired,
        extendSession: extendUserSession,
        refreshSession
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
