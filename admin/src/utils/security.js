// Security utility library for admin website protection

// Input validation and sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'");
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateName = (name) => {
  // Allow only letters, spaces, and common punctuation
  const nameRegex = /^[a-zA-Z\s\-',.]+$/;
  return nameRegex.test(name) && name.length >= 2 && name.length <= 100;
};

export const validateMessage = (message) => {
  // Allow reasonable characters but limit length
  return message.length >= 10 && message.length <= 1000;
};

// XSS Protection
export const escapeHtml = (text) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

// Rate limiting implementation
class RateLimiter {
  constructor(maxRequests = 5, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  isAllowed(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }
    
    const userRequests = this.requests.get(identifier);
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart);
    this.requests.set(identifier, validRequests);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    return true;
  }

  cleanup() {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    for (const [identifier, timestamps] of this.requests.entries()) {
      const validRequests = timestamps.filter(timestamp => timestamp > windowStart);
      if (validRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, validRequests);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// CSRF Protection
export const generateCSRFToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const validateCSRFToken = (token, storedToken) => {
  return token && storedToken && token === storedToken;
};

// Error handling and logging
export class SecurityLogger {
  static log(level, message, details = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href,
      site: 'admin'
    };
    
    // In production, send to secure logging service
    if (process.env.NODE_ENV === 'production') {
      // Send to secure logging endpoint
      this.sendToSecureLogger(logEntry);
    } else {
      console[level](`[ADMIN]`, logEntry);
    }
  }
  
  static sendToSecureLogger(logEntry) {
    // Implementation for production logging service
    // This would send logs to a secure monitoring service
    fetch('/api/admin-security-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(logEntry)
    }).catch(console.error);
  }
  
  static logSecurityEvent(event, details) {
    this.log('warn', `Admin Security Event: ${event}`, details);
  }
  
  static logError(error, context) {
    this.log('error', error.message, { stack: error.stack, context, site: 'admin' });
  }
}

// Authentication Security
export const validatePassword = (password) => {
  // Minimum 8 characters, at least one uppercase, one lowercase, one number, and one special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

export const hashPassword = async (password) => {
  // In a real application, this would be done server-side
  // This is a client-side placeholder
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'admin-church-salt-2024');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Session Security
export const sessionTimeout = 30 * 60 * 1000; // 30 minutes

export const extendSession = () => {
  const sessionData = JSON.parse(localStorage.getItem('adminSession') || '{}');
  sessionData.expiresAt = Date.now() + sessionTimeout;
  localStorage.setItem('adminSession', JSON.stringify(sessionData));
};

export const isSessionValid = () => {
  const sessionData = JSON.parse(localStorage.getItem('adminSession') || '{}');
  return sessionData.expiresAt && sessionData.expiresAt > Date.now();
};

// Input validation middleware
export const validateFormInput = (fieldName, value) => {
  const sanitizedValue = sanitizeInput(value);
  
  switch (fieldName) {
    case 'name':
      return {
        isValid: validateName(sanitizedValue),
        sanitized: sanitizedValue,
        error: validateName(sanitizedValue) ? '' : 'Invalid name format'
      };
    
    case 'email':
      return {
        isValid: validateEmail(sanitizedValue),
        sanitized: sanitizedValue.toLowerCase(),
        error: validateEmail(sanitizedValue) ? '' : 'Invalid email address'
      };
    
    case 'message':
      return {
        isValid: validateMessage(sanitizedValue),
        sanitized: sanitizedValue,
        error: validateMessage(sanitizedValue) ? '' : 'Message must be between 10 and 1000 characters'
      };
    
    case 'password':
      return {
        isValid: validatePassword(sanitizedValue),
        sanitized: sanitizedValue,
        error: validatePassword(sanitizedValue) ? '' : 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
      };
    
    default:
      return {
        isValid: true,
        sanitized: sanitizedValue,
        error: ''
      };
  }
};

// Security monitoring
export const SecurityMonitor = {
  init() {
    this.monitorFailedLogins();
    this.monitorRapidRequests();
    this.monitorXSSAttempts();
  },
  
  monitorFailedLogins() {
    let failedAttempts = 0;
    
    document.addEventListener('admin-login-attempt', (event) => {
      if (!event.detail.success) {
        failedAttempts++;
        if (failedAttempts >= 5) {
          SecurityLogger.logSecurityEvent('Multiple failed admin login attempts', {
            attempts: failedAttempts,
            timestamp: Date.now()
          });
        }
      } else {
        failedAttempts = 0;
      }
    });
  },
  
  monitorRapidRequests() {
    let requestCount = 0;
    const resetCount = () => { requestCount = 0; };
    
    setInterval(resetCount, 60000); // Reset every minute
    
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      requestCount++;
      
      if (requestCount > 50) { // Lower threshold for admin site
        SecurityLogger.logSecurityEvent('Suspicious rapid admin requests', {
          requestCount,
          timestamp: Date.now()
        });
      }
      
      return originalFetch.apply(this, args);
    };
  },
  
  monitorXSSAttempts() {
    const originalConsoleError = console.error;
    console.error = function(...args) {
      const message = args.join(' ');
      
      if (message.includes('XSS') || message.includes('Cross-site scripting')) {
        SecurityLogger.logSecurityEvent('Potential admin XSS attempt', {
          message,
          timestamp: Date.now()
        });
      }
      
      originalConsoleError.apply(this, args);
    };
  }
};

// Initialize security monitoring
SecurityMonitor.init();
