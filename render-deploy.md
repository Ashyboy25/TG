# Render Deployment Guide

## Quick Setup for Render.com

### 1. Upload Files to Render
Upload all project files to your Render service.

### 2. Configure Environment Variables
Set these environment variables in your Render dashboard:
- `EMAIL`: Your ivasms.com email
- `PASSWORD`: Your ivasms.com password  
- `BOT_TOKEN`: Your Telegram bot token
- `CHAT_ID`: Your Telegram chat ID
- `PORT`: 10000 (Render default)

### 3. Build and Start Commands
**Build Command:**
```bash
npm install && npx puppeteer browsers install chrome
```

**Start Command:**
```bash
node render-start.js
```

### 4. Service Configuration
- **Service Type**: Web Service
- **Environment**: Node.js
- **Plan**: Free (or higher)
- **Health Check Path**: `/health`
- **Port**: 10000

## Files for Render

### Main Files:
- `render-start.js` - Main entry point with health check
- `render.yaml` - Render configuration
- `package.json` - Dependencies

### Health Check Endpoint:
The bot creates a simple HTTP server on port 10000 that responds to `/health` with:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "telegram-otp-bot"
}
```

## Browser Configuration

The bot automatically detects Render hosting and uses optimized Chrome flags for container environments:
- Headless mode with GPU acceleration disabled
- Single process mode for resource efficiency
- Sandbox restrictions bypassed for container compatibility
- Minimal memory usage configuration

## Deployment Steps

1. **Create Render Service**
   - Go to Render dashboard
   - Create new Web Service
   - Connect your repository

2. **Configure Build Settings**
   - Build Command: `npm install && npx puppeteer browsers install chrome`
   - Start Command: `node render-start.js`

3. **Set Environment Variables**
   - Add all required variables listed above

4. **Deploy**
   - Click "Deploy" to start the service
   - Monitor logs for successful startup

## Expected Logs
```
🌐 Health check server running on port 10000
🚀 Starting Telegram OTP Bot for Render...
🌐 Configuring browser for Render hosting...
✅ Browser launched successfully for Render
✅ Telegram message sent successfully
🔐 Attempting to login...
✅ Login successful
👁️ Starting SMS monitoring...
```

## Troubleshooting

### Common Issues:
1. **Browser launch fails**: Check build logs for Chrome installation
2. **Login fails**: Verify EMAIL and PASSWORD environment variables
3. **Telegram fails**: Check BOT_TOKEN and CHAT_ID values
4. **Health check fails**: Ensure PORT is set to 10000

### Chrome Installation Error Fix (Jan 2025):
If you see "Could not find Chrome" error, the latest fixes include:
- Automatic Chrome executable path detection for Render
- Proper PUPPETEER_CACHE_DIR environment variable configuration
- Build command ensures Chrome installation before startup
- Fallback executable path resolution in /opt/render/.cache/puppeteer

### Memory Issues:
If the service crashes due to memory limits, consider upgrading to a paid plan or optimizing browser settings further.

## Keep-Alive Feature

### Automatic Sleep Prevention
The bot includes a built-in keep-alive mechanism to prevent Render free tier services from sleeping:

- **Self-Ping**: Pings its own `/health` endpoint every 14 minutes
- **24/7 Uptime**: Keeps your bot active around the clock
- **Setup**: Add `RENDER_EXTERNAL_URL` environment variable with your service URL

### Setup Keep-Alive
1. Deploy your service first
2. Get your service URL (e.g., `https://your-service-name.onrender.com`)
3. Add environment variable: `RENDER_EXTERNAL_URL` = `https://your-service-name.onrender.com`
4. Redeploy

### Expected Keep-Alive Logs
```
🔄 Starting keep-alive mechanism...
⏰ Will ping https://your-service-name.onrender.com/health every 14 minutes
💗 Keep-alive ping successful
```

## Production Ready

This configuration is production-ready and includes:
- Automatic health checks
- Keep-alive mechanism for 24/7 uptime
- Graceful shutdown handling
- Environment-specific browser optimization
- Error handling and logging
- Render-specific port configuration