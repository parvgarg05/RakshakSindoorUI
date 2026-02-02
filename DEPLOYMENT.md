# Rakshak Sindoor - Deployment Guide

## Build Status ✅
The project has been successfully built and is ready for deployment.

### Build Output
- **Client Bundle**: `dist/public/assets/` (CSS & JS)
- **Server Bundle**: `dist/index.js`
- **Build Time**: 18.49s
- **Total Size**: ~1.2MB (gzipped: ~360KB)

---

## Deployment Options

### Option 1: Self-Hosted (Linux/Ubuntu Server)

#### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Database (PostgreSQL/Neon if using database features)

#### Steps

1. **Upload files to server:**
```bash
scp -r dist/ user@server:/app/
scp -r node_modules/ user@server:/app/
scp package.json user@server:/app/
```

2. **On the server, set environment variables:**
```bash
export NODE_ENV=production
export DATABASE_URL="your_database_url"  # if applicable
export PORT=3000
```

3. **Start the application:**
```bash
cd /app
npm run start
# or
node dist/index.js
```

4. **For persistent running, use PM2:**
```bash
npm install -g pm2
pm2 start dist/index.js --name "rakshak-sindoor"
pm2 startup
pm2 save
```

---

### Option 2: Docker Deployment

#### Create a Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy built files
COPY dist ./dist
COPY package.json ./package.json
COPY node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/index.js"]
```

#### Build and run Docker image
```bash
docker build -t rakshak-sindoor:latest .
docker run -d -p 3000:3000 \
  --env NODE_ENV=production \
  --env PORT=3000 \
  rakshak-sindoor:latest
```

---

### Option 3: Cloud Platforms

#### A. Vercel Deployment
```bash
npm i -g vercel
vercel deploy --prod
```

#### B. Heroku Deployment
```bash
heroku create your-app-name
git push heroku main
```

#### C. Railway/Render/Fly.io
- Connect your GitHub repository
- Select Node.js environment
- Set Node version to 18+
- Deploy automatically

---

### Option 4: Docker Compose (Production Setup)

#### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=${DATABASE_URL}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Deploy with:
```bash
docker-compose up -d
```

---

## Production Checklist

- [ ] Build completed without errors
- [ ] Environment variables configured
- [ ] Database connection tested (if applicable)
- [ ] HTTPS/SSL certificate installed
- [ ] Firewall rules configured
- [ ] Reverse proxy (nginx) setup (optional but recommended)
- [ ] Monitoring/logging enabled
- [ ] Backups configured

---

## Nginx Reverse Proxy Configuration (Recommended)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Post-Deployment Verification

After deployment, verify:

1. **Health Check**
```bash
curl https://your-domain.com/health
```

2. **Application loads**
```bash
curl https://your-domain.com
```

3. **API endpoints respond**
```bash
curl https://your-domain.com/api/
```

---

## Performance Notes

⚠️ **Build Warnings (Non-Critical)**
- Large chunk size (~1.2MB) - considered for optimization
- Dynamic import warning - not affecting functionality

These are normal for a feature-rich application and won't impact deployment.

---

## Support

For deployment issues:
1. Check Node.js version: `node --version` (should be 18+)
2. Verify all environment variables are set
3. Check server logs for errors
4. Ensure port 3000 (or configured port) is accessible

---

**Last Updated**: February 2, 2026
**Status**: Ready for Production Deployment ✅
