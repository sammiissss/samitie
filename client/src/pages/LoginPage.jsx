import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = new URLSearchParams(location.search).get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const getLoginErrorMessage = (code) => {
    const messages = {
      'auth/invalid-email': 'This email format is invalid.',
      'auth/invalid-credential': 'Wrong email or password.',
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Wrong email or password.',
      'auth/too-many-requests': 'Too many attempts. Please wait and try again.',
      'auth/operation-not-allowed':
        'Email/Password sign-in is not enabled in Firebase Authentication.',
      'auth/configuration-not-found':
        'Firebase Auth is not fully configured. In Firebase Console, open Authentication, click Get started, and enable Email/Password.',
      'auth/network-request-failed': 'Network error. Please check your internet and try again.',
    }
    return messages[code] || `Login failed (${code || 'unknown error'}).`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!auth) {
      setError('Firebase is not configured yet. Please add your .env values.')
      return
    }
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      navigate(redirectTo)
    } catch (err) {
      setError(getLoginErrorMessage(err?.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-churchBlue">Login</h1>
        <p className="mt-2 text-sm text-slate-600">Sign in to send contact messages.</p>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-churchBlue focus:ring-2"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-churchBlue focus:ring-2"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-churchBlue to-blue-700 px-5 py-2 font-semibold text-white"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          New here?{' '}
          <Link to={`/register?redirect=${encodeURIComponent(redirectTo)}`} className="text-churchBlue">
            Create account
          </Link>
        </p>
      </section>
    </div>
  )
}

export default LoginPage
