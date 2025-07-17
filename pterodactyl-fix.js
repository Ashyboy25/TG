// Alternative launcher for Pterodactyl that tries different Chrome strategies
const puppeteer = require('puppeteer');
const fs = require('fs');

async function launchBrowserForPterodactyl() {
    const strategies = [
        // Strategy 1: Use system Chromium if available
        async () => {
            const paths = ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome'];
            for (const path of paths) {
                if (fs.existsSync(path)) {
                    console.log(`🚀 Trying system browser at ${path}`);
                    return await puppeteer.launch({
                        executablePath: path,
                        headless: 'new',
                        args: [
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                            '--disable-dev-shm-usage',
                            '--disable-gpu',
                            '--single-process',
                            '--no-first-run',
                            '--no-zygote'
                        ]
                    });
                }
            }
            throw new Error('No system browser found');
        },
        
        // Strategy 2: Use bundled Chrome with minimal flags
        async () => {
            console.log('🚀 Trying bundled Chrome with minimal flags');
            return await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--single-process',
                    '--disable-gpu'
                ]
            });
        },
        
        // Strategy 3: Use Chrome with extensive compatibility flags
        async () => {
            console.log('🚀 Trying bundled Chrome with extensive flags');
            return await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process',
                    '--disable-gpu',
                    '--disable-gpu-sandbox',
                    '--disable-software-rasterizer',
                    '--disable-background-timer-throttling',
                    '--disable-backgrounding-occluded-windows',
                    '--disable-renderer-backgrounding',
                    '--disable-features=TranslateUI,VizDisplayCompositor',
                    '--disable-extensions',
                    '--disable-default-apps',
                    '--disable-sync',
                    '--disable-translate',
                    '--hide-scrollbars',
                    '--mute-audio',
                    '--no-default-browser-check',
                    '--disable-notifications',
                    '--disable-web-security'
                ]
            });
        }
    ];
    
    for (let i = 0; i < strategies.length; i++) {
        try {
            const browser = await strategies[i]();
            console.log(`✅ Browser launched successfully with strategy ${i + 1}`);
            return browser;
        } catch (error) {
            console.log(`❌ Strategy ${i + 1} failed:`, error.message);
            if (i === strategies.length - 1) {
                throw error;
            }
        }
    }
}

module.exports = { launchBrowserForPterodactyl };