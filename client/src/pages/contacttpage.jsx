import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ContactTPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('')
    setIsSubmitting(true)

    // Store the message data temporarily before redirect
    localStorage.setItem('pendingContactMessage', JSON.stringify({
      name: name.trim(),
      message: message.trim()
    }))

    // Always redirect to login page
    navigate('/login?redirect=/contact')
    setIsSubmitting(false)
    return
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="rounded-2xl bg-gradient-to-r from-blue-50 to-yellow-50 p-6 md:p-8">
        <h1 className="text-3xl font-extrabold text-churchBlue md:text-4xl">Contact Us</h1>
        <p className="mt-2 text-slate-700">We would love to hear from you and pray with you.</p>
      </section>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-churchBlue">Church Information</h2>
          <div className="mt-4 space-y-4 text-slate-700">
            <div>
              <p className="font-semibold mb-2">Main Church:</p>
              <p className="mb-2">Meklit Building, Addis Ababa</p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Meklit+Building+Addis+Ababa+Ethiopia"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-churchGold hover:text-churchBlue transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                View on Google Maps
              </a>
            </div>
            
            <div>
              <p className="font-semibold mb-2">Branch Church:</p>
              <p className="mb-2">Ferensay Gurara, Addis Ababa</p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Ferensay+Gurara+Addis+Ababa+Ethiopia"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-churchGold hover:text-churchBlue transition-colors font-medium"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                View on Google Maps
              </a>
            </div>
            
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-churchBlue">Send a Message</h2>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> Please 
              <a href="/login" className="text-blue-600 hover:text-blue-800 underline ml-1">log in</a> 
              to send your message. You can fill out the form below and we'll save it for you after login.
            </p>
          </div>
          
          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-churchBlue transition focus:border-churchBlue focus:ring-2"
                placeholder="Your name"
              />
            </div>
            <div>
              <label htmlFor="message" className="mb-1 block text-sm font-medium">
                Message
              </label>
              <textarea
                id="message"
                rows="4"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-churchBlue transition focus:border-churchBlue focus:ring-2"
                placeholder="Write your message"
              />
            </div>
            {status && (
              <p className={`text-sm font-medium ${
                status.includes('successfully') 
                  ? 'text-green-600' 
                  : status.includes('not saved')
                  ? 'text-red-600'
                  : 'text-slate-700'
              }`}>
                {status}
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-gradient-to-r from-churchBlue to-blue-700 px-5 py-2 font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Redirecting to Login...' : 'Send Message'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

export default ContactTPage
