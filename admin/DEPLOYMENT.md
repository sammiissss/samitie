# Admin Dashboard Deployment Guide

## Overview
This guide explains how to deploy the admin dashboard to various hosting platforms.

## Prerequisites
- Node.js 18+ installed
- Firebase project configured
- Environment variables set

## Environment Setup

### 1. Production Environment Variables
Create `.env.production` file with your Firebase configuration:

```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 2. Build for Production
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview build locally
npm run preview
```

## Deployment Options

### Option 1: Vercel (Recommended)
1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel --prod
```

3. Configure environment variables in Vercel dashboard

### Option 2: Netlify
1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to Netlify

3. Set environment variables in Netlify dashboard

### Option 3: Firebase Hosting
1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize Firebase Hosting:
```bash
firebase init hosting
```

3. Configure `firebase.json`:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

4. Deploy:
```bash
firebase deploy --only hosting
```

### Option 4: Traditional Hosting
1. Build the project:
```bash
npm run build
```

2. Upload the `dist` folder to your hosting provider

3. Ensure server supports single-page applications (SPA routing)

## Security Considerations
- Firebase security rules should be properly configured
- Environment variables should never be exposed in client-side code
- Use HTTPS in production
- Regularly update dependencies

## Post-Deployment Checklist
- [ ] Test admin login functionality
- [ ] Verify Firebase connection
- [ ] Test message management features
- [ ] Check security headers
- [ ] Verify responsive design
- [ ] Test on different browsers

## Troubleshooting
- **Build errors**: Check environment variables and dependencies
- **Firebase connection issues**: Verify Firebase configuration
- **Routing issues**: Ensure server supports SPA routing
- **Security issues**: Check Firebase security rules

## Support
For deployment issues, check the build logs and ensure all environment variables are correctly configured.
