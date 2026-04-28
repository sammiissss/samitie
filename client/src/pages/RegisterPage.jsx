import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../lib/firebase'

function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = new URLSearchParams(location.search).get('redirect') || '/'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const getRegisterErrorMessage = (code) => {
    const messages = {
      'auth/email-already-in-use': 'This email is already registered. Please login instead.',
      'auth/invalid-email': 'This email format is invalid.',
      'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
      'auth/operation-not-allowed':
        'Email/Password sign-in is not enabled in Firebase Authentication.',
      'auth/configuration-not-found':
        'Firebase Auth is not fully configured. In Firebase Console, open Authentication, click Get started, and enable Email/Password.',
      'auth/network-request-failed': 'Network error. Please check your internet and try again.',
    }
    return messages[code] || `Registration failed (${code || 'unknown error'}).`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!auth) {
      setError('Firebase is not configured yet. Please add your .env values.')
      return
    }
    if (!name.trim()) {
      setError('Please enter your full name.')
      return
    }

    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password)
      await updateProfile(userCredential.user, { displayName: name.trim() })
      navigate(redirectTo)
    } catch (err) {
      setError(getRegisterErrorMessage(err?.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-churchBlue">Register</h1>
        <p className="mt-2 text-sm text-slate-600">Create an account to send messages.</p>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-churchBlue focus:ring-2"
          />
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
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{' '}
          <Link to={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="text-churchBlue">
            Login
          </Link>
        </p>
      </section>
    </div>
  )
}

export default RegisterPage
