# Pterodactyl Panel Installation Guide

## Issue: Missing System Libraries

The error `libatk-1.0.so.0: cannot open shared object file` occurs because Pterodactyl containers don't have all required GUI libraries for Chrome.

## Solution Options:

### Option 1: Use the Modified Bot (Recommended)
I've updated the bot with container-friendly Chrome flags. Try running:
```bash
chmod +x pterodactyl-start.sh
./pterodactyl-start.sh
```

### Option 2: Install Libraries (If you have root access)
```bash
apt-get update && apt-get install -y \
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
    libgtk-3-0
```

### Option 3: Use Docker Image with Dependencies
Create a `Dockerfile`:
```dockerfile
FROM node:18-slim

# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
CMD ["node", "index.js"]
```

### Option 4: Use Puppeteer with External Browser
Set environment variable:
```bash
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

## Current Status
The bot has been updated with aggressive Chrome flags that should work in most container environments. The new configuration:
- Disables GPU acceleration
- Uses single process mode
- Bypasses sandbox restrictions
- Minimizes library dependencies

Try the updated bot first, then use alternative options if needed.