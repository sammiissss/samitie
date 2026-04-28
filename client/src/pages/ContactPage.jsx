import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ref, push, serverTimestamp, onValue, get } from 'firebase/database'
import { useAuth } from '../context/AuthContext'
import { database, isFirebaseConfigured } from '../lib/firebase'
import { saveContactMessage } from '../lib/localStorage'

function ContactPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [adminReply, setAdminReply] = useState('')
  const [showReplySection, setShowReplySection] = useState(false)
  const [userMessageId, setUserMessageId] = useState(null)

  // Listen for admin replies to the user's message
  useEffect(() => {
    console.log('🔄 Reply listener effect triggered:', { userMessageId, isFirebaseConfigured, database: !!database })
    
    if (!userMessageId || !isFirebaseConfigured || !database) {
      console.log('❌ Reply listener not set up:', { userMessageId, isFirebaseConfigured, database: !!database })
      return
    }

    console.log('🔍 Setting up reply listener for message ID:', userMessageId)
    const messageRef = ref(database, `contactMessages/${userMessageId}`)
    
    // Check immediately for existing reply
    const checkExistingReply = async () => {
      try {
        console.log('🔎 Checking for existing reply at path:', `contactMessages/${userMessageId}`)
        const snapshot = await get(messageRef)
        const data = snapshot.val()
        console.log('🔎 Initial check for existing reply:', data)
        
        if (data) {
          console.log('📋 Full message data:', data)
          if (data.reply) {
            console.log('✅ Found existing reply:', data.reply)
            setAdminReply(data.reply)
            setShowReplySection(true)
          } else {
            console.log('⏳ No reply in existing data')
          }
        } else {
          console.log('❌ No data found for message ID:', userMessageId)
        }
      } catch (error) {
        console.error('❌ Error checking existing reply:', error)
      }
    }

    checkExistingReply()

    // Set up real-time listener
    const unsubscribe = onValue(messageRef, (snapshot) => {
      const data = snapshot.val()
      console.log('📥 Real-time data from Firebase:', data)
      
      if (data) {
        console.log('📝 Message data found, reply:', data.reply)
        console.log('📝 Full message object:', data)
        if (data.reply) {
          console.log('✅ Setting admin reply:', data.reply)
          setAdminReply(data.reply)
          // Auto-show reply section when admin responds
          setShowReplySection(true)
        } else {
          console.log('⏳ No reply yet')
        }
      } else {
        console.log('❌ No data found for message ID:', userMessageId)
      }
    })

    return () => {
      console.log('🧹 Cleaning up reply listener for message ID:', userMessageId)
      unsubscribe()
    }
  }, [userMessageId, isFirebaseConfigured, database])

  // Also check for any existing messages from this user
  useEffect(() => {
    if (!user || !isFirebaseConfigured || !database) return

    console.log('🔍 Checking for existing messages from user:', user.uid)
    const messagesRef = ref(database, 'contactMessages')
    
    const checkExistingMessages = async () => {
      try {
        console.log('🔎 Fetching all messages from Firebase...')
        const snapshot = await get(messagesRef)
        const data = snapshot.val()
        console.log('📊 All messages data:', data)
        
        if (data) {
          console.log('📝 Filtering messages for user:', user.uid)
          const userMessages = Object.entries(data).filter(([key, value]) => {
            console.log('🔍 Checking message:', key, value)
            return value.uid === user.uid
          })
          
          console.log('📋 User messages found:', userMessages)
          
          const messagesWithReplies = userMessages.filter(([key, value]) => value.reply)
          console.log('📨 Messages with replies:', messagesWithReplies)
          
          if (messagesWithReplies.length > 0) {
            const [messageId, messageData] = messagesWithReplies[messagesWithReplies.length - 1]
            console.log('📋 Found existing message with reply:', messageId, messageData)
            setUserMessageId(messageId)
            setAdminReply(messageData.reply)
            setShowReplySection(true)
          } else {
            console.log('⏳ No messages with replies found for user')
          }
        } else {
          console.log('📭 No messages found in database')
        }
      } catch (error) {
        console.error('❌ Error checking existing messages:', error)
      }
    }

    checkExistingMessages()
  }, [user.uid, isFirebaseConfigured, database])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('')
    setIsSubmitting(true)

    console.log('=== Form Submission Started ===')
    console.log('User:', user)
    console.log('Firebase configured:', isFirebaseConfigured)
    console.log('Database available:', !!database)
    console.log('Form data:', { name, message })

    if (!isFirebaseConfigured || !database) {
      console.error('Firebase not configured')
      setStatus('Firebase is not configured yet. Add Firebase values in client/.env first.')
      setIsSubmitting(false)
      return
    }

    if (!user) {
      console.log('No user found, redirecting to login')
      navigate('/login?redirect=/contact')
      setIsSubmitting(false)
      return
    }

    if (!name.trim() || !message.trim()) {
      console.log('Validation failed - empty fields')
      setStatus('Please fill in all required fields.')
      setIsSubmitting(false)
      return
    }

    // Basic validation
    if (name.trim().length < 2) {
      setStatus('Name must be at least 2 characters.')
      setIsSubmitting(false)
      return
    }

    if (message.trim().length < 10) {
      setStatus('Message must be at least 10 characters.')
      setIsSubmitting(false)
      return
    }

    try {
      const messageData = {
        name: name.trim(),
        message: message.trim(),
        email: user.email || '',
        uid: user.uid,
        status: 'new',
        reply: null,
        repliedAt: null,
        repliedBy: null
      }
      console.log('Message data:', messageData)
      
      // Try Firebase Realtime Database first
      if (isFirebaseConfigured && database) {
        try {
          const messagesRef = ref(database, 'contactMessages')
          const result = await push(messagesRef, messageData)
          console.log('✅ Message saved to Firebase Realtime Database with ID:', result.key)
          setUserMessageId(result.key)
          setName('')
          setMessage('')
          setStatus('Message sent successfully.')
        } catch (firebaseError) {
          console.log('❌ Firebase failed, using localStorage:', firebaseError.message)
          // Fallback to localStorage
          const result = saveContactMessage(messageData)
          if (result.success) {
            console.log('✅ Message saved to localStorage with ID:', result.id)
            setUserMessageId(result.id)
            setName('')
            setMessage('')
            setStatus('Message sent successfully (saved locally).')
          } else {
            setStatus(`Failed to save message: ${result.error}`)
          }
        }
      } else {
        // Use localStorage if Firebase not configured
        const result = saveContactMessage(messageData)
        if (result.success) {
          console.log('✅ Message saved to localStorage with ID:', result.id)
          setUserMessageId(result.id)
          setName('')
          setMessage('')
          setStatus('Message sent successfully (saved locally).')
        } else {
          setStatus(`Failed to save message: ${result.error}`)
        }
      }
    } catch (error) {
      console.error('❌ Unexpected error:', error)
      setStatus(`Message not saved: ${error.message}`)
    } finally {
      setIsSubmitting(false)
      console.log('=== Form Submission Ended ===')
    }
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
              {isSubmitting ? 'Sending...' : 'Send'}
            </button>
          </form>
        </section>
      </div>

      {/* Admin Reply Section */}
      {showReplySection && (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:ml-auto">
          <h2 className="text-2xl font-semibold text-churchBlue">Admin Response</h2>
          <div className="mt-4 rounded-lg bg-gradient-to-r from-blue-50 to-yellow-50 p-4 border border-slate-200">
            {adminReply ? (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-churchGold">Reply from Church Admin:</p>
                <p className="text-slate-700 whitespace-pre-wrap">{adminReply}</p>
                <p className="text-xs text-slate-500 mt-2">Thank you for contacting us. We'll respond as soon as possible.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-churchGold">Waiting for the Pastor Response:</p>
                <textarea
                  rows="4"
                  readOnly
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-churchBlue transition focus:border-churchBlue focus:ring-2 bg-slate-50 text-slate-400"
                  placeholder="Admin reply will appear here..."
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Toggle Reply Section Button */}
      <div className="mt-6 text-center">
        <button
          onClick={() => setShowReplySection(!showReplySection)}
          className="rounded-lg bg-gradient-to-r from-churchGold to-yellow-600 px-5 py-2 font-semibold text-white shadow-md transition hover:opacity-90"
        >
          {showReplySection ? 'Hide Reply' : 'Show Reply'}
        </button>
      </div>
    </div>
  )
}

export default ContactPage
