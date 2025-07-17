#!/bin/bash

echo "🚀 Starting Telegram OTP Bot for Pterodactyl..."

# Check if we're in a container environment
if [ -f /.dockerenv ] || [ -n "${container}" ]; then
    echo "📦 Container environment detected"
    
    # Try to install Chromium and dependencies if possible
    if command -v apt-get &> /dev/null; then
        echo "🔧 Installing Chromium browser and dependencies..."
        apt-get update -qq && apt-get install -y -qq \
            chromium-browser \
            libatk1.0-0 \
            libatk-bridge2.0-0 \
            libdrm2 \
            libxcomposite1 \
            libxdamage1 \
            libxrandr2 \
            libgbm1 \
            libxss1 \
            libasound2 \
            libatspi2.0-0 \
            libgtk-3-0 \
            libgdk-pixbuf2.0-0 \
            &> /dev/null || echo "⚠️ Could not install system packages, trying with existing setup..."
        
        # Set environment variable to use system Chromium
        if [ -f "/usr/bin/chromium-browser" ]; then
            export PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"
            echo "✅ Using system Chromium at /usr/bin/chromium-browser"
        elif [ -f "/usr/bin/chromium" ]; then
            export PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium"
            echo "✅ Using system Chromium at /usr/bin/chromium"
        fi
    fi
fi

# Install Chrome if not present (fallback)
if [ ! -d "/home/container/.cache/puppeteer/chrome" ] && [ ! -d "$HOME/.cache/puppeteer/chrome" ] && [ -z "$PUPPETEER_EXECUTABLE_PATH" ]; then
    echo "📥 Installing Chrome browser..."
    npx puppeteer browsers install chrome
fi

# Start the bot
echo "🤖 Starting bot..."
node index.js