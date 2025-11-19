# Deployment Guide for Vercel

This guide will help you deploy the TheraConnect frontend to Vercel.

## Prerequisites

- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Your backend API deployed and accessible
- Git repository with your code

## Step 1: Environment Variables Setup

### Create `.env` file locally (for reference)

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

### Required Environment Variables

1. **VITE_BACKEND_BASE_URL** (Required)
   - Your deployed backend API URL
   - Example: `https://health-care-7oam.onrender.com/api`

### Optional Environment Variables

- `VITE_CASHFREE_APP_ID` - Cashfree payment gateway app ID
- `VITE_CASHFREE_ENVIRONMENT` - `PRODUCTION` or `TEST`
- `VITE_TWILIO_ACCOUNT_SID` - Twilio account SID for video calls
- `VITE_TWILIO_AUTH_TOKEN` - Twilio auth token for video calls

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. **⚠️ CRITICAL STEP**: Configure the project settings:
   - Click on **"Configure Project"** or **"Edit"** button
   - **Root Directory**: Set to `frontend` ⚠️ **This is the most important setting!**
     - Click the "Edit" link next to Root Directory
     - Type `frontend` and save
   - **Framework Preset**: Vite (or "Other" - Vercel will auto-detect)
   - **Build Command**: `npm run build` (auto-filled, runs from frontend directory)
   - **Output Directory**: `dist` (auto-filled, relative to frontend directory)
   - **Install Command**: `npm install` (auto-filled)

   **Why Root Directory matters**: Since your `package.json` and `vite.config.js` are in the `frontend` folder, Vercel needs to know to build from that directory. Without this setting, Vercel will try to build from the repo root and fail.

5. Add Environment Variables:
   - Go to "Environment Variables" section
   - Add `VITE_BACKEND_BASE_URL` with your backend URL: `https://health-care-7oam.onrender.com/api`
   - Add any other required environment variables

6. Click "Deploy"

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

3. Login to Vercel:
   ```bash
   vercel login
   ```

4. Deploy:
   ```bash
   vercel
   ```

5. For production deployment:
   ```bash
   vercel --prod
   ```

6. Set environment variables:
   ```bash
   vercel env add VITE_BACKEND_BASE_URL
   # Enter your backend URL when prompted
   ```

## Step 3: Post-Deployment Configuration

### Verify Environment Variables

1. Go to your project settings on Vercel
2. Navigate to "Environment Variables"
3. Ensure all required variables are set for:
   - Production
   - Preview (optional)
   - Development (optional)

### Redeploy After Adding Environment Variables

After adding or updating environment variables, you need to redeploy:

1. Go to "Deployments" tab
2. Click the three dots on the latest deployment
3. Click "Redeploy"

Or trigger a new deployment by pushing to your repository.

## Step 4: Custom Domain (Optional)

1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Verify Node.js version (Vercel uses Node 18.x by default)
- Check build logs for specific errors

### API Calls Fail

- Verify `VITE_BACKEND_BASE_URL` is set correctly
- Ensure your backend CORS settings allow requests from your Vercel domain
- Check browser console for CORS errors

### Environment Variables Not Working

- Ensure variables are prefixed with `VITE_`
- Redeploy after adding/updating environment variables
- Check that variables are set for the correct environment (Production/Preview)

## Local Development

For local development:

1. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your local backend URL if needed:
   ```
   VITE_BACKEND_BASE_URL=http://localhost:8080/api
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

## Notes

- The `vercel.json` file is already configured for SPA routing
- All API calls will use the `VITE_BACKEND_BASE_URL` environment variable
- The proxy configuration in `vite.config.js` is only for local development
- Production builds use the environment variable directly

