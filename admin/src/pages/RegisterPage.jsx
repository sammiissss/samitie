import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../lib/firebase'

function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)

    try {
      console.log('Creating user with email:', email)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      console.log('User created successfully:', userCredential.user.uid)
      
      await updateProfile(userCredential.user, {
        displayName: name
      })
      console.log('Profile updated with name:', name)
      
      // Small delay to ensure auth state is updated
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    } catch (error) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered.')
          break
        case 'auth/invalid-email':
          setError('Invalid email address.')
          break
        case 'auth/weak-password':
          setError('Password is too weak.')
          break
        default:
          setError('Failed to create account. Please try again.')
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
            <h1 className="text-3xl font-extrabold text-churchBlue">Admin Register</h1>
            <p className="mt-2 text-slate-600">Fares Evangelical Belivers International Church</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-churchBlue transition focus:border-churchBlue focus:ring-2"
                placeholder="Enter your full name"
              />
            </div>

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
                placeholder="admin@example.com"
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
                placeholder="Enter password (min 6 characters)"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-churchBlue transition focus:border-churchBlue focus:ring-2"
                placeholder="Confirm your password"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-churchBlue to-blue-700 px-4 py-3 font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <a href="/login" className="text-churchBlue hover:underline">
                Sign in
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

export default RegisterPage
