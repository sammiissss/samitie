# Netlify Deployment Guide

## Overview
This guide explains how to deploy both the admin and client applications to Netlify.

## Prerequisites
- Netlify account (free)
- Git repository (GitHub, GitLab, or Bitbucket)
- Firebase project configured
- Environment variables ready

## Step 1: Prepare Your Applications

### Admin Application
```bash
cd admin
npm install
npm run build
```

### Client Application
```bash
cd client
npm install
npm run build
```

## Step 2: Set Up Environment Variables

### For Admin Application
Create `admin/.env.production`:
```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### For Client Application
Create `client/.env.production`:
```bash
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Step 3: Deploy to Netlify

### Option 1: Using Netlify CLI (Recommended)

#### Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### Deploy Admin Application
```bash
cd admin
netlify login
netlify link
netlify deploy --prod --dir=dist
```

#### Deploy Client Application
```bash
cd client
netlify login
netlify link
netlify deploy --prod --dir=dist
```

### Option 2: Using Git (Automatic Deployment)

#### Push to Git Repository
```bash
git add .
git commit -m "Ready for Netlify deployment"
git push origin main
```

#### Connect to Netlify
1. Go to [Netlify](https://app.netlify.com)
2. Click "New site from Git"
3. Connect your Git repository
4. Select the branch (usually `main` or `master`)
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18`

#### Set Environment Variables in Netlify
1. Go to Site settings → Environment variables
2. Add all Firebase environment variables
3. Click "Save"

### Option 3: Drag and Drop (Simplest)

#### For Admin Application
```bash
cd admin
npm run build
```
1. Navigate to the `dist` folder
2. Drag and drop the entire `dist` folder to [Netlify](https://app.netlify.com/drop)

#### For Client Application
```bash
cd client
npm run build
```
1. Navigate to the `dist` folder
2. Drag and drop the entire `dist` folder to [Netlify](https://app.netlify.com/drop)

## Step 4: Configure Custom Domains (Optional)

### In Netlify Dashboard
1. Go to Site settings → Domain management
2. Add your custom domain
3. Update DNS settings as instructed

## Step 5: Test Deployments

### Admin Application Tests
- [ ] Login functionality works
- [ ] Message loading from Firebase
- [ ] Reply functionality
- [ ] Delete functionality
- [ ] Security features (CSRF, rate limiting)

### Client Application Tests
- [ ] User registration/login
- [ ] Contact form functionality
- [ ] Navigation between pages
- [ ] Firebase connection

## Configuration Files Already Created

### Netlify Configuration
Both applications have `netlify.toml` files with:
- Build settings
- Redirect rules for SPA routing
- Security headers
- Caching configuration

### Git Ignore
Both applications have `.gitignore` files to exclude:
- Node modules
- Build files
- Environment variables
- IDE files

## Troubleshooting

### Build Errors
- Check environment variables in Netlify dashboard
- Verify Firebase configuration
- Check build logs in Netlify

### Routing Issues
- Ensure `netlify.toml` is configured correctly
- Check redirect rules for SPA routing

### Firebase Connection Issues
- Verify Firebase API keys are correct
- Check Firebase security rules
- Ensure environment variables are set in Netlify

### Security Issues
- Check that environment variables are not exposed
- Verify security headers are working
- Test CSRF protection

## Production URLs
After deployment, you'll get URLs like:
- Admin: `https://your-admin-name.netlify.app`
- Client: `https://your-client-name.netlify.app`

## Next Steps
1. Deploy both applications
2. Test all functionality
3. Set up custom domains if needed
4. Monitor build logs and performance
5. Set up analytics if desired

## Support
For Netlify-specific issues, check the [Netlify documentation](https://docs.netlify.com/).
