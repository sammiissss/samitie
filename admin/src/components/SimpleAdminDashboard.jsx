import { useState, useEffect } from 'react'
import { ref, onValue, update, push, set } from 'firebase/database'
import { database } from '../lib/firebase'

function SimpleAdminDashboard() {
  const [messages, setMessages] = useState([])
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    console.log('� Simple Admin Dashboard - Starting initialization...')
    
    // Check Firebase database connection first
    if (!database) {
      console.error('❌ Firebase database not initialized')
      setMessages([])
      setLoading(false)
      return
    }

    // Load messages from database
    const messagesRef = ref(database, 'contactMessages')
    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      console.log('� Messages snapshot received:', snapshot)
      console.log('� Snapshot exists:', !!snapshot.exists())
      
      const data = snapshot.val()
      console.log('� Raw Firebase data:', data)
      console.log('� Data type:', typeof data)
      console.log('� Data keys:', data ? Object.keys(data) : 'null')
      
      if (data) {
        const messagesList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        
        console.log('📥 Processed messages list:', messagesList)
        console.log('📥 Messages count:', messagesList.length)
        setMessages(messagesList)
      } else {
        console.log('📥 No messages found in Firebase')
        setMessages([])
      }
      setLoading(false)
    }, (error) => {
      console.error('❌ Firebase messages database error:', error)
      console.error('� Error details:', {
        code: error.code,
        message: error.message,
        details: error.details
      })
      setMessages([])
      setLoading(false)
    })

      return unsubscribeMessages
  }, [])

  // Test function to add a test message
  const addTestMessage = async () => {
    if (!database) {
      alert('Firebase database not initialized')
      return
    }

    try {
      const testRef = ref(database, 'contactMessages')
      const newMessageRef = push(testRef)
      
      const testMessage = {
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Message',
        message: 'This is a test message to verify Firebase connection',
        createdAt: new Date().toISOString(),
        status: 'new'
      }
      
      await set(newMessageRef, testMessage)
      console.log('✅ Test message added successfully')
      alert('Test message added! Check the message list.')
    } catch (error) {
      console.error('❌ Error adding test message:', error)
      alert('Failed to add test message: ' + error.message)
    }
  }

  const handleReply = async (messageId) => {
    if (!replyText.trim()) {
      alert('Reply cannot be empty')
      return
    }

    setIsSending(true)
    
    try {
      const messageRef = ref(database, `contactMessages/${messageId}`)
      await update(messageRef, {
        reply: replyText.trim(),
        repliedAt: new Date().toISOString(),
        status: 'replied'
      })

      // Update local state
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId 
            ? { ...msg, reply: replyText.trim(), repliedAt: new Date().toISOString(), status: 'replied' }
            : msg
        )
      )

      setReplyText('')
      setSelectedMessage(null)
      alert('Reply sent successfully!')
    } catch (error) {
      console.error('Error sending reply:', error)
      alert('Failed to send reply. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const markAsRead = async (messageId) => {
    try {
      const messageRef = ref(database, `contactMessages/${messageId}`)
      await update(messageRef, {
        status: 'read',
        readAt: new Date().toISOString()
      })

      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId 
            ? { ...msg, status: 'read', readAt: new Date().toISOString() }
            : msg
        )
      )
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
          </div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage and reply to contact messages</p>
            </div>
            <div className="text-right">
              <button
                onClick={addTestMessage}
                className="mb-2 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Add Test Message
              </button>
              <p className="text-sm text-gray-500">Fares Evangelical Believers International Church</p>
              <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Messages ({messages.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">No messages yet</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Contact messages will appear here
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${
                        selectedMessage?.id === message.id ? 'bg-blue-50' : ''
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
                          <h3 className="font-medium text-gray-900 truncate">{message.name}</h3>
                          <p className="text-sm text-gray-600 truncate">{message.email}</p>
                          <p className="text-sm text-gray-700 mt-1 line-clamp-2">{message.message}</p>
                        </div>
                        <div className="ml-3 flex flex-col items-end gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            message.status === 'new' ? 'bg-blue-100 text-blue-800' :
                            message.status === 'read' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {message.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Message Details & Reply */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              {selectedMessage ? (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Message Details</h2>
                  
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">From</label>
                      <p className="font-semibold text-gray-900">{selectedMessage.name}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{selectedMessage.email}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Subject</label>
                      <p className="text-gray-900">{selectedMessage.subject}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Message</label>
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Received</label>
                      <p className="text-gray-900">
                        {new Date(selectedMessage.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Reply Section */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Reply to Message</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="reply" className="block text-sm font-medium text-gray-700 mb-2">
                          Your Reply
                        </label>
                        <textarea
                          id="reply"
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Type your reply here..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleReply(selectedMessage.id)}
                          disabled={isSending}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isSending ? 'Sending...' : 'Send Reply'}
                        </button>
                        
                        <button
                          onClick={() => {
                            setSelectedMessage(null)
                            setReplyText('')
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Existing Reply */}
                  {selectedMessage.reply && (
                    <div className="border-t pt-6 mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Previous Reply</h3>
                      <div className="bg-green-50 border border-green-200 rounded-md p-4">
                        <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.reply}</p>
                        <p className="text-sm text-gray-600 mt-2">
                          Replied on: {new Date(selectedMessage.repliedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 00-2 2v6a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-1a1 1 0 100-2h1a4 4 0 014 4v6a4 4 0 01-4 4H6a4 4 0 01-4-4V7a4 4 0 014-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">Select a message to view details</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Click on any message from the list to see details and reply
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimpleAdminDashboard
