import React, { useState, useEffect, Suspense } from 'react'
import { ref, onValue, update, push, set, remove } from 'firebase/database'
import { database } from '../lib/firebase'
import TestFirebaseConnection from './TestFirebaseConnection'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ BrandAdminDashboard Error Boundary caught an error:', error, errorInfo)
    this.setState({ hasError: true, error })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
          <div className="max-w-4xl bg-white rounded-lg shadow-xl p-8">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Admin Dashboard Error</h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h2>
              <p className="text-red-700 mb-4">The admin dashboard encountered an error and couldn't display properly.</p>
              <div className="bg-gray-100 rounded p-4">
                <p className="text-sm text-gray-600 mb-2"><strong>Error Details:</strong></p>
                <pre className="text-xs text-gray-800 bg-white p-2 rounded overflow-auto">
                  {this.state.error && this.state.error.toString()}
                </pre>
              </div>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function BrandAdminDashboard() {
  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [loading, setLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [activeTab, setActiveTab] = useState('messages') // 'messages' or 'users'

  useEffect(() => {
    console.log('🚀 Brand Admin Dashboard - Starting initialization...')
    
    // Check Firebase database connection first
    if (!database) {
      console.error('❌ Firebase database not initialized')
      setMessages([])
      setUsers([])
      setLoading(false)
      return
    }

    // Load messages from database
    const messagesRef = ref(database, 'contactMessages')
    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      console.log('📥 Messages snapshot received:', snapshot)
      console.log('📥 Snapshot exists:', !!snapshot.exists())
      
      const data = snapshot.val()
      console.log('📥 Raw Firebase data:', data)
      console.log('📥 Data type:', typeof data)
      console.log('📥 Data keys:', data ? Object.keys(data) : 'null')
      
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
      console.error('📥 Error details:', {
        code: error.code,
        message: error.message,
        details: error.details
      })
      setMessages([])
      setLoading(false)
    })

    // Users functionality temporarily disabled due to Firebase permission issues
    setUsers([])
    console.log('👥 Users functionality disabled due to Firebase permission issues')
    setLoading(false)
      console.log('👥 Users snapshot received:', snapshot)
      
      const data = snapshot.val()
      if (data) {
        const usersList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        })).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        
        console.log('👥 Users loaded:', usersList.length)
        setUsers(usersList)
      } else {
        console.log('👥 No users found')
        setUsers([])
      }
    }, (error) => {
      console.error('❌ Users database error:', error)
      setUsers([])
    })

    return () => {
      unsubscribeMessages()
      unsubscribeUsers()
    }
  }, [])

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
        status: 'replied',
        repliedBy: 'Admin'
      })

      // Update local state
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === messageId 
            ? { ...msg, reply: replyText.trim(), repliedAt: new Date().toISOString(), status: 'replied', repliedBy: 'Admin' }
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
      
      console.log('📖 Message marked as read:', messageId)
    } catch (error) {
      console.error('❌ Error marking as read:', error)
    }
  }

  const deleteUser = async (userId) => {
    if (!confirm(`Are you sure you want to delete this user? This action cannot be undone.`)) {
      return
    }

    try {
      await remove(ref(database, `users/${userId}`))
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId))
      alert('✅ User deleted successfully!')
      
      console.log('🗑️ User deleted:', userId)
    } catch (error) {
      console.error('❌ Error deleting user:', error)
      alert('❌ Failed to delete user. Please try again.')
    }
  }

  const deleteMessage = async (messageId) => {
    if (!confirm(`Are you sure you want to delete this message? This action cannot be undone.`)) {
      return
    }

    try {
      await remove(ref(database, `contactMessages/${messageId}`))
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

  const addUser = async () => {
    const name = prompt('Enter user name:')
    const email = prompt('Enter user email:')
    const phone = prompt('Enter user phone:')
    const role = prompt('Enter user role (member/leader):')

    if (!name || !email) {
      alert('Name and email are required')
      return
    }

    try {
      const usersRef = ref(database, 'users')
      const newUserRef = push(usersRef)
      
      const newUser = {
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || '',
        role: role?.trim() || 'member',
        createdAt: new Date().toISOString(),
        status: 'active'
      }
      
      await set(newUserRef, newUser)
      alert('✅ User added successfully!')
      
      console.log('👤 User added:', newUser)
    } catch (error) {
      console.error('❌ Error adding user:', error)
      alert('❌ Failed to add user. Please try again.')
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
          <p className="text-gray-600">Loading admin dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">Initializing user management system</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">User Management & Message System</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Fares Evangelical Believers International Church</p>
              <p className="text-xs text-gray-400 mt-1">Brand Admin Panel</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('messages')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'messages' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              Messages ({messages.length})
            </button>
            
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M12 4.35a2 2 0 114 2 2 0 0-2-1.64 0-2.36 0-2 0zm1 0h1a1 1 0 011 1v1a1 1 0 011 3 0 1.64 0 1.64 0 0zm0 3h1a1 1 0 011 1v1a1 1 0 011 3 0 1.64 0 1.64 0 0z" />
              </svg>
              Users ({users.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {activeTab === 'messages' && (
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Messages List */}
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">Messages ({messages.length})</h2>
                        <button
                          onClick={addTestMessage}
                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                        >
                          Add Test Message
                        </button>
                      </div>
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
                          <p className="text-gray-400 text-xs mt-2">
                            Click "Add Test Message" to create a test message
                          </p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${
                              selectedMessage?.id === message.id ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
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
                                <h3 className="font-semibold text-gray-900 truncate">{message.name}</h3>
                                <p className="text-sm text-gray-600 truncate">{message.email}</p>
                                <p className="text-sm text-gray-700 mt-1 line-clamp-2">{message.message}</p>
                                {message.reply && (
                                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                                    <p className="text-sm text-green-800">
                                      <strong>Reply:</strong> {message.reply}
                                    </p>
                                    <p className="text-xs text-green-600 mt-1">
                                      Replied: {new Date(message.repliedAt).toLocaleString()}
                                    </p>
                                  </div>
                                )}
                              </div>
                              <div className="ml-3 flex flex-col items-end gap-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  message.status === 'new' ? 'bg-blue-100 text-blue-800' :
                                  message.status === 'read' ? 'bg-yellow-100 text-yellow-800' :
                                  message.status === 'replied' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
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
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-lg shadow">
                    {selectedMessage ? (
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <h2 className="text-lg font-semibold text-gray-900">Message Details</h2>
                          <button
                            onClick={() => deleteMessage(selectedMessage.id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          >
                            Delete Message
                          </button>
                        </div>
                        
                        <div className="space-y-4">
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
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100 2H9z" />
                            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 00-2 2v6a2 2 0 014 4h8a2 2 0 002-2V7a4 4 0 014-4z" clipRule="evenodd" />
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
          )}

          {activeTab === 'users' && (
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Users ({users.length})</h2>
                    <button
                      onClick={addUser}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Add New User
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  {/* Firebase Connection Test */}
                  <TestFirebaseConnection />
                  
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center">
                            <div className="text-gray-500">
                              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M12 4.35a2 2 0 114 2 2 0 0-2.36 0-2.36 0-2zm1 0h1a1 1 0 011 1v1a1 1 0 011 3 0 1.64 0 1.64 0 0zm0 3h1a1 1 0 011 1v1a1 1 0 011 3 0 1.64 0 1.64 0 0z" />
                                </svg>
                              </div>
                              <p className="text-gray-500 font-medium">No users yet</p>
                              <p className="text-gray-400 text-sm mt-1">
                                Click "Add New User" to create the first user
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{user.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-gray-600">{user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-gray-600">{user.phone || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BrandAdminDashboard
