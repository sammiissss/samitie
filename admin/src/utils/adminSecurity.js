// Admin Security Utilities - Enhanced Security for Admin Dashboard

// Input validation and sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .slice(0, 1000) // Limit input length
}

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password) => {
  return password && password.length >= 6
}

export const validateMessage = (message) => {
  return message && message.trim().length >= 1 && message.length <= 10000
}

// Session management
export const generateSecureToken = () => {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export const setSecureSession = (user) => {
  const sessionData = {
    user: {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified
    },
    loginTime: Date.now(),
    token: generateSecureToken(),
    lastActivity: Date.now()
  }
  
  sessionStorage.setItem('adminSession', JSON.stringify(sessionData))
  return sessionData.token
}

export const getSecureSession = () => {
  try {
    const sessionData = sessionStorage.getItem('adminSession')
    if (!sessionData) return null
    
    const session = JSON.parse(sessionData)
    
    // Check session timeout (2 hours)
    const sessionAge = Date.now() - session.loginTime
    if (sessionAge > 2 * 60 * 60 * 1000) {
      sessionStorage.removeItem('adminSession')
      return null
    }
    
    // Update last activity
    session.lastActivity = Date.now()
    sessionStorage.setItem('adminSession', JSON.stringify(session))
    
    return session
  } catch (error) {
    console.error('Session validation error:', error)
    sessionStorage.removeItem('adminSession')
    return null
  }
}

export const clearSecureSession = () => {
  sessionStorage.removeItem('adminSession')
  sessionStorage.removeItem('adminLoggedIn')
  sessionStorage.removeItem('adminEmail')
  sessionStorage.removeItem('adminLoginTime')
  sessionStorage.removeItem('adminCsrfToken')
}

// Rate limiting
export const createRateLimiter = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map()
  
  return {
    isAllowed: (key) => {
      const now = Date.now()
      const userAttempts = attempts.get(key) || []
      
      // Remove old attempts outside the window
      const validAttempts = userAttempts.filter(time => now - time < windowMs)
      
      if (validAttempts.length >= maxAttempts) {
        return false
      }
      
      validAttempts.push(now)
      attempts.set(key, validAttempts)
      return true
    },
    
    reset: (key) => {
      attempts.delete(key)
    }
  }
}

// CSRF protection
export const generateCSRFToken = () => {
  const token = generateSecureToken()
  sessionStorage.setItem('adminCsrfToken', token)
  return token
}

export const validateCSRFToken = (providedToken) => {
  const storedToken = sessionStorage.getItem('adminCsrfToken')
  return providedToken && storedToken && providedToken === storedToken
}

// Security headers and meta tags
export const getSecurityHeaders = () => {
  return {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://*.firebaseio.com https://*.firebase.com;",
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  }
}

// Security logging
export const SecurityLogger = {
  log: (level, message, data = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    console.log(`[SECURITY-${level.toUpperCase()}] ${message}`, logEntry)
    
    // Store critical security events
    if (level === 'error' || level === 'warning') {
      const securityLogs = JSON.parse(localStorage.getItem('securityLogs') || '[]')
      securityLogs.push(logEntry)
      
      // Keep only last 100 security logs
      if (securityLogs.length > 100) {
        securityLogs.shift()
      }
      
      localStorage.setItem('securityLogs', JSON.stringify(securityLogs))
    }
  },
  
  logError: (error, context = {}) => {
    SecurityLogger.log('error', error.message, { ...context, stack: error.stack })
  },
  
  logSecurityEvent: (event, data = {}) => {
    SecurityLogger.log('warning', `Security event: ${event}`, data)
  }
}

// Input validation for admin operations
export const validateAdminInput = {
  email: (email) => {
    if (!validateEmail(email)) {
      return { isValid: false, error: 'Invalid email address' }
    }
    return { isValid: true, sanitized: email.toLowerCase().trim() }
  },
  
  password: (password) => {
    if (!validatePassword(password)) {
      return { isValid: false, error: 'Password must be at least 6 characters' }
    }
    return { isValid: true, sanitized: password }
  },
  
  message: (message) => {
    const sanitized = sanitizeInput(message)
    if (!validateMessage(sanitized)) {
      return { isValid: false, error: 'Message must be between 1 and 10000 characters' }
    }
    return { isValid: true, sanitized }
  },
  
  reply: (reply) => {
    const sanitized = sanitizeInput(reply)
    if (!validateMessage(sanitized)) {
      return { isValid: false, error: 'Reply must be between 1 and 10000 characters' }
    }
    return { isValid: true, sanitized }
  }
}

// Rate limiters for different admin actions
export const rateLimiters = {
  login: createRateLimiter(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  register: createRateLimiter(3, 60 * 60 * 1000), // 3 attempts per hour
  reply: createRateLimiter(20, 60 * 1000), // 20 replies per minute
  delete: createRateLimiter(10, 60 * 1000) // 10 deletions per minute
}

export default {
  sanitizeInput,
  validateEmail,
  validatePassword,
  validateMessage,
  generateSecureToken,
  setSecureSession,
  getSecureSession,
  clearSecureSession,
  createRateLimiter,
  generateCSRFToken,
  validateCSRFToken,
  getSecurityHeaders,
  SecurityLogger,
  validateAdminInput,
  rateLimiters
}
