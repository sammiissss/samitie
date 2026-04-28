import { useState, useEffect } from 'react'
import { SecurityLogger } from '../utils/security'
import { emailVerificationService } from '../services/emailService'

function LimitedRegistration() {
  const [step, setStep] = useState(1) // 1: check availability, 2: email verification, 3: code verification
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' or 'error'
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [canResend, setCanResend] = useState(true)
  const [registeredUsers, setRegisteredUsers] = useState([])

  const MAX_USERS = 2
  const ADMIN_USERS = [
    'abebe.t.samuel@gmail.com',
    'pastorfirewzeneb@gmail.com'
  ]

  // Countdown timer for code expiry
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && step === 3) {
      setCanResend(true)
    }
  }, [timeRemaining, step])

  // Load registered users from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('registeredAdminUsers')
    if (stored) {
      setRegisteredUsers(JSON.parse(stored))
    }
  }, [])

  const showMessage = (text, type = 'info') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => {
      setMessage('')
      setMessageType('')
    }, 5000)
  }

  const checkAvailability = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      showMessage('Please enter your email address', 'error')
      return
    }

    // Check if email is already registered
    if (registeredUsers.includes(email.toLowerCase())) {
      SecurityLogger.logSecurityEvent('Registration attempt for already registered email', {
        email: email.toLowerCase(),
        timestamp: Date.now()
      })
      showMessage('This email is already registered', 'error')
      return
    }

    // Check if registration slots are full
    if (registeredUsers.length >= MAX_USERS) {
      SecurityLogger.logSecurityEvent('Registration attempt when full', {
        email: email.toLowerCase(),
        registeredCount: registeredUsers.length,
        timestamp: Date.now()
      })
      showMessage(`Registration is full. Only ${MAX_USERS} admin users are allowed.`, 'error')
      return
    }

    setLoading(true)
    
    try {
      const result = await emailVerificationService.sendVerificationCode(email)
      
      if (result.success) {
        setStep(3) // Skip to email verification (step 3)
        setTimeRemaining(600) // 10 minutes
        setCanResend(false)
        showMessage('Verification code sent to your email', 'success')
        SecurityLogger.log('info', 'Registration verification code sent', {
          email: email.toLowerCase(),
          timestamp: Date.now()
        })
      } else {
        showMessage(result.message, 'error')
      }
    } catch (error) {
      SecurityLogger.logError(error, { context: 'registration_email_verification', email })
      showMessage('Failed to send verification code', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault()
    
    if (!verificationCode.trim()) {
      showMessage('Please enter the verification code', 'error')
      return
    }

    if (verificationCode.length !== 6) {
      showMessage('Verification code must be 6 digits', 'error')
      return
    }

    setLoading(true)
    
    try {
      const result = emailVerificationService.verifyCode(email, verificationCode)
      
      if (result.success) {
        // Register the user
        const newRegisteredUsers = [...registeredUsers, email.toLowerCase()]
        setRegisteredUsers(newRegisteredUsers)
        localStorage.setItem('registeredAdminUsers', JSON.stringify(newRegisteredUsers))
        
        showMessage('Registration successful! You can now login with double authentication.', 'success')
        SecurityLogger.log('info', 'Admin registration successful', {
          email: email.toLowerCase(),
          totalRegistered: newRegisteredUsers.length,
          timestamp: Date.now()
        })
        
        // Store registration success
        sessionStorage.setItem('registrationSuccess', 'true')
        sessionStorage.setItem('registeredEmail', email.toLowerCase())
        
        // Redirect to login after delay
        setTimeout(() => {
          window.location.href = '/'
        }, 3000)
      } else {
        showMessage(result.message, 'error')
      }
    } catch (error) {
      SecurityLogger.logError(error, { context: 'registration_code_verification', email })
      showMessage('Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!canResend) return
    
    setLoading(true)
    
    try {
      const result = await emailVerificationService.sendVerificationCode(email)
      
      if (result.success) {
        setTimeRemaining(600) // Reset timer
        setCanResend(false)
        showMessage('New verification code sent', 'success')
      } else {
        showMessage(result.message, 'error')
      }
    } catch (error) {
      SecurityLogger.logError(error, { context: 'registration_resend_verification', email })
      showMessage('Failed to resend verification code', 'error')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-churchBlue to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-churchBlue">Admin Registration</h1>
          <p className="text-slate-600 mt-2">Fares Evangelical Believers International Church</p>
          <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-full inline-block">
            {MAX_USERS - registeredUsers.length} slots available
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            messageType === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={checkAvailability} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-churchBlue focus:border-transparent"
                placeholder="Enter your email address"
                required
              />
              <p className="mt-2 text-xs text-slate-500">
                Only {MAX_USERS} admin users can register. Currently {registeredUsers.length}/{MAX_USERS} registered.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || registeredUsers.length >= MAX_USERS}
              className="w-full bg-gradient-to-r from-churchBlue to-blue-700 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check Availability & Register'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleRegistrationSubmit} className="space-y-6">
            <div className="text-center mb-4">
              <p className="text-slate-600">
                We've sent a 6-digit verification code to:
              </p>
              <p className="font-semibold text-churchBlue mt-1">{email}</p>
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-slate-700 mb-2">
                Verification Code
              </label>
              <input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-churchBlue focus:border-transparent text-center text-2xl font-mono"
                placeholder="000000"
                maxLength={6}
                required
              />
              {timeRemaining > 0 && (
                <p className="mt-2 text-xs text-slate-500">
                  Code expires in {formatTime(timeRemaining)}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-churchBlue to-blue-700 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Complete Registration'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={!canResend || loading}
                className="text-sm text-churchBlue hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {canResend ? 'Resend Code' : `Resend available in ${formatTime(timeRemaining)}`}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            Limited registration: Only {MAX_USERS} admin users allowed.
          </p>
          <p className="text-xs text-slate-500 text-center mt-1">
            All registration attempts are logged for security.
          </p>
        </div>

        <div className="mt-4 text-center">
          <a href="/" className="text-sm text-churchBlue hover:underline">
            Already registered? Login here
          </a>
        </div>
      </div>
    </div>
  )
}

export default LimitedRegistration
