// Render.com startup script with health check endpoint
const http = require('http');
const puppeteer = require('puppeteer');
const { FirefoxResolver } = require('./firefox-fix');

// Configure Puppeteer cache path for Render
if (process.env.RENDER) {
    process.env.PUPPETEER_CACHE_DIR = '/opt/render/.cache/puppeteer';
}

// Keep-alive mechanism
const axios = require('axios');
const KEEP_ALIVE_INTERVAL = 14 * 60 * 1000; // 14 minutes
let keepAliveUrl = null;

// Create a simple HTTP server for health checks
const server = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            service: 'telegram-otp-bot'
        }));
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Start health check server
const port = process.env.PORT || 10000;
server.listen(port, '0.0.0.0', () => {
    console.log(`🌐 Health check server running on port ${port}`);
    
    // Set up keep-alive URL
    if (process.env.RENDER_EXTERNAL_URL) {
        keepAliveUrl = `${process.env.RENDER_EXTERNAL_URL}/health`;
        startKeepAlive();
    }
});

// Configure Puppeteer for Render environment
async function launchBrowserForRender() {
    console.log('🚀 Launching browser for Render...');
    
    const firefoxResolver = new FirefoxResolver();
    const config = await firefoxResolver.setupFirefox();
    
    return await puppeteer.launch(config);
}

// Keep-alive function to prevent Render from sleeping
function startKeepAlive() {
    if (!keepAliveUrl) return;
    
    console.log('🔄 Starting keep-alive mechanism...');
    console.log(`⏰ Will ping ${keepAliveUrl} every 14 minutes`);
    
    setInterval(async () => {
        try {
            const response = await axios.get(keepAliveUrl, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'TelegramOTPBot-KeepAlive/1.0'
                }
            });
            
            if (response.status === 200) {
                console.log('💗 Keep-alive ping successful');
            } else {
                console.log('⚠️ Keep-alive ping returned:', response.status);
            }
        } catch (error) {
            console.log('⚠️ Keep-alive ping failed:', error.message);
        }
    }, KEEP_ALIVE_INTERVAL);
}

// Start the Telegram bot
async function startBot() {
    try {
        console.log('🚀 Starting Telegram OTP Bot for Render...');
        
        // Set environment variable for Render browser configuration
        process.env.RENDER_HOSTING = 'true';
        
        // Import and start the main bot
        require('./index.js');
        
    } catch (error) {
        console.error('❌ Failed to start bot:', error);
        process.exit(1);
    }
}

// Start both health server and bot
startBot();

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('📴 Received SIGTERM, shutting down gracefully...');
    server.close(() => {
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('📴 Received SIGINT, shutting down gracefully...');
    server.close(() => {
        process.exit(0);
    });
});