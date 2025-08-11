# Deployment Guide

## Overview
This guide covers deploying the NIT-JSR-Hub application to production environments. The application consists of a Next.js frontend/backend and an optional Express.js microservice for attendance tracking.

---

## Prerequisites

### Required Services
- **MongoDB Atlas** - Database hosting
- **Vercel** - Next.js application hosting
- **Supabase** - File storage
- **Pusher** - Real-time messaging
- **Stream.io** - Video calling
- **Render/Railway/Fly.io** - Microservice hosting (optional)

### Environment Variables
Prepare these environment variables for deployment:

```env
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret-32-chars-min"
NEXTAUTH_URL="https://yourdomain.com"

# Pusher
PUSHER_APP_ID="your-pusher-app-id"
NEXT_PUBLIC_PUSHER_APP_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"

# Stream.io
NEXT_PUBLIC_STREAM_API_KEY="your-stream-api-key"
STREAM_API_SECRET="your-stream-secret"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# Email (Optional)
SMTP_HOST="your-smtp-host"
SMTP_PORT="587"
SMTP_USER="your-email@domain.com"
SMTP_PASS="your-email-password"

# AI Features (Optional)
COHERE_API_KEY="your-cohere-api-key"
```

---

## MongoDB Atlas Setup

### 1. Create Cluster
1. Sign up for [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (M0 tier is free)
3. Configure database access and network access
4. Get connection string

### 2. Database Configuration
```javascript
// Network Access - Add your deployment platform's IPs
// For Vercel: Add 0.0.0.0/0 (allow from anywhere)
// For specific IPs, check your hosting provider's documentation

// Database Access - Create user with read/write permissions
```

### 3. Connection String Format
```
mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
```

---

## Vercel Deployment (Recommended)

### 1. Prepare Repository
```bash
# Ensure all dependencies are installed
npm install

# Test build locally
npm run build

# Commit all changes
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Connect to Vercel
1. Visit [Vercel Dashboard](https://vercel.com/dashboard)
2. Import your Git repository
3. Configure build settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 3. Environment Variables
Add all environment variables in Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add each variable from your `.env.local`
- Make sure to set appropriate environment (Production, Preview, Development)

### 4. Domain Configuration
1. Add custom domain in Vercel dashboard
2. Update `NEXTAUTH_URL` to match your domain
3. Configure DNS records as instructed

### 5. Build Settings
```json
// vercel.json (optional)
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1"]
}
```

---

## Alternative Hosting Platforms

### Netlify
```bash
# Build command
npm run build

# Publish directory
.next

# Environment variables
# Add via Netlify dashboard under Site Settings → Environment Variables
```

### Railway
```bash
# Dockerfile (create in root)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

# railway.toml
[build]
builder = "dockerfile"

[deploy]
startCommand = "npm start"
healthcheckPath = "/"
healthcheckTimeout = 100
restartPolicyType = "always"
```

---

## Microservice Deployment (Optional)

If using the attendance tracking microservice:

### Render Deployment
1. Create new Web Service on Render
2. Connect your repository
3. Configure service:
   - **Build Command**: `cd microservices/attendance-scraper && npm install`
   - **Start Command**: `cd microservices/attendance-scraper && npm start`
   - **Auto-Deploy**: Yes

### Environment Variables for Microservice
```env
DATABASE_URL="same-as-main-app"
COLLEGE_PORTAL_USERNAME="portal-username"
COLLEGE_PORTAL_PASSWORD="portal-password"
PORT="10000"
MAIN_APP_URL="https://yourdomain.com"
```

### Docker Deployment
```dockerfile
# microservices/attendance-scraper/Dockerfile
FROM node:18-alpine
RUN apk add --no-cache chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

EXPOSE 3001
CMD ["npm", "start"]
```

---

## Third-Party Service Configuration

### Pusher Setup
1. Create account at [Pusher](https://pusher.com)
2. Create new Channels app
3. Configure CORS for your domain
4. Note down App ID, Key, Secret, and Cluster

### Stream.io Setup
1. Create account at [Stream.io](https://stream.io)
2. Create new Video app
3. Configure authentication and permissions
4. Get API key and secret

### Supabase Setup
1. Create project at [Supabase](https://supabase.com)
2. Set up storage bucket for file uploads:
```sql
-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true);

-- Set up RLS policy
CREATE POLICY "Anyone can upload files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Anyone can view files" ON storage.objects
FOR SELECT USING (bucket_id = 'uploads');
```

---

## DNS and Domain Setup

### Custom Domain Configuration
1. Purchase domain from registrar
2. Add domain to hosting platform
3. Configure DNS records:
```
Type    Name    Value                   TTL
A       @       76.76.19.61            Auto
CNAME   www     your-app.vercel.app    Auto
```

### SSL/TLS Certificate
- Automatic with Vercel/Netlify
- Let's Encrypt for custom servers
- CloudFlare for additional CDN/security

---

## Performance Optimization

### Build Optimization
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true
  },
  images: {
    domains: ['your-supabase-project.supabase.co'],
    formats: ['image/webp', 'image/avif']
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true
}

module.exports = nextConfig
```

### Database Optimization
```javascript
// Prisma configuration for production
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-1.0.x"]
  previewFeatures = ["fullTextSearch"]
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```

---

## Monitoring and Analytics

### Error Tracking
```bash
# Install Sentry (optional)
npm install @sentry/nextjs

# Configure in sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### Performance Monitoring
```javascript
// Add to next.config.js
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
}
```

### Uptime Monitoring
- Use UptimeRobot or similar service
- Monitor main application and microservice endpoints
- Set up alerts for downtime

---

## Security Considerations

### Environment Security
- Never commit `.env` files to repository
- Use platform-specific secret management
- Rotate secrets regularly

### CORS Configuration
```javascript
// Pusher CORS settings
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: 'us2',
  useTLS: true,
  // Add allowed origins
  cors: {
    credentials: true,
    origin: [
      'https://yourdomain.com',
      'https://www.yourdomain.com'
    ]
  }
});
```

### Content Security Policy
```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ];
  }
};
```

---

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Check for TypeScript errors
npm run lint
```

#### Database Connection
```bash
# Test connection
npx prisma db push
npx prisma generate
```

#### Missing Environment Variables
- Ensure all required variables are set
- Check variable names match exactly
- Verify values are correct (no extra spaces)

#### Deployment Logs
- Check Vercel function logs
- Monitor database connection errors
- Review third-party service status

### Performance Issues
- Enable database connection pooling
- Implement proper caching strategies
- Monitor bundle size with `npm run analyze`
- Use CDN for static assets

---

## Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database connection working
- [ ] File upload working
- [ ] Real-time chat functioning
- [ ] Video calls connecting
- [ ] Email notifications sending
- [ ] SSL certificate active
- [ ] Domain redirects properly
- [ ] Error monitoring configured
- [ ] Uptime monitoring active
- [ ] Backup strategy implemented