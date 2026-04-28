import { useState, useEffect } from 'react'
import { SecurityLogger } from '../utils/security'

function SimpleRegistration() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' or 'error'
  const [registeredUsers, setRegisteredUsers] = useState([])

  const MAX_USERS = 2

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

  const handleRegister = async (e) => {
    e.preventDefault()
    
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      showMessage('Please fill in all fields', 'error')
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

    // Check if email is already registered
    if (registeredUsers.some(user => user.email === email.toLowerCase())) {
      SecurityLogger.logSecurityEvent('Registration attempt for existing email', {
        email: email.toLowerCase(),
        timestamp: Date.now()
      })
      showMessage('This email is already registered', 'error')
      return
    }

    // Check password match
    if (password !== confirmPassword) {
      showMessage('Passwords do not match', 'error')
      return
    }

    // Check password strength
    if (password.length < 6) {
      showMessage('Password must be at least 6 characters', 'error')
      return
    }

    setLoading(true)
    
    try {
      // Register the user
      const newUser = {
        email: email.toLowerCase(),
        password: password,
        registeredAt: new Date().toISOString()
      }
      
      console.log('🔍 Debug - New user data:', newUser)
      
      const newRegisteredUsers = [...registeredUsers, newUser]
      console.log('🔍 Debug - Updated users list:', newRegisteredUsers)
      
      setRegisteredUsers(newRegisteredUsers)
      localStorage.setItem('registeredAdminUsers', JSON.stringify(newRegisteredUsers))
      
      // Verify storage
      const stored = localStorage.getItem('registeredAdminUsers')
      console.log('🔍 Debug - Stored data verification:', JSON.parse(stored || '[]'))
      
      showMessage('Registration successful! You can now login.', 'success')
      
      SecurityLogger.log('info', 'Admin registration successful', {
        email: email.toLowerCase(),
        totalRegistered: newRegisteredUsers.length,
        timestamp: Date.now()
      })
      
      // Clear form
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      
      // Redirect to login after delay
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
      
    } catch (error) {
      SecurityLogger.logError(error, { context: 'admin_registration', email })
      showMessage('Registration failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
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

        <form onSubmit={handleRegister} className="space-y-6">
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
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-churchBlue focus:border-transparent"
              placeholder="Create a password (min 6 characters)"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-churchBlue focus:border-transparent"
              placeholder="Confirm your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || registeredUsers.length >= MAX_USERS}
            className="w-full bg-gradient-to-r from-churchBlue to-blue-700 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Create Admin Account'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            Limited registration: Only {MAX_USERS} admin users allowed.
          </p>
          <p className="text-xs text-slate-500 text-center mt-1">
            Currently {registeredUsers.length}/{MAX_USERS} registered.
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

export default SimpleRegistration
