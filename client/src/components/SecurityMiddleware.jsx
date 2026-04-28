import { useEffect } from 'react'
import { cspHeaders, SecurityLogger } from '../utils/security'

function SecurityMiddleware({ children }) {
  useEffect(() => {
    // Apply security headers
    const applySecurityHeaders = () => {
      Object.entries(cspHeaders).forEach(([header, value]) => {
        // For client-side, we can't set actual HTTP headers,
        // but we can implement CSP meta tags and security measures
        if (header === 'Content-Security-Policy') {
          // Create or update CSP meta tag
          let cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
          if (!cspMeta) {
            cspMeta = document.createElement('meta')
            cspMeta.httpEquiv = 'Content-Security-Policy'
            document.head.appendChild(cspMeta)
          }
          cspMeta.content = value
        }
      })
    }

    // Initialize security monitoring
    const initializeSecurity = () => {
      // Prevent right-click (optional security measure)
      const preventContextMenu = (e) => {
        e.preventDefault()
        SecurityLogger.logSecurityEvent('Context menu prevented', {
          x: e.clientX,
          y: e.clientY
        })
      }

      // Prevent text selection on sensitive elements
      const preventSelection = (e) => {
        if (e.target.closest('.secure-content')) {
          e.preventDefault()
          return false
        }
      }

      // Monitor for console access attempts
      const originalConsole = { ...console }
      let consoleAccessCount = 0
      
      const detectConsoleAccess = () => {
        consoleAccessCount++
        if (consoleAccessCount > 10) {
          SecurityLogger.logSecurityEvent('Excessive console access', {
            count: consoleAccessCount,
            timestamp: Date.now()
          })
        }
      }

      // Override console methods to detect access
      Object.keys(originalConsole).forEach(method => {
        console[method] = function(...args) {
          detectConsoleAccess()
          return originalConsole[method].apply(this, args)
        }
      })

      // Add event listeners
      document.addEventListener('contextmenu', preventContextMenu)
      document.addEventListener('selectstart', preventSelection)

      // Cleanup function
      return () => {
        document.removeEventListener('contextmenu', preventContextMenu)
        document.removeEventListener('selectstart', preventSelection)
        // Restore original console
        Object.assign(console, originalConsole)
      }
    }

    // Detect and prevent common attack patterns
    const detectAttackPatterns = () => {
      // Monitor for suspicious URL parameters
      const urlParams = new URLSearchParams(window.location.search)
      const suspiciousParams = ['<script', 'javascript:', 'onerror=', 'onload=', 'eval(']
      
      suspiciousParams.forEach(param => {
        urlParams.forEach((value, key) => {
          if (value.toLowerCase().includes(param.toLowerCase())) {
            SecurityLogger.logSecurityEvent('Suspicious URL parameter detected', {
              parameter: key,
              value: value.substring(0, 100), // Limit length for logging
              url: window.location.href
            })
          }
        })
      })

      // Monitor for suspicious referrers
      const referrer = document.referrer
      if (referrer && !referrer.includes(window.location.hostname)) {
        SecurityLogger.logSecurityEvent('External referrer detected', {
          referrer: referrer.substring(0, 200),
          timestamp: Date.now()
        })
      }
    }

    // Implement session security
    const implementSessionSecurity = () => {
      // Check for session hijacking attempts
      const checkSessionIntegrity = () => {
        const sessionData = JSON.parse(localStorage.getItem('session') || '{}')
        const currentFingerprint = generateFingerprint()
        
        if (sessionData.fingerprint && sessionData.fingerprint !== currentFingerprint) {
          SecurityLogger.logSecurityEvent('Session fingerprint mismatch', {
            stored: sessionData.fingerprint,
            current: currentFingerprint,
            timestamp: Date.now()
          })
          
          // Clear suspicious session
          localStorage.removeItem('session')
          sessionStorage.clear()
          window.location.reload()
        }
      }

      // Generate browser fingerprint
      const generateFingerprint = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        ctx.textBaseline = 'top'
        ctx.font = '14px Arial'
        ctx.fillText('Security fingerprint', 2, 2)
        
        return [
          navigator.userAgent,
          navigator.language,
          screen.width + 'x' + screen.height,
          new Date().getTimezoneOffset(),
          canvas.toDataURL()
        ].join('|')
      }

      // Check session integrity periodically
      const interval = setInterval(checkSessionIntegrity, 30000) // Every 30 seconds
      
      return () => clearInterval(interval)
    }

    // Apply all security measures
    applySecurityHeaders()
    const cleanupSecurity = initializeSecurity()
    const cleanupSession = implementSessionSecurity()
    detectAttackPatterns()

    // Cleanup on unmount
    return () => {
      if (cleanupSecurity) cleanupSecurity()
      if (cleanupSession) cleanupSession()
    }
  }, [])

  // Monitor for XSS attempts in real-time
  useEffect(() => {
    const monitorXSS = () => {
      // Monitor DOM changes for potential XSS
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check for suspicious attributes
              const suspiciousAttrs = ['onload', 'onerror', 'onclick', 'onmouseover']
              suspiciousAttrs.forEach(attr => {
                if (node.hasAttribute && node.hasAttribute(attr)) {
                  const value = node.getAttribute(attr)
                  if (value && (value.includes('javascript:') || value.includes('eval'))) {
                    SecurityLogger.logSecurityEvent('Potential XSS attempt detected', {
                      element: node.tagName,
                      attribute: attr,
                      value: value.substring(0, 100)
                    })
                    // Remove the dangerous attribute
                    node.removeAttribute(attr)
                  }
                }
              })

              // Check for script elements
              if (node.tagName === 'SCRIPT') {
                const content = node.textContent || ''
                if (content.includes('eval(') || content.includes('javascript:')) {
                  SecurityLogger.logSecurityEvent('Suspicious script content detected', {
                    content: content.substring(0, 200)
                  })
                  node.remove()
                }
              }
            }
          })
        })
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true
      })

      return () => observer.disconnect()
    }

    const cleanupXSS = monitorXSS()
    return () => cleanupXSS()
  }, [])

  return <>{children}</>
}

export default SecurityMiddleware
