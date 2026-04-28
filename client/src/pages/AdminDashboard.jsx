import { useState, useEffect } from 'react'
import { ref, onValue, update } from 'firebase/database'
import { useAuth } from '../context/AuthContext'
import { database } from '../lib/firebase'
import { 
  sanitizeInput, 
  validateFormInput, 
  rateLimiter, 
  generateCSRFToken, 
  validateCSRFToken,
  SecurityLogger,
  isSessionValid,
  extendSession
} from '../utils/security'

function AdminDashboard() {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [csrfToken, setCsrfToken] = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [accessDenied, setAccessDenied] = useState(false)

  // Secure admin access control - only these 2 users can access
  const ADMIN_USERS = [
    'pastorfirewzeneb@gmail.com',
    'admin@gracegospeladdis.org'
  ]

  const isAdmin = ADMIN_USERS.includes(user?.email?.toLowerCase())

  useEffect(() => {
    // Security check for admin access
    if (!user) {
      SecurityLogger.logSecurityEvent('Unauthorized admin access attempt - no user', {
        url: window.location.href,
        timestamp: Date.now()
      })
      setAccessDenied(true)
      return
    }

    if (!isAdmin) {
      SecurityLogger.logSecurityEvent('Unauthorized admin access attempt', {
        userEmail: user.email,
        userId: user.uid,
        url: window.location.href,
        timestamp: Date.now()
      })
      setAccessDenied(true)
      return
    }

    // Session validation
    if (!isSessionValid()) {
      SecurityLogger.logSecurityEvent('Invalid session for admin access', {
        userId: user.uid,
        email: user.email
      })
      setAccessDenied(true)
      return
    }

    // Generate CSRF token
    const token = generateCSRFToken()
    setCsrfToken(token)
    sessionStorage.setItem('adminCsrfToken', token)

    // Log successful admin access
    SecurityLogger.log('info', 'Admin dashboard accessed', {
      userId: user.uid,
      email: user.email,
      timestamp: Date.now()
    })

    const messagesRef = ref(database, 'contactMessages')
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const messagesList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setMessages(messagesList)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [isAdmin, user])

  const handleReply = async (messageId) => {
    if (!replyText.trim()) {
      setFormErrors({ reply: 'Reply cannot be empty' })
      return
    }

    // Rate limiting check
    const rateLimitKey = `admin_reply_${user?.uid || 'anonymous'}`
    if (!rateLimiter.isAllowed(rateLimitKey)) {
      SecurityLogger.logSecurityEvent('Admin reply rate limit exceeded', {
        userId: user?.uid,
        messageId
      })
      setFormErrors({ reply: 'Too many reply attempts. Please wait a moment.' })
      return
    }

    // CSRF token validation
    const storedToken = sessionStorage.getItem('adminCsrfToken')
    if (!validateCSRFToken(csrfToken, storedToken)) {
      SecurityLogger.logSecurityEvent('Admin reply CSRF validation failed', {
        userId: user?.uid,
        messageId
      })
      setFormErrors({ reply: 'Security validation failed. Please refresh the page.' })
      return
    }

    // Input validation and sanitization
    const replyValidation = validateFormInput('message', replyText)
    if (!replyValidation.isValid) {
      setFormErrors({ reply: replyValidation.error })
      SecurityLogger.logSecurityEvent('Admin reply validation failed', {
        userId: user?.uid,
        error: replyValidation.error,
        messageId
      })
      return
    }

    setIsSending(true)
    setFormErrors({})
    
    try {
      // Use sanitized reply text
      const sanitizedReply = replyValidation.sanitized
      
      // Update message with reply and status
      const messageRef = ref(database, `contactMessages/${messageId}`)
      await update(messageRef, {
        status: 'replied',
        reply: sanitizedReply,
        repliedAt: new Date().toISOString(),
        repliedBy: user.uid,
        adminEmail: user.email,
        csrfToken: csrfToken,
        userAgent: navigator.userAgent
      })

      // Log successful reply
      SecurityLogger.log('info', 'Admin reply sent successfully', {
        userId: user?.uid,
        adminEmail: user.email,
        messageId,
        replyLength: sanitizedReply.length,
        timestamp: Date.now()
      })

      // Extend session on successful action
      extendSession()

      // Clear form
      setReplyText('')
      setSelectedMessage(null)
      
      // Generate new CSRF token
      const newToken = generateCSRFToken()
      setCsrfToken(newToken)
      sessionStorage.setItem('adminCsrfToken', newToken)
      
      // Refresh messages
      const messagesRef = ref(database, 'contactMessages')
      onValue(messagesRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          const messagesList = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value
          })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          setMessages(messagesList)
        }
      })
    } catch (error) {
      SecurityLogger.logError(error, { 
        context: 'admin_reply',
        userId: user?.uid,
        messageId 
      })
      setFormErrors({ reply: 'Failed to send reply. Please try again.' })
    } finally {
      setIsSending(false)
    }
  }

  const markAsRead = async (messageId) => {
    // Rate limiting check
    const rateLimitKey = `admin_read_${user?.uid || 'anonymous'}`
    if (!rateLimiter.isAllowed(rateLimitKey)) {
      SecurityLogger.logSecurityEvent('Admin markAsRead rate limit exceeded', {
        userId: user?.uid,
        messageId
      })
      return
    }

    try {
      const messageRef = ref(database, `contactMessages/${messageId}`)
      await update(messageRef, {
        status: 'read',
        readBy: user?.uid,
        readAt: new Date().toISOString(),
        adminEmail: user?.email
      })

      SecurityLogger.log('info', 'Message marked as read', {
        userId: user?.uid,
        messageId,
        timestamp: Date.now()
      })
    } catch (error) {
      SecurityLogger.logError(error, { 
        context: 'admin_mark_read',
        userId: user?.uid,
        messageId 
      })
    }
  }

  if (!isAdmin || accessDenied) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="text-2xl font-bold text-red-800">Access Denied</h2>
          <p className="mt-2 text-red-600">You don't have permission to access this page.</p>
          <p className="mt-2 text-sm text-red-500">
            This area is restricted to authorized administrators only.
          </p>
          <p className="mt-4 text-xs text-red-400">
            Security Log: {accessDenied ? 'Access attempt blocked' : 'Insufficient privileges'}
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="text-center">
          <p className="text-slate-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-churchBlue">Admin Dashboard</h1>
        <p className="mt-2 text-slate-600">Manage and reply to contact messages</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Messages List */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-churchBlue">Messages ({messages.length})</h2>
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`cursor-pointer rounded-lg border p-4 transition hover:bg-slate-50 ${
                  message.status === 'new' ? 'border-blue-200 bg-blue-50' : 'border-slate-200'
                }`}
                onClick={() => {
                  setSelectedMessage(message)
                  if (message.status === 'new') {
                    markAsRead(message.id)
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{message.name}</h3>
                    <p className="text-sm text-slate-600">{message.email}</p>
                    <p className="mt-2 text-sm text-slate-700 line-clamp-2">{message.message}</p>
                  </div>
                  <div className="ml-4 flex flex-col items-end gap-2">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                      message.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      message.status === 'read' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {message.status}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Details & Reply */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          {selectedMessage ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-churchBlue">Message Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-700">From</label>
                <p className="font-semibold">{selectedMessage.name}</p>
                <p className="text-sm text-slate-600">{selectedMessage.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Message</label>
                <p className="mt-1 text-slate-900">{selectedMessage.message}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Date</label>
                <p className="text-sm text-slate-600">
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </p>
              </div>

              {selectedMessage.reply && (
                <div>
                  <label className="block text-sm font-medium text-slate-700">Previous Reply</label>
                  <div className="mt-1 rounded-lg bg-green-50 p-3 text-green-900">
                    {selectedMessage.reply}
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="reply" className="block text-sm font-medium text-slate-700">
                  Reply
                </label>
                <textarea
                  id="reply"
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className={`mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 ${
                    formErrors.reply 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-slate-300 focus:border-churchBlue focus:ring-churchBlue'
                  }`}
                  placeholder="Type your reply here..."
                />
                {formErrors.reply && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.reply}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleReply(selectedMessage.id)}
                  disabled={isSending || !replyText.trim()}
                  className="rounded-lg bg-gradient-to-r from-churchBlue to-blue-700 px-4 py-2 font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
                >
                  {isSending ? 'Sending...' : 'Send Reply'}
                </button>
                <button
                  onClick={() => {
                    setSelectedMessage(null)
                    setReplyText('')
                  }}
                  className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500">
              <p>Select a message to view details and reply</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
