import { useState, useEffect } from 'react'
import { ref, onValue, push, set } from 'firebase/database'
import { database } from '../lib/firebase'

function TestFirebaseConnection() {
  const [testResults, setTestResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    console.log('🧪 Starting Firebase connection test...')
    
    // Test 1: Check if database is initialized
    if (!database) {
      console.error('❌ Database not initialized')
      setTestResults(prev => [...prev, 'Database: Not initialized'])
      return
    }

    // Test 2: Try to write to database
    const testWrite = async () => {
      try {
        const testRef = ref(database, 'testConnection')
        await set(testRef, {
          timestamp: new Date().toISOString(),
          message: 'Test connection from admin dashboard',
          testId: Math.random().toString(36).substring(2, 8)
        })
        
        console.log('✅ Test write successful')
        setTestResults(prev => [...prev, 'Write: Success'])
        
        // Test 3: Try to read from database
        const testRead = onValue(testRef, (snapshot) => {
          const data = snapshot.val()
          if (data && data.message) {
            console.log('✅ Test read successful:', data.message)
            setTestResults(prev => [...prev, 'Read: Success'])
          } else {
            console.log('❌ Test read failed - no data found')
            setTestResults(prev => [...prev, 'Read: Failed - No data'])
          }
        }, { onlyOnce: true })
        
        // Test 4: Check if we can read contactMessages
        const messagesRef = ref(database, 'contactMessages')
        const unsubscribe = onValue(messagesRef, (snapshot) => {
          const data = snapshot.val()
          if (data) {
            const messages = Object.keys(data)
            console.log('✅ ContactMessages read successful - found', messages.length, 'messages')
            setTestResults(prev => [...prev, `ContactMessages: Found ${messages.length} messages`])
          } else {
            console.log('❌ ContactMessages read failed - empty')
            setTestResults(prev => [...prev, 'ContactMessages: Failed - Empty'])
          }
        }, { onlyOnce: true })
        
        // Test 5: Try to add a test message
        const addTestMessage = async () => {
          try {
            const messagesRef = ref(database, 'contactMessages')
            const newMessageRef = push(messagesRef)
            
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
            setTestResults(prev => [...prev, 'Add Message: Success'])
          } catch (error) {
            console.error('❌ Test message add failed:', error)
            setTestResults(prev => [...prev, 'Add Message: Failed'])
          }
        }
        
        // Run all tests
        await Promise.all([testWrite(), testRead(), addTestMessage()])
        
        setIsLoading(false)
        console.log('🧪 All Firebase connection tests completed')
        
      } catch (error) {
        console.error('❌ Firebase test failed:', error)
        setTestResults(prev => [...prev, 'Test Suite: Failed'])
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-4xl bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Firebase Connection Test</h1>
        
        <div className="space-y-6">
          <button
            onClick={testWrite}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Firebase Connection'}
          </button>
          
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h2>
            
            {testResults.length === 0 ? (
              <p className="text-gray-500">Click "Test Firebase Connection" to run tests</p>
            ) : (
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className={`p-3 rounded-lg ${
                    result.includes('Success') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <p className="font-medium text-gray-900">{result}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestFirebaseConnection
