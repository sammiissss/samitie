import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { ref, onValue, update, push, set } from 'firebase/database'
import { auth, database } from '../lib/firebase'

function AdminAuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [messages, setMessages] = useState([])
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        setIsLoggedIn(true)
        loadMessages()
        console.log('✅ User already logged in:', currentUser.email)
      } else {
        setUser(null)
        setIsLoggedIn(false)
        setMessages([])
        console.log('🔒 User not logged in')
      }
    })
    return unsubscribe
  }, [])

  const loadMessages = () => {
    console.log('🚀 Loading messages from Firebase real-time database...')
    
    const messagesRef = ref(database, 'contactMessages')
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      console.log('📥 Real-time messages snapshot received:', snapshot)
      console.log('📥 Snapshot exists:', !!snapshot.exists())
      
      const data = snapshot.val()
      if (data) {
        const messagesList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        
        console.log('📥 Processed messages:', messagesList.length)
        console.log('📥 Messages data:', messagesList)
        setMessages(messagesList)
      } else {
        console.log('📥 No messages found in Firebase')
        setMessages([])
      }
    }, (error) => {
      console.error('❌ Firebase real-time database error:', error)
      console.error('❌ Error details:', {
        code: error.code,
        message: error.message,
        details: error.details
      })
      setMessages([])
    })

    return unsubscribe
  }

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let userCredential
      if (isLogin) {
        console.log('🔑 Attempting admin login...')
        userCredential = await signInWithEmailAndPassword(auth, email, password)
        console.log('✅ Admin logged in successfully:', userCredential.user.email)
      } else {
        console.log('📝 Attempting admin registration...')
        userCredential = await createUserWithEmailAndPassword(auth, email, password)
        console.log('✅ Admin registered successfully:', userCredential.user.email)
      }
      
      setUser(userCredential.user)
      setIsLoggedIn(true)
      loadMessages()
    } catch (error) {
      console.error('❌ Authentication error:', error)
      setError(isLogin ? 'Invalid email or password' : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (messageId) => {
    if (!replyText.trim()) {
      alert('Reply cannot be empty')
      return
    }

    setIsSending(true)
    
    try {
      console.log('📤 Sending reply to message:', messageId)
      
      const messageRef = ref(database, `contactMessages/${messageId}`)
      await update(messageRef, {
        reply: replyText.trim(),
        repliedAt: new Date().toISOString(),
        status: 'replied',
        repliedBy: user.email,
        repliedByUid: user.uid
      })

      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId 
            ? { ...msg, reply: replyText.trim(), repliedAt: new Date().toISOString(), status: 'replied', repliedBy: user.email, repliedByUid: user.uid }
            : msg
        )
      )

      setReplyText('')
      setSelectedMessage(null)
      
      alert('✅ Reply sent successfully!')
      console.log('📤 Reply sent for message:', messageId)
    } catch (error) {
      console.error('❌ Error sending reply:', error)
      alert('❌ Failed to send reply. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const deleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return
    }

    try {
      console.log('🗑️ Deleting message:', messageId)
      
      await set(ref(database, `contactMessages/${messageId}`), null)
      
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId))
      
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null)
      }
      
      alert('✅ Message deleted successfully!')
      console.log('🗑️ Message deleted:', messageId)
    } catch (error) {
      console.error('❌ Error deleting message:', error)
      alert('❌ Failed to delete message. Please try again.')
    }
  }

  const addTestMessage = async () => {
    try {
      console.log('➕ Adding test message...')
      
      const messagesRef = ref(database, 'contactMessages')
      const newMessageRef = push(messagesRef)
      
      const testMessage = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Message',
        message: 'This is a test message to verify Firebase real-time database connection',
        createdAt: new Date().toISOString(),
        status: 'new'
      }
      
      await set(newMessageRef, testMessage)
      
      alert('✅ Test message added successfully!')
      console.log('➕ Test message added:', testMessage)
    } catch (error) {
      console.error('❌ Error adding test message:', error)
      alert('❌ Failed to add test message. Please try again.')
    }
  }

  const handleLogout = async () => {
    try {
      console.log('🔒 Logging out admin...')
      await auth.signOut()
      setIsLoggedIn(false)
      setMessages([])
      setSelectedMessage(null)
      setReplyText('')
      setUser(null)
      console.log('✅ Admin logged out successfully')
    } catch (error) {
      console.error('❌ Logout error:', error)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {isLogin ? 'Admin Login' : 'Admin Registration'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {isLogin ? 'Sign in to manage messages' : 'Create new admin account'}
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="•••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Register')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" aria-hidden="true"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="ml-2 text-blue-600 hover:text-blue-500"
                >
                  {isLogin ? 'Register New Account' : 'Sign In Instead'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage contact messages from Firebase real-time database</p>
              <p className="text-sm text-blue-600 mt-1">Logged in as: {user?.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={addTestMessage}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Add Test Message
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Messages from Firebase Real-Time Database ({messages.length})
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-gray-500 font-medium">No messages yet</p>
                    <p className="text-gray-400 text-sm mt-1">Contact messages will appear here from Firebase real-time database</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${
                        selectedMessage?.id === message.id ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedMessage(message)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div>
                            <h3 className="font-semibold text-gray-900">{message.name}</h3>
                            <p className="text-sm text-gray-600">{message.email}</p>
                            <p className="text-sm text-gray-700 mt-1">{message.subject}</p>
                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            {new Date(message.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex-1 text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            message.status === 'new' ? 'bg-blue-100 text-blue-800' :
                            message.status === 'read' ? 'bg-yellow-100 text-yellow-800' :
                            message.status === 'replied' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {message.status}
                          </span>
                        </div>
                      </div>
                      
                      {message.reply && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                          <p className="text-sm font-medium text-green-800 mb-1">Reply:</p>
                          <p className="text-gray-700">{message.reply}</p>
                          <p className="text-xs text-green-600 mt-1">
                            Replied: {new Date(message.repliedAt).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            {selectedMessage ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Message Details</h2>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                  >
                    ✕ Close
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                    <p className="font-semibold text-gray-900">{selectedMessage.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <p className="text-gray-900">{selectedMessage.email}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <p className="text-gray-900">{selectedMessage.subject}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Received</label>
                    <p className="text-gray-900">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                  </div>
                  
                  {selectedMessage.reply && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reply</label>
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.reply}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Reply to Message</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="reply" className="block text-sm font-medium text-gray-700 mb-2">Your Reply</label>
                      <textarea
                        id="reply"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Type your reply here..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleReply(selectedMessage.id)}
                        disabled={isSending}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSending ? 'Sending...' : 'Send Reply'}
                      </button>
                      
                      <button
                        onClick={() => deleteMessage(selectedMessage.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500 font-medium">No message selected</p>
                <p className="text-gray-400 text-sm mt-1">Click on a message to view details and reply</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAuthPage
