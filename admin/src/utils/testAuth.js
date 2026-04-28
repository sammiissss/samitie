// Test script for double authentication system
import { emailVerificationService } from '../services/emailService'
import { SecurityLogger } from './security'

// Test function to verify the double authentication flow
export const testDoubleAuth = async () => {
  console.log('🧪 Testing Double Authentication System...')
  
  const testEmail = 'abebe.t.samuel@gmail.com'
  
  try {
    // Test 1: Send verification code
    console.log('\n📧 Test 1: Sending verification code...')
    const sendResult = await emailVerificationService.sendVerificationCode(testEmail)
    
    if (sendResult.success) {
      console.log('✅ Verification code sent successfully')
      console.log('📝 Check console for the verification code')
    } else {
      console.log('❌ Failed to send verification code:', sendResult.message)
      return false
    }
    
    // Test 2: Check if code exists
    console.log('\n🔍 Test 2: Checking if verification code exists...')
    const hasCode = emailVerificationService.hasVerificationCode(testEmail)
    console.log(hasCode ? '✅ Verification code exists' : '❌ Verification code not found')
    
    // Test 3: Simulate incorrect code
    console.log('\n❌ Test 3: Testing incorrect code...')
    const incorrectResult = emailVerificationService.verifyCode(testEmail, '123456')
    console.log(incorrectResult.success ? '❌ Should have failed' : '✅ Correctly rejected incorrect code')
    
    // Test 4: Test unauthorized email
    console.log('\n🚫 Test 4: Testing unauthorized email...')
    const unauthorizedResult = await emailVerificationService.sendVerificationCode('unauthorized@example.com')
    console.log(unauthorizedResult.success ? '❌ Should not allow unauthorized email' : '✅ Correctly rejected unauthorized email')
    
    console.log('\n🎉 Double authentication tests completed!')
    console.log('\n📋 Manual Testing Instructions:')
    console.log('1. Go to http://localhost:3001')
    console.log('2. Enter: abebe.t.samuel@gmail.com')
    console.log('3. Check console for verification code')
    console.log('4. Enter the 6-digit code')
    console.log('5. Verify access to admin dashboard')
    console.log('6. Test with pastorfirewzeneb@gmail.com')
    console.log('7. Test with unauthorized email (should fail)')
    
    return true
  } catch (error) {
    console.error('❌ Test failed:', error)
    SecurityLogger.logError(error, { context: 'double_auth_test' })
    return false
  }
}

// Test security logging
export const testSecurityLogging = () => {
  console.log('\n🔒 Testing Security Logging...')
  
  SecurityLogger.log('info', 'Test log message', { test: true })
  SecurityLogger.logSecurityEvent('Test security event', { test: true })
  SecurityLogger.logError(new Error('Test error'), { context: 'test' })
  
  console.log('✅ Security logging tests completed')
}

// Run tests in development
if (process.env.NODE_ENV === 'development') {
  console.log('🧪 Running authentication tests in development mode...')
  // Uncomment to run tests automatically
  // testDoubleAuth()
  // testSecurityLogging()
}
