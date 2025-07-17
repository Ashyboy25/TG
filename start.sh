#!/bin/bash
# Install Chrome browser for Puppeteer if not already installed
if [ ! -d "/home/runner/.cache/puppeteer/chrome" ]; then
    echo "Installing Chrome browser for Puppeteer..."
    npx puppeteer browsers install chrome
fi

# Start the bot
echo "Starting Telegram OTP Bot..."
node index.js