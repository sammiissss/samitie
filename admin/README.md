# Admin Dashboard - Double Authentication System

## 🔐 Security Overview

The admin dashboard implements a comprehensive double authentication system with email verification to ensure maximum security for church administration.

### 🛡️ Security Features

#### **Access Control**
- **Only 2 authorized users**:
  - `abebe.t.samuel@gmail.com`
  - `pastorfirewzeneb@gmail.com`
- **Email verification required** for all admin access
- **Session timeout**: 30 minutes of inactivity
- **Automatic logout** on session expiry

#### **Double Authentication Flow**
1. **Email Verification**: Enter authorized admin email
2. **6-Digit Code**: Receive verification code via email
3. **Access Granted**: Access admin dashboard for 30 minutes

#### **Security Monitoring**
- **All login attempts logged**
- **Failed verification attempts tracked**
- **Rate limiting** prevents brute force attacks
- **Session hijacking detection**
- **CSRF protection** for all admin actions

## 🚀 Getting Started

### Development Setup

```bash
cd admin
npm install
npm run dev
```

The admin site will be available at: `http://localhost:3001`

### Login Process

1. **Navigate to**: `http://localhost:3001`
2. **Enter authorized email**: 
   - `abebe.t.samuel@gmail.com` or
   - `pastorfirewzeneb@gmail.com`
3. **Check console** for 6-digit verification code
4. **Enter code** to access dashboard
5. **Session expires** after 30 minutes

## 📧 Email Verification System

### Current Implementation (Development)
- **Console logging**: Verification codes displayed in browser console
- **10-minute expiry**: Codes expire after 10 minutes
- **3 attempts max**: Lockout after 3 failed attempts
- **Resend capability**: Request new code after expiry

### Production Setup
To implement real email sending, update `emailService.js`:

```javascript
// Replace simulateEmailSend with real email service
async sendRealEmail(email, code) {
  // Options:
  // 1. SendGrid
  // 2. AWS SES
  // 3. Firebase Functions with SendGrid
  // 4. Node.js mailer with SMTP
}
```

## 🔧 Configuration

### Environment Variables
Create `.env` file in admin directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Firebase Security Rules
Ensure your Firebase Realtime Database has proper security rules:

```json
{
  "rules": {
    "contactMessages": {
      ".read": "auth !== null && auth.token.email.matches(/^(abebe\\.t\\.samuel|pastorfirewzeneb)@gmail\\.com$/)",
      ".write": "auth !== null && auth.token.email.matches(/^(abebe\\.t\\.samuel|pastorfirewzeneb)@gmail\\.com$/)"
    }
  }
}
```

## 🧪 Testing

### Automated Tests
Run the test suite:

```javascript
import { testDoubleAuth } from './utils/testAuth'
testDoubleAuth()
```

### Manual Testing Checklist

#### ✅ Positive Tests
- [ ] Login with `abebe.t.samuel@gmail.com`
- [ ] Login with `pastorfirewzeneb@gmail.com`
- [ ] Verify correct 6-digit code
- [ ] Access admin dashboard
- [ ] Send message replies
- [ ] Mark messages as read
- [ ] Logout functionality

#### ❌ Negative Tests
- [ ] Login with unauthorized email
- [ ] Incorrect verification code
- [ ] Expired verification code
- [ ] Too many failed attempts
- [ ] Session timeout
- [ ] Direct dashboard access without verification

## 📊 Security Logging

All admin activities are logged:

### Logged Events
- **Login attempts** (success/failure)
- **Verification attempts** (success/failure)
- **Message actions** (reply, mark as read)
- **Session events** (expiry, logout)
- **Security violations** (unauthorized access)

### Log Locations
- **Development**: Browser console
- **Production**: Configured logging endpoint

## 🔒 Security Best Practices

### For Administrators
1. **Use strong passwords** for email accounts
2. **Enable 2FA** on email accounts
3. **Don't share verification codes**
4. **Logout** after admin sessions
5. **Monitor** for suspicious activity

### For Developers
1. **Keep dependencies updated**
2. **Regular security audits**
3. **Monitor logs** for threats
4. **Test security measures** regularly
5. **Backup security configurations**

## 🚨 Troubleshooting

### Common Issues

#### "Email not authorized"
- **Solution**: Use only the two authorized emails
- **Check**: Email spelling and case sensitivity

#### "Verification code expired"
- **Solution**: Request new code
- **Wait**: 10 minutes for expiry, then resend

#### "Too many failed attempts"
- **Solution**: Wait and request new code
- **Limit**: 3 attempts per code

#### "Session expired"
- **Solution**: Re-login with email verification
- **Duration**: 30-minute session timeout

### Debug Mode
Enable debug logging:

```javascript
localStorage.setItem('debug', 'true')
```

## 📱 Mobile Access

The admin dashboard is mobile-responsive and can be accessed on:
- **Desktop browsers**
- **Tablet devices**
- **Mobile phones**

### Mobile Considerations
- **Secure connection** required (HTTPS in production)
- **Email access** needed for verification codes
- **Session timeout** applies on mobile too

## 🔄 Deployment

### Production Deployment
1. **Build the admin site**: `npm run build`
2. **Deploy to secure hosting**
3. **Configure HTTPS**
4. **Set up real email service**
5. **Test all security features**

### Security Checklist Before Deployment
- [ ] HTTPS configured
- [ ] Real email service integrated
- [ ] Firebase security rules updated
- [ ] Admin emails verified
- [ ] Session timeout tested
- [ ] Rate limiting tested
- [ ] Logging configured

## 📞 Support

For security issues or access problems:
1. **Check logs** for error details
2. **Verify email authorization**
3. **Test with authorized emails only**
4. **Contact developer** for persistent issues

---

**⚠️ Security Notice**: This admin panel contains sensitive church data. Only authorized administrators may access this system. All access attempts are logged and monitored.
