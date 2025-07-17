# Keep-Alive Guide for Render.com

## What is Keep-Alive?

Render.com's free tier services go to sleep after 15 minutes of inactivity. The keep-alive mechanism prevents your bot from sleeping by automatically pinging itself every 14 minutes.

## How It Works

✅ **Automatic Self-Ping**: The bot pings its own `/health` endpoint every 14 minutes
✅ **No External Dependencies**: Uses the bot's own health check endpoint
✅ **Smart Detection**: Only activates when `RENDER_EXTERNAL_URL` is set
✅ **Error Handling**: Continues working even if pings fail

## Setup Instructions

### 1. Deploy Your Bot to Render
Follow the standard deployment process using the build commands.

### 2. Get Your Service URL
After deployment, Render will provide you with a URL like:
```
https://your-service-name.onrender.com
```

### 3. Set Environment Variable
In your Render dashboard, add this environment variable:
- **Key**: `RENDER_EXTERNAL_URL`
- **Value**: `https://your-service-name.onrender.com`

### 4. Redeploy
After adding the environment variable, redeploy your service.

## Expected Logs

When keep-alive is active, you'll see these logs:
```
🌐 Health check server running on port 10000
🔄 Starting keep-alive mechanism...
⏰ Will ping https://your-service-name.onrender.com/health every 14 minutes
💗 Keep-alive ping successful
```

## Benefits

- **24/7 Uptime**: Your bot stays active around the clock
- **Instant Response**: No warm-up delays when OTP messages arrive
- **Free Solution**: Works within Render's free tier limits
- **Resource Efficient**: Minimal impact on your service

## Important Notes

⚠️ **Free Tier Limits**: Render free tier has 750 hours/month. Keep-alive ensures you use those hours continuously.

⚠️ **Upgrade Recommendation**: For production use, consider upgrading to a paid Render plan for better reliability.

## Alternative: External Keep-Alive Services

If you prefer an external solution, you can use services like:
- UptimeRobot (free tier available)
- Cronitor
- Pingdom

Simply set them to ping your health endpoint every 10-14 minutes.

## Troubleshooting

### Keep-Alive Not Working
1. Check if `RENDER_EXTERNAL_URL` is set correctly
2. Ensure the URL matches your actual service URL
3. Verify the health endpoint responds: `curl https://your-service-name.onrender.com/health`

### Service Still Sleeping
1. Check Render logs for keep-alive messages
2. Verify no errors in the ping requests
3. Ensure the interval is under 15 minutes

## Status Check

To verify keep-alive is working:
1. Check your Render logs for "💗 Keep-alive ping successful"
2. Monitor your service metrics in Render dashboard
3. Test accessing your service after 20+ minutes of "inactivity"