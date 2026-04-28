import { useState } from 'react'
import { SecurityLogger } from '../utils/security'

function SimpleLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('') // 'success' or 'error'

  // Get registered users from localStorage
  const getRegisteredUsers = () => {
    const stored = localStorage.getItem('registeredAdminUsers')
    return stored ? JSON.parse(stored) : []
  }

  const showMessage = (text, type = 'info') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => {
      setMessage('')
      setMessageType('')
    }, 5000)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (!email.trim() || !password.trim()) {
      showMessage('Please enter email and password', 'error')
      return
    }

    const registeredUsers = getRegisteredUsers()
    
    // Debug: Log registered users
    console.log('🔍 Debug - Registered users:', registeredUsers)
    console.log('🔍 Debug - Login attempt email:', email.toLowerCase())
    
    // Check if user is registered
    const userData = registeredUsers.find(user => user.email === email.toLowerCase())
    console.log('🔍 Debug - Found user data:', userData)
    
    if (!userData) {
      console.log('❌ User not found in registered users')
      SecurityLogger.logSecurityEvent('Login attempt for unregistered user', {
        email: email.toLowerCase(),
        registeredUsers: registeredUsers.length,
        timestamp: Date.now()
      })
      showMessage('This email is not registered', 'error')
      return
    }

    // Check password
    console.log('🔍 Debug - Password check:', {
      input: password,
      stored: userData.password,
      match: password === userData.password
    })
    
    if (password !== userData.password) {
      console.log('❌ Password mismatch')
      SecurityLogger.logSecurityEvent('Incorrect password attempt', {
        email: email.toLowerCase(),
        timestamp: Date.now()
      })
      showMessage('Incorrect password', 'error')
      return
    }

    setLoading(true)
    
    try {
      // Store login session
      sessionStorage.setItem('adminLoggedIn', 'true')
      sessionStorage.setItem('adminEmail', email.toLowerCase())
      sessionStorage.setItem('adminLoginTime', Date.now().toString())
      
      showMessage('Login successful! Redirecting...', 'success')
      
      SecurityLogger.log('info', 'Admin login successful', {
        email: email.toLowerCase(),
        timestamp: Date.now()
      })
      
      // Redirect to dashboard after delay
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1500)
      
    } catch (error) {
      SecurityLogger.logError(error, { context: 'admin_login', email })
      showMessage('Login failed. Please try again.', 'error')
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

        <form onSubmit={handleLogin} className="space-y-6">
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
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-churchBlue to-blue-700 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login to Admin Dashboard'}
          </button>
        </form>

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

export default SimpleLogin
