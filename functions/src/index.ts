import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import * as nodemailer from 'nodemailer'
import * as cors from 'cors'

// Initialize Firebase Admin
admin.initializeApp()

// Configure CORS
const corsHandler = cors({ origin: true })

// Email configuration (using Gmail for simplicity - you can change to SendGrid/SES)
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'fares.church.ethiopia@gmail.com', // Your church email
    pass: process.env.EMAIL_PASS || 'your_app_password' // Use app password for Gmail
  }
})

// Send verification code email
export const sendVerificationCode = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const { email, code } = req.body

      // Validate input
      if (!email || !code) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and code are required' 
        })
      }

      // Authorized admin emails
      const authorizedEmails = [
        'abebe.t.samuel@gmail.com',
        'pastorfirewzeneb@gmail.com'
      ]

      if (!authorizedEmails.includes(email.toLowerCase())) {
        // Log unauthorized attempt
        console.log('Unauthorized email attempt:', email)
        return res.status(403).json({ 
          success: false, 
          message: 'Email not authorized for admin access' 
        })
      }

      // Email content
      const mailOptions = {
        from: 'Fares Church Admin <fares.church.ethiopia@gmail.com>',
        to: email,
        subject: '🔐 Admin Login Verification Code - Fares Church',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin Login Verification</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
              .code { background: #1e40af; color: white; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; letter-spacing: 5px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
              .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Admin Login Verification</h1>
                <p>Fares Evangelical Believers International Church</p>
              </div>
              <div class="content">
                <p>Hello Administrator,</p>
                <p>You requested to access the admin dashboard. Please use the verification code below:</p>
                
                <div class="code">${code}</div>
                
                <div class="warning">
                  <strong>⚠️ Security Notice:</strong>
                  <ul>
                    <li>This code expires in 10 minutes</li>
                    <li>Never share this code with anyone</li>
                    <li>Only enter it on the official admin login page</li>
                    <li>If you didn't request this, please contact security immediately</li>
                  </ul>
                </div>
                
                <p>If you have any issues, please contact the church administration.</p>
                
                <div class="footer">
                  <p>🙏 Fares Evangelical Believers International Church</p>
                  <p><em>Serving God, Serving People</em></p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `
      }

      // Send email
      await transporter.sendMail(mailOptions)

      // Log successful send
      console.log('Verification code sent to:', email)

      return res.status(200).json({ 
        success: true, 
        message: 'Verification code sent successfully' 
      })

    } catch (error) {
      console.error('Error sending verification code:', error)
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send verification code' 
      })
    }
  })
})

// Test email function (for development)
export const testEmail = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    try {
      const mailOptions = {
        from: 'Fares Church Admin <fares.church.ethiopia@gmail.com>',
        to: 'abebe.t.samuel@gmail.com',
        subject: '🧪 Test Email - Fares Church Admin',
        html: `
          <h2>Test Email Successful</h2>
          <p>This is a test email from the Fares Church Admin system.</p>
          <p>Timestamp: ${new Date().toISOString()}</p>
        `
      }

      await transporter.sendMail(mailOptions)

      return res.status(200).json({ 
        success: true, 
        message: 'Test email sent successfully' 
      })

    } catch (error) {
      console.error('Error sending test email:', error)
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send test email',
        error: error.message 
      })
    }
  })
})
