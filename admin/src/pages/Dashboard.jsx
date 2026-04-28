import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ref, onValue, update } from 'firebase/database'
import { auth } from '../lib/firebase'
import { database } from '../lib/firebase'

function Dashboard() {
  const [messages, setMessages] = useState([])
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    console.log('Setting up auth state listener')
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      console.log('Auth state changed:', currentUser ? currentUser.email : 'No user')
      if (!currentUser) {
        console.log('No user found, redirecting to login')
        navigate('/login')
      } else {
        console.log('User authenticated:', currentUser.email)
        setUser(currentUser)
      }
    })

    return unsubscribe
  }, [navigate])

  useEffect(() => {
    if (!user) return

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
  }, [user])

  const handleReply = async (messageId) => {
    if (!replyText.trim()) return

    setIsSending(true)
    try {
      const messageRef = ref(database, `contactMessages/${messageId}`)
      await update(messageRef, {
        status: 'replied',
        reply: replyText.trim(),
        repliedAt: new Date().toISOString(),
        repliedBy: user.uid
      })

      setReplyText('')
      setSelectedMessage(null)
    } catch (error) {
      console.error('Error sending reply:', error)
    } finally {
      setIsSending(false)
    }
  }

  const markAsRead = async (messageId) => {
    try {
      const messageRef = ref(database, `contactMessages/${messageId}`)
      await update(messageRef, {
        status: 'read'
      })
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      navigate('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Loading messages...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-churchBlue">Admin Dashboard</h1>
              <p className="text-sm text-slate-600">Fares Evangelical Belvers International Church</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600">{user.email}</span>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-medium text-slate-600">Total Messages</h3>
            <p className="mt-2 text-3xl font-bold text-churchBlue">{messages.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-medium text-slate-600">New Messages</h3>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {messages.filter(m => m.status === 'new').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-medium text-slate-600">Replied</h3>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {messages.filter(m => m.status === 'replied').length}
            </p>
          </div>
        </div>

        {/* Messages Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Messages List */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-churchBlue">Messages</h2>
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
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            {selectedMessage ? (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-churchBlue">Message Details</h2>
                
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
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-churchBlue focus:ring-2 focus:ring-churchBlue"
                    placeholder="Type your reply here..."
                  />
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
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-500 py-12">
                <p>Select a message to view details and reply</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
