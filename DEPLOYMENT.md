# Deployment Guide for Telegram OTP Bot

This bot is ready for deployment on various hosting platforms. Here are the deployment instructions:

## 🚀 Quick Deploy Options

### 1. Heroku
1. Click the "Deploy to Heroku" button (if available)
2. Set environment variables:
   - `EMAIL`: Your ivasms.com email
   - `PASSWORD`: Your ivasms.com password
   - `BOT_TOKEN`: Your Telegram bot token
   - `CHAT_ID`: Your Telegram chat ID
3. Deploy!

### 2. Railway
1. Connect your GitHub repository to Railway
2. Railway will automatically detect `railway.json`
3. Add environment variables in Railway dashboard
4. Deploy!

### 3. Render
1. Connect your GitHub repository to Render
2. Render will use `render.yaml` for configuration
3. Add environment variables in Render dashboard
4. Deploy!

### 4. Generic VPS/Server
1. Upload files to your server
2. Run: `chmod +x start.sh`
3. Create `.env` file with your credentials
4. Run: `./start.sh`

## 📋 Environment Variables Required

```
EMAIL=your_ivasms_email@gmail.com
PASSWORD=your_ivasms_password
BOT_TOKEN=your_telegram_bot_token
CHAT_ID=your_telegram_chat_id
```

## 🔧 Manual Installation

```bash
# Clone/upload the project
npm install

# Install Chrome browser for Puppeteer
npx puppeteer browsers install chrome

# Start the bot
node index.js
```

## 📱 Bot Features

- ✅ Auto-login to ivasms.com with session management
- ✅ Real-time OTP monitoring without page refresh
- ✅ Support for ALL services (Facebook, Gmail, WhatsApp, etc.)
- ✅ Duplicate prevention system
- ✅ Professional Telegram message formatting
- ✅ Click-to-copy OTP and phone numbers
- ✅ IST timezone timestamps
- ✅ Custom branding signature
- ✅ Automatic session recovery

## 🔍 Monitoring

The bot logs all activities to console:
- Login status
- OTP detection
- Telegram message sending
- Error handling

## 🛠️ Troubleshooting

- **Chrome Issues**: The bot automatically installs Chrome browser
- **Login Failures**: Check your ivasms.com credentials
- **Telegram Errors**: Verify your bot token and chat ID
- **Network Issues**: Bot has automatic retry mechanisms

## 📞 Support

The bot is production-ready and includes comprehensive error handling and logging for easy troubleshooting.