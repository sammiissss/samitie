import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { emailVerificationService } from '../services/emailService'
import { SecurityLogger } from '../utils/security'

function DoubleAuthLogin() {
  const { user } = useAuth()
  const [step, setStep] = useState(1) // 1: email verification, 2: code verification
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' or 'error'
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [canResend, setCanResend] = useState(true)

  // Get registered users from localStorage
  const getRegisteredUsers = () => {
    const stored = localStorage.getItem('registeredAdminUsers')
    return stored ? JSON.parse(stored) : []
  }

  // Countdown timer for code expiry
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeRemaining === 0 && step === 2) {
      setCanResend(true)
    }
  }, [timeRemaining, step])

  const showMessage = (text, type = 'info') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => {
      setMessage('')
      setMessageType('')
    }, 5000)
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    
    if (!email.trim()) {
      showMessage('Please enter your email address', 'error')
      return
    }

    const registeredUsers = getRegisteredUsers()
    if (!registeredUsers.includes(email.toLowerCase())) {
      SecurityLogger.logSecurityEvent('Unauthorized admin email attempt', {
        email: email.toLowerCase(),
        timestamp: Date.now()
      })
      showMessage('This email is not registered for admin access', 'error')
      return
    }

    setLoading(true)
    
    try {
      const result = await emailVerificationService.sendVerificationCode(email)
      
      if (result.success) {
        setStep(2)
        setTimeRemaining(600) // 10 minutes
        setCanResend(false)
        showMessage('Verification code sent to your email', 'success')
        SecurityLogger.log('info', 'Admin verification code sent', {
          email: email.toLowerCase(),
          timestamp: Date.now()
        })
      } else {
        showMessage(result.message, 'error')
      }
    } catch (error) {
      SecurityLogger.logError(error, { context: 'email_verification', email })
      showMessage('Failed to send verification code', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeSubmit = async (e) => {
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
        showMessage('Verification successful! Redirecting...', 'success')
        SecurityLogger.log('info', 'Admin double authentication successful', {
          email: email.toLowerCase(),
          timestamp: Date.now()
        })
        
        // Store verification success in session
        sessionStorage.setItem('adminVerified', 'true')
        sessionStorage.setItem('adminVerifiedEmail', email.toLowerCase())
        sessionStorage.setItem('adminVerifiedTime', Date.now().toString())
        
        // Redirect to dashboard after delay
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
      } else {
        showMessage(result.message, 'error')
      }
    } catch (error) {
      SecurityLogger.logError(error, { context: 'code_verification', email })
      showMessage('Verification failed', 'error')
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
      SecurityLogger.logError(error, { context: 'resend_verification', email })
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

  // Check if user is already verified
  useEffect(() => {
    const isVerified = sessionStorage.getItem('adminVerified') === 'true'
    const verifiedEmail = sessionStorage.getItem('adminVerifiedEmail')
    const verifiedTime = parseInt(sessionStorage.getItem('adminVerifiedTime') || '0')
    
    // Check if verification is still valid (30 minutes)
    if (isVerified && verifiedEmail && (Date.now() - verifiedTime < 30 * 60 * 1000)) {
      // User is already verified, redirect to dashboard
      window.location.href = '/dashboard'
    } else {
      // Clear expired verification
      sessionStorage.removeItem('adminVerified')
      sessionStorage.removeItem('adminVerifiedEmail')
      sessionStorage.removeItem('adminVerifiedTime')
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-churchBlue to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-churchBlue">Admin Login</h1>
          <p className="text-slate-600 mt-2">Fares Evangelical Believers International Church</p>
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

        {step === 1 ? (
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Admin Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-churchBlue focus:border-transparent"
                placeholder="Enter your admin email"
                required
              />
              <p className="mt-2 text-xs text-slate-500">
                Only authorized administrators can access this panel
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-churchBlue to-blue-700 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? 'Sending Code...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit} className="space-y-6">
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
              {loading ? 'Verifying...' : 'Verify Code'}
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
            This is a secure admin portal. All access attempts are logged.
          </p>
        </div>

        <div className="mt-4 text-center">
          <a href="/register" className="text-sm text-churchBlue hover:underline">
            Need to register? Request admin access
          </a>
        </div>
      </div>
    </div>
  )
}

export default DoubleAuthLogin
