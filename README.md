# Telegram OTP Bot for ivasms.com

A production-ready Node.js bot that monitors ivasms.com for new OTP messages and sends formatted notifications to Telegram channels with click-to-copy functionality.

## 🚀 Quick Deploy

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)
[![Deploy to Railway](https://railway.app/button.svg)](https://railway.app/new/template)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## ✨ Features

- 🔐 **Auto-login**: Automatically logs in to ivasms.com with session management
- 👁️ **Live monitoring**: Monitors SMS page without refreshing using MutationObserver
- 🔍 **Universal detection**: Detects OTPs from ALL services (Facebook, Gmail, WhatsApp, etc.)
- 📱 **Telegram integration**: Sends beautifully formatted messages to Telegram channels
- 🚫 **Duplicate prevention**: Prevents sending duplicate OTPs using JSON storage
- 📋 **Click-to-copy**: HTML code formatting for easy copying of OTP and mobile numbers
- ⏰ **IST timestamps**: All timestamps in Indian Standard Time
- 🔄 **Session recovery**: Auto-relogin when session expires
- 🎨 **Professional formatting**: Clean, branded messages with custom signature
- 🛡️ **Production ready**: Comprehensive error handling and logging

## 📋 Environment Variables

Create a `.env` file with:
```env
EMAIL=your_ivasms_email@gmail.com
PASSWORD=your_ivasms_password
BOT_TOKEN=your_telegram_bot_token
CHAT_ID=your_telegram_chat_id
```

## 🔧 Installation

### Option 1: Use start script (Recommended)
```bash
chmod +x start.sh
./start.sh
```

### Option 2: Manual installation
```bash
npm install
npx puppeteer browsers install chrome
node index.js
```

## 📱 Message Format

The bot sends professional formatted messages:
```
📌 NEW OTP RECEIVED 🟢

⏰ Time: 16/07/2025, 20:45:49

📞 Number: [copyable code box]

🔧 Service: IVORY COAST 2304

🔑 OTP Code: [copyable code box]

📱 Message: <#> 69890 is your Facebook code H29Q Fsn4Sr

⚙ —⟩⟩ 𝙋𝙤𝙬𝙚𝙧𝙚𝙙 𝘽𝙮 ⚡️ 𝘿𝙚𝙫 ⚡️🌏
```

## 🎯 Supported Services

- ✅ Facebook
- ✅ Gmail
- ✅ WhatsApp  
- ✅ Twitter
- ✅ Instagram
- ✅ Any service that sends OTP messages

## 📊 Deployment Options

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions on:
- Heroku
- Railway
- Render
- VPS/Server

## 🔍 Monitoring

The bot provides comprehensive console logging:
- Login status and session management
- OTP detection and processing
- Telegram message delivery
- Error handling and recovery

## 🛠️ Requirements

- Node.js 16+
- Chrome browser (auto-installed by Puppeteer)
- Active ivasms.com account
- Telegram bot token

## 📞 Support

The bot includes automatic error recovery and detailed logging for troubleshooting.
