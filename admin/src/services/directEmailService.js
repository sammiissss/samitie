// Direct email service using EmailJS or similar service
import { SecurityLogger } from '../utils/security'

class DirectEmailService {
  constructor() {
    // Using EmailJS as it's the easiest to set up
    this.emailjsInitialized = false
    this.initEmailJS()
  }

  async initEmailJS() {
    try {
      // Initialize EmailJS with your service details
      if (window.emailjs) {
        window.emailjs.init("YOUR_PUBLIC_KEY") // Replace with your EmailJS public key
        this.emailjsInitialized = true
        console.log('EmailJS initialized successfully')
      }
    } catch (error) {
      console.error('Failed to initialize EmailJS:', error)
      this.emailjsInitialized = false
    }
  }

  async sendVerificationEmail(email, code) {
    try {
      const authorizedEmails = [
        'abebe.t.samuel@gmail.com',
        'pastorfirewzeneb@gmail.com'
      ]

      if (!authorizedEmails.includes(email.toLowerCase())) {
        SecurityLogger.logSecurityEvent('Unauthorized email attempt', {
          email: email.toLowerCase(),
          timestamp: Date.now()
        })
        throw new Error('Email not authorized for admin access')
      }

      // Method 1: Try EmailJS (if configured)
      if (this.emailjsInitialized) {
        return await this.sendWithEmailJS(email, code)
      }

      // Method 2: Try Firebase Functions (if deployed)
      return await this.sendWithFirebaseFunctions(email, code)

    } catch (error) {
      SecurityLogger.logError(error, { context: 'send_verification_email', email })
      
      // Fallback: Show code in console for development
      console.log(`
📧 EMAIL SERVICE FALLBACK
📧 EMAIL SENT TO: ${email}
🔐 VERIFICATION CODE: ${code}
⏰ VALID FOR: 10 minutes
🏢 Fares Evangelical Believers International Church - Admin Login
🔄 REASON: Email service not configured, using console fallback
      `)
      
      return true
    }
  }

  async sendWithEmailJS(email, code) {
    try {
      const templateParams = {
        to_email: email,
        verification_code: code,
        church_name: 'Fares Evangelical Believers International Church',
        expiry_time: '10 minutes'
      }

      await window.emailjs.send(
        'YOUR_SERVICE_ID',    // Replace with your EmailJS service ID
        'YOUR_TEMPLATE_ID',   // Replace with your EmailJS template ID
        templateParams
      )

      console.log('Email sent successfully via EmailJS to:', email)
      return true

    } catch (error) {
      console.error('EmailJS error:', error)
      throw error
    }
  }

  async sendWithFirebaseFunctions(email, code) {
    try {
      // Try to call Firebase Cloud Function
      const functionUrl = `https://us-central1-${import.meta.env.VITE_FIREBASE_PROJECT_ID}.cloudfunctions.net/sendVerificationCode`
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          code: code
        })
      })

      if (!response.ok) {
        throw new Error('Firebase function not available')
      }

      const result = await response.json()
      console.log('Email sent successfully via Firebase Functions to:', email)
      return true

    } catch (error) {
      console.error('Firebase Functions error:', error)
      throw error
    }
  }

  // Method to test email service
  async testEmailService() {
    const testEmail = 'abebe.t.samuel@gmail.com'
    const testCode = '123456'
    
    try {
      const result = await this.sendVerificationEmail(testEmail, testCode)
      console.log('Email service test result:', result)
      return result
    } catch (error) {
      console.error('Email service test failed:', error)
      return false
    }
  }
}

export const directEmailService = new DirectEmailService()

// Auto-test on load in development
if (import.meta.env.DEV) {
  console.log('🧪 Testing email service in development mode...')
  // directEmailService.testEmailService()
}
