# Telegram OTP Bot for ivasms.com

## Overview

This is a Node.js application that monitors ivasms.com for new OTP messages and sends formatted notifications to Telegram channels. The bot uses Puppeteer for web automation to log into the ivasms.com portal, monitor the live SMS page without refreshing, and extract OTP information which is then sent to a Telegram channel with click-to-copy functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Core Architecture
- **Type**: Monolithic Node.js application
- **Runtime**: Node.js with ES5/CommonJS modules
- **Main Entry Point**: `index.js` with TelegramOTPBot class
- **Pattern**: Event-driven monitoring with browser automation

### Key Technologies
- **Web Automation**: Puppeteer for headless browser control
- **HTTP Client**: Axios for Telegram API requests
- **Time Handling**: moment-timezone for IST timestamps
- **Environment Management**: dotenv for configuration

## Key Components

### 1. Browser Automation (`browser.js`)
- **Purpose**: Handles login and session management for ivasms.com
- **Key Functions**:
  - Automated login with credentials
  - Session persistence with "Remember Me" option
  - Navigation to live SMS monitoring page
- **Architecture Decision**: Uses Puppeteer for reliable web automation instead of direct API calls since the target site requires browser-based interaction

### 2. Configuration Management (`config.js`)
- **Purpose**: Centralizes all configuration including credentials, URLs, and selectors
- **Environment Variables**: 
  - `EMAIL`, `PASSWORD` for ivasms.com login
  - `BOT_TOKEN`, `CHAT_ID` for Telegram integration
- **Fallback Values**: Provides default values for development/testing

### 3. Telegram Integration (`telegram.js`)
- **Purpose**: Handles Telegram message sending with interactive buttons
- **Features**:
  - HTML formatted messages
  - Inline keyboard with copy buttons for OTP and mobile numbers
  - Error handling for API failures
- **Architecture Decision**: Uses Telegram Bot API directly instead of a wrapper library for simplicity

### 4. Storage Management (`storage.js`)
- **Purpose**: Manages duplicate detection using JSON file storage
- **Data Structure**: Array of objects with OTP+mobile number keys
- **Persistence**: JSON file (`duplicates.json`) for stateful duplicate tracking
- **Optimization**: Keeps only last 1000 entries to prevent file bloat

### 5. Utility Functions (`utils.js`)
- **Purpose**: Common utilities for OTP extraction, validation, and formatting
- **Key Features**:
  - Regex-based OTP extraction (`/\b\d{4,6}\b/`)
  - IST timezone formatting
  - Input validation and sanitization
  - Async sleep utility

### 6. Main Application (`index.js`)
- **Purpose**: Orchestrates the entire bot lifecycle
- **Class Structure**: TelegramOTPBot with initialization, monitoring, and cleanup methods
- **Error Handling**: Comprehensive try-catch with automatic recovery

## Data Flow

1. **Initialization**:
   - Launch Puppeteer browser with optimized settings
   - Perform login to ivasms.com
   - Navigate to live SMS monitoring page

2. **Monitoring Loop**:
   - Continuously monitor page for new SMS entries
   - Use MutationObserver pattern to detect changes without page refresh
   - Extract OTP, mobile number, and message content from new entries

3. **Processing**:
   - Validate extracted OTP format (4-6 digits)
   - Check against stored duplicates
   - Format message with IST timestamp

4. **Notification**:
   - Send formatted message to Telegram channel
   - Include click-to-copy buttons for OTP and mobile number
   - Store OTP+mobile combination to prevent duplicates

5. **Session Management**:
   - Periodic session checks every 30 seconds
   - Automatic re-login if session expires
   - Graceful error recovery

## External Dependencies

### Third-Party Services
- **ivasms.com**: Target website for OTP monitoring
  - Requires authenticated session
  - Rate limiting considerations (2-second polling interval)
  - Session expires after 24 hours

- **Telegram Bot API**: Message delivery platform
  - Requires bot token and chat ID
  - Supports HTML formatting and inline keyboards
  - Rate limiting handled by axios

### Node.js Packages
- **puppeteer**: Browser automation (headless Chrome)
- **axios**: HTTP client for Telegram API
- **moment-timezone**: Timezone handling for IST formatting
- **dotenv**: Environment variable management

## Deployment Strategy

### Environment Setup
- **Node.js Runtime**: Requires Node.js 16+ for Puppeteer compatibility
- **Memory Requirements**: Headless browser requires adequate RAM allocation
- **File Permissions**: Write access needed for duplicates.json storage

### Configuration Requirements
- Environment variables for credentials and tokens
- Fallback to hardcoded values in config.js for development
- JSON file storage for duplicate tracking persistence

### Browser Configuration
- Headless mode with optimized Chrome flags
- Disabled GPU acceleration for server environments
- Single process mode for resource optimization
- Custom user agent and viewport settings
- Environment-specific optimization (Render, Pterodactyl, etc.)

### Hosting Platform Support

#### Render.com
- **Entry Point**: `render-start.js` with health check server
- **Build Command**: `npm install && npx puppeteer browsers install chrome`
- **Health Check**: HTTP server on port 10000 with `/health` endpoint
- **Environment Detection**: Uses `RENDER_HOSTING=true` flag
- **Browser Optimization**: Render-specific Chrome flags for container environment

#### Pterodactyl Panel
- **Entry Point**: `index.js` with multi-strategy browser launch
- **Alternative Scripts**: `pterodactyl-start.sh` and `pterodactyl-simple.js`
- **Browser Strategies**: System Chromium detection and fallback options
- **Container Support**: Extensive Chrome flags for container compatibility

#### Other Platforms
- **Heroku**: `Procfile` with standard Node.js configuration
- **Railway**: `railway.json` with environment variables
- **VPS/Linux**: Direct Node.js execution with system dependencies

### Error Recovery
- Automatic browser restart on crashes
- Session recovery with re-login capability
- Graceful handling of network timeouts
- Duplicate prevention maintains state across restarts
- Multi-strategy browser launch for different hosting environments

### Monitoring Considerations
- 2-second polling interval to balance responsiveness and resource usage
- 30-second session validation to ensure authentication
- File-based duplicate storage for simplicity and persistence
- Comprehensive logging with IST timestamps for debugging
- Health check endpoints for production monitoring

## Recent Changes

### January 17, 2025
- **Fixed Chrome Installation Issue for Render.com Deployment**: Comprehensive fixes for Chrome executable path resolution
  - **Problem**: Chrome was not found when launching Puppeteer in Render production environment (`/opt/render/.cache/puppeteer`)
  - **Solutions Implemented**:
    - ✅ Added automatic Chrome executable path detection in both `index.js` and `render-start.js`
    - ✅ Configured `PUPPETEER_CACHE_DIR` environment variable in `render.yaml`
    - ✅ Added `RENDER=true` environment flag for proper detection
    - ✅ Updated workflow to install Chrome first: `npx puppeteer browsers install chrome`
    - ✅ Enhanced render deployment guide with troubleshooting steps
  - **Status**: ✅ All workflows working, production-ready for Render.com deployment

- **Added Keep-Alive Mechanism**: Implemented automatic sleep prevention for Render.com free tier
  - **Feature**: Self-ping mechanism that pings `/health` endpoint every 14 minutes
  - **Benefits**: 24/7 uptime, prevents 15-minute sleep timeout on free tier
  - **Setup**: Add `RENDER_EXTERNAL_URL` environment variable with service URL
  - **Files Modified**: `render-start.js`, `render.yaml`, `keep-alive-guide.md`, `render-deploy.md`
  - **Status**: ✅ Ready for production deployment with continuous uptime