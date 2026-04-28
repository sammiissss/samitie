import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('Form submitted')
    console.log('Email:', email)
    console.log('Password length:', password.length)
    
    setError('')
    setLoading(true)

    if (!email || !password) {
      setError('Please fill in all fields.')
      setLoading(false)
      return
    }

    try {
      console.log('Attempting login with email:', email)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      console.log('Login successful:', userCredential.user.uid)
      console.log('User email:', userCredential.user.email)
      navigate('/dashboard')
    } catch (error) {
      console.error('Login error:', error.code, error.message)
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email.')
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password.')
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address.')
      } else {
        setError(`Login failed: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-churchBlue">Admin Login</h1>
            <p className="mt-2 text-slate-600">Fares Evangelical Belivers International Church</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-churchBlue transition focus:border-churchBlue focus:ring-2"
                placeholder="admin@gracegospeladdis.org"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-churchBlue transition focus:border-churchBlue focus:ring-2"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div style={{padding: '8px 0', fontSize: '14px', color: '#666'}}>
              Debug: Email = "{email}", Password length = {password.length}, Loading = {loading ? 'true' : 'false'}
            </div>

            <button
              type="submit"
              disabled={loading}
              onClick={() => console.log('Login button clicked')}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                background: 'linear-gradient(to right, #1e40af, #2563eb)',
                color: 'white',
                fontWeight: '600',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                fontSize: '16px',
                marginTop: '8px'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-slate-600">
              Don't have an account?{' '}
              <a href="/register" className="text-churchBlue hover:underline">
                Register here
              </a>
            </p>
            <a href="/" className="text-sm text-churchBlue hover:underline">
              ← Back to Church Website
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
