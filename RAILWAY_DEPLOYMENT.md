# 🚀 Railway Deployment Guide - Rakshak Sindoor

## Quick Start (3 Steps)

### Step 1: Sign Up / Log In to Railway
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "Create a new project"

### Step 2: Connect Your GitHub Repository
1. Click "Deploy from GitHub repo"
2. Search for `RakshakSindoorUI`
3. Select the repository
4. Click "Deploy"

### Step 3: Configure Environment Variables (Optional)
If your app uses a database or other services:
1. Go to your Railway project
2. Click on the service
3. Go to "Variables" tab
4. Add environment variables (if needed):
   - `NODE_ENV=production`
   - `PORT=3000` (Railway auto-assigns)

---

## Automated Deployment

Railway will automatically:
1. ✅ Detect Node.js project
2. ✅ Install dependencies (`npm install`)
3. ✅ Run build script (`npm run build`)
4. ✅ Start the app (`npm run start`)
5. ✅ Assign a public URL
6. ✅ Handle HTTPS certificate

---

## What We've Set Up

### railway.json
- Configures the build process
- Sets deployment settings
- Enables auto-restart on failure

### Procfile
- Tells Railway how to start the app
- Uses `npm run start` command

### package.json scripts
```json
{
  "build": "vite build && esbuild server/index.ts ...",
  "start": "cross-env NODE_ENV=production node dist/index.js"
}
```

---

## After Deployment

### View Your Live App
Once deployed, Railway will give you a URL like:
```
https://rakshakui-production.up.railway.app
```

### Monitor Logs
1. Go to Railway dashboard
2. Click on your service
3. View "Logs" tab for real-time logs

### View Metrics
- CPU usage
- Memory usage
- Network traffic
- Response times

---

## Features Included

✅ **Automatic Updates**
- Push to GitHub → Auto-deploys

✅ **SSL/HTTPS**
- Automatic certificate

✅ **High Availability**
- Runs on Railway's servers
- Automatic scaling

✅ **Custom Domain** (Optional)
- Go to Settings → Domain
- Add your custom domain

---

## Troubleshooting

### App Not Starting?
1. Check Railway logs
2. Verify `npm run build` succeeds locally
3. Check for missing environment variables

### Port Issues?
Railway auto-assigns `PORT` environment variable. Our app uses:
```javascript
const PORT = process.env.PORT || 3000;
```

### Database Connection?
Add database variables in Railway Variables section:
```
DATABASE_URL=your_connection_string
```

---

## Performance Metrics

- **Build Size**: ~1.2MB
- **Gzipped**: ~360KB
- **Startup Time**: <30 seconds
- **Region**: Auto-selected (closest to you)

---

## Next Steps After Deploy

1. **Test the app**: Visit your Railway URL
2. **Set custom domain**: In Railway Settings
3. **Monitor performance**: Check logs regularly
4. **Update**: Push to GitHub for auto-deployment

---

## Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Status Page**: [status.railway.app](https://status.railway.app)
- **GitHub Issues**: [parvgarg05/RakshakSindoorUI/issues](https://github.com/parvgarg05/RakshakSindoorUI/issues)

---

**Status**: Ready for Railway Deployment ✅
**Last Updated**: February 2, 2026
