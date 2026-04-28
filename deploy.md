# Deployment Guide for Fares Evangelical Believers International Church

## Overview
This deployment strategy creates two separate websites:
- **Client Website**: Public-facing church website for members and visitors
- **Admin Website**: Secure admin dashboard for church administrators

## 📁 Project Structure
```
WEBSITE/
├── client/          # Public website (fareschurch.org)
├── admin/           # Admin dashboard (admin.fareschurch.org)
└── shared/          # Shared components and utilities
```

## 🌐 Domain Strategy

### Option 1: Subdomains (Recommended)
- **Client**: `fareschurch.org`
- **Admin**: `admin.fareschurch.org`

### Option 2: Separate Domains
- **Client**: `fareschurch.org`
- **Admin**: `fares-admin.org`

### Option 3: Path-based
- **Client**: `fareschurch.org`
- **Admin**: `fareschurch.org/admin`

## 🚀 Deployment Steps

### 1. Build Client Website
```bash
cd client
npm run build
```

### 2. Build Admin Website
```bash
cd ../admin
npm run build
```

### 3. Deploy to Hosting

#### Netlify Deployment
```bash
# Deploy client site
cd client
netlify deploy --prod --dir=dist

# Deploy admin site
cd ../admin
netlify deploy --prod --dir=dist
```

#### Vercel Deployment
```bash
# Deploy client site
cd client
vercel --prod

# Deploy admin site
cd ../admin
vercel --prod
```

#### Traditional Hosting
```bash
# Upload client/dist to main domain
# Upload admin/dist to admin subdomain
```

## 🔧 Configuration Files

### Client Site Configuration
- **Base URL**: `/`
- **Port**: 3000
- **Build Output**: `client/dist`

### Admin Site Configuration
- **Base URL**: `/admin/`
- **Port**: 3001
- **Build Output**: `admin/dist`

## 🔐 Security Features

### Admin Website Security
- **Access Control**: Only 2 authorized users
  - `pastorfirewzeneb@gmail.com`
  - `admin@gracegospeladdis.org`
- **Rate Limiting**: Prevents brute force attacks
- **CSRF Protection**: Prevents cross-site request forgery
- **Session Management**: 30-minute session timeout
- **Input Validation**: All inputs are validated and sanitized
- **Security Logging**: All admin actions are logged

### Client Website Security
- **Input Validation**: Form inputs are validated
- **XSS Protection**: Prevents cross-site scripting
- **Secure Firebase**: Secure database operations
- **Session Security**: User session management

## 📋 Environment Variables

### Client Site (.env)
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Admin Site (.env)
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 🔄 Development Workflow

### Local Development
```bash
# Start client site
cd client
npm run dev

# Start admin site (in separate terminal)
cd admin
npm run dev
```

### Production Build
```bash
# Build both sites
npm run build:client
npm run build:admin
```

## 🌍 DNS Configuration

### Subdomain Setup
1. **Client Site**: Point `fareschurch.org` to client hosting
2. **Admin Site**: Point `admin.fareschurch.org` to admin hosting

### A Record Example
```
fareschurch.org     A     192.168.1.1
admin.fareschurch.org A     192.168.1.1
```

## 📊 Monitoring and Maintenance

### Security Monitoring
- Admin actions are logged and monitored
- Failed login attempts are tracked
- Rate limiting prevents abuse
- Session security is enforced

### Performance Monitoring
- Separate analytics for both sites
- Error tracking and reporting
- Uptime monitoring

## 🚨 Important Notes

### Security Considerations
- Admin site should be password-protected at the server level
- Use HTTPS for both sites
- Regular security updates
- Monitor access logs

### Backup Strategy
- Regular database backups
- Code repository backups
- Configuration backups

### Scaling Considerations
- CDN for static assets
- Database optimization
- Load balancing for high traffic

## 📞 Support

For deployment issues:
1. Check environment variables
2. Verify Firebase configuration
3. Review build logs
4. Test admin access with authorized users

## 🔄 Updates and Maintenance

### Regular Tasks
- Update dependencies
- Security patches
- Backup verification
- Log review

### Emergency Procedures
- Security incident response
- Site recovery procedures
- Contact information for support
