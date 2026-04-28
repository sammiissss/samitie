// Email verification service for admin double authentication

import { SecurityLogger } from '../utils/security'
import { directEmailService } from './directEmailService'

class EmailVerificationService {
  constructor() {
    this.verificationCodes = new Map()
    this.codeExpiry = 10 * 60 * 1000 // 10 minutes
    this.maxAttempts = 3
    this.attempts = new Map()
  }

  // Generate 6-digit verification code
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  // Send verification code to admin email
  async sendVerificationCode(email) {
    try {
      const code = this.generateVerificationCode()
      const expiryTime = Date.now() + this.codeExpiry
      
      // Store code with expiry
      this.verificationCodes.set(email.toLowerCase(), {
        code,
        expiry: expiryTime,
        attempts: 0
      })

      // Log the code for development (in production, use actual email service)
      console.log(`🔐 Verification code for ${email}: ${code}`)
      
      // In production, you would use an email service like:
      // - SendGrid
      // - AWS SES
      // - Firebase Functions with SendGrid
      // - Node.js mailer with SMTP
      
      // Send email using direct email service
      const emailSent = await directEmailService.sendVerificationEmail(email, code)
      
      if (!emailSent) {
        throw new Error('Failed to send verification email')
      }
      
      SecurityLogger.log('info', 'Verification code sent', {
        email,
        timestamp: Date.now()
      })
      
      return {
        success: true,
        message: 'Verification code sent to your email'
      }
    } catch (error) {
      SecurityLogger.logError(error, { context: 'send_verification_code', email })
      return {
        success: false,
        message: 'Failed to send verification code'
      }
    }
  }

  // Send email using Firebase Cloud Functions
  async sendEmailWithFirebase(email, code) {
    try {
      const response = await fetch('https://us-central1-your-project-id.cloudfunctions.net/sendVerificationCode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          code: code
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to send email')
      }

      return result.success
    } catch (error) {
      console.error('Firebase email service error:', error)
      
      // Fallback to console for development
      console.log(`
📧 EMAIL SENT TO: ${email}
🔐 VERIFICATION CODE: ${code}
⏰ VALID FOR: 10 minutes
🏢 Fares Evangelical Believers International Church - Admin Login
🔄 FALLBACK: Firebase service unavailable, using console
      `)
      
      return true // Still return true for development
    }
  }

  // Verify the code
  verifyCode(email, inputCode) {
    const emailLower = email.toLowerCase()
    const storedData = this.verificationCodes.get(emailLower)
    
    if (!storedData) {
      SecurityLogger.logSecurityEvent('Verification attempt for non-existent code', {
        email,
        timestamp: Date.now()
      })
      return {
        success: false,
        message: 'No verification code found. Please request a new one.'
      }
    }

    // Check if code has expired
    if (Date.now() > storedData.expiry) {
      this.verificationCodes.delete(emailLower)
      SecurityLogger.logSecurityEvent('Expired verification code attempt', {
        email,
        timestamp: Date.now()
      })
      return {
        success: false,
        message: 'Verification code has expired. Please request a new one.'
      }
    }

    // Check attempts
    if (storedData.attempts >= this.maxAttempts) {
      this.verificationCodes.delete(emailLower)
      SecurityLogger.logSecurityEvent('Max verification attempts exceeded', {
        email,
        attempts: storedData.attempts,
        timestamp: Date.now()
      })
      return {
        success: false,
        message: 'Too many failed attempts. Please request a new verification code.'
      }
    }

    // Increment attempts
    storedData.attempts++

    // Verify code
    if (inputCode === storedData.code) {
      this.verificationCodes.delete(emailLower)
      SecurityLogger.log('info', 'Verification code verified successfully', {
        email,
        timestamp: Date.now()
      })
      return {
        success: true,
        message: 'Verification successful'
      }
    } else {
      SecurityLogger.logSecurityEvent('Incorrect verification code attempt', {
        email,
        attempt: storedData.attempts,
        maxAttempts: this.maxAttempts,
        timestamp: Date.now()
      })
      
      const remainingAttempts = this.maxAttempts - storedData.attempts
      return {
        success: false,
        message: `Incorrect code. ${remainingAttempts} attempts remaining.`
      }
    }
  }

  // Check if verification code exists for email
  hasVerificationCode(email) {
    const storedData = this.verificationCodes.get(email.toLowerCase())
    if (!storedData) return false
    
    // Check if expired
    if (Date.now() > storedData.expiry) {
      this.verificationCodes.delete(email.toLowerCase())
      return false
    }
    
    return true
  }

  // Clean up expired codes
  cleanupExpiredCodes() {
    const now = Date.now()
    for (const [email, data] of this.verificationCodes.entries()) {
      if (now > data.expiry) {
        this.verificationCodes.delete(email)
      }
    }
  }

  // Get remaining time for code
  getRemainingTime(email) {
    const storedData = this.verificationCodes.get(email.toLowerCase())
    if (!storedData) return 0
    
    const remaining = storedData.expiry - Date.now()
    return Math.max(0, Math.floor(remaining / 1000)) // Return seconds
  }
}

export const emailVerificationService = new EmailVerificationService()

// Auto-cleanup expired codes every 5 minutes
setInterval(() => {
  emailVerificationService.cleanupExpiredCodes()
}, 5 * 60 * 1000)
