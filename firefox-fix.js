// Firefox installation and path resolution for Render.com
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class FirefoxResolver {
    constructor() {
        this.isRender = process.env.RENDER === 'true' || process.env.RENDER_EXTERNAL_URL;
        this.cacheDir = process.env.PUPPETEER_CACHE_DIR || '/opt/render/.cache/puppeteer';
    }

    // Install Firefox if not found
    async installFirefox() {
        if (!this.isRender) return;
        
        console.log('🔧 Installing Firefox for Render...');
        try {
            execSync('npx puppeteer browsers install firefox', { 
                stdio: 'inherit',
                timeout: 120000 // 2 minutes timeout
            });
            console.log('✅ Firefox installation completed');
        } catch (error) {
            console.error('❌ Firefox installation failed:', error.message);
            throw error;
        }
    }

    // Find Firefox executable path
    findFirefoxExecutable() {
        if (!this.isRender) return null;

        const possiblePaths = [
            // Standard Render cache location
            path.join(this.cacheDir, 'firefox'),
            // Alternative cache locations
            '/opt/render/.cache/puppeteer/firefox',
            '/app/.cache/puppeteer/firefox',
            '/tmp/.cache/puppeteer/firefox',
            // System Firefox locations
            '/usr/bin/firefox',
            '/usr/bin/firefox-esr',
            '/usr/local/bin/firefox'
        ];

        for (const basePath of possiblePaths) {
            try {
                if (fs.existsSync(basePath)) {
                    // If it's a directory, look for version folders
                    if (fs.statSync(basePath).isDirectory()) {
                        const versions = fs.readdirSync(basePath)
                            .filter(item => item.startsWith('linux-'))
                            .sort()
                            .reverse(); // Get latest version first

                        for (const version of versions) {
                            const firefoxPath = path.join(basePath, version, 'firefox', 'firefox');
                            if (fs.existsSync(firefoxPath)) {
                                console.log('🎯 Found Firefox at:', firefoxPath);
                                return firefoxPath;
                            }
                        }
                    } else {
                        // If it's a file, check if it's executable
                        if (fs.existsSync(basePath)) {
                            console.log('🎯 Found Firefox at:', basePath);
                            return basePath;
                        }
                    }
                }
            } catch (error) {
                // Continue searching if this path fails
                continue;
            }
        }

        console.log('⚠️ Firefox executable not found in any standard location');
        return null;
    }

    // Get Puppeteer launch configuration for Render with Firefox
    getPuppeteerConfig() {
        const config = {
            browser: 'firefox',
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-extensions',
                '--disable-default-apps',
                '--disable-sync',
                '--disable-translate',
                '--hide-scrollbars',
                '--mute-audio',
                '--no-default-browser-check',
                '--disable-notifications',
                '--disable-web-security',
                '--disable-background-mode',
                '--disable-background-networking',
                '--disable-hang-monitor',
                '--disable-popup-blocking',
                '--disable-prompt-on-repost'
            ],
            ignoreHTTPSErrors: true,
            dumpio: false
        };

        if (this.isRender) {
            const firefoxPath = this.findFirefoxExecutable();
            if (firefoxPath) {
                config.executablePath = firefoxPath;
                console.log('🚀 Using Firefox executable:', firefoxPath);
            }
        }

        return config;
    }

    // Complete Firefox setup for Render
    async setupFirefox() {
        if (!this.isRender) {
            console.log('📝 Not running on Render, skipping Firefox setup');
            return this.getPuppeteerConfig();
        }

        console.log('🔍 Setting up Firefox for Render environment...');
        
        // First try to find existing Firefox
        let firefoxPath = this.findFirefoxExecutable();
        
        // If not found, try to install it
        if (!firefoxPath) {
            console.log('🔧 Firefox not found, attempting installation...');
            try {
                await this.installFirefox();
                firefoxPath = this.findFirefoxExecutable();
            } catch (error) {
                console.error('❌ Failed to install Firefox:', error.message);
            }
        }

        const config = this.getPuppeteerConfig();
        
        if (firefoxPath) {
            console.log('✅ Firefox setup completed successfully');
        } else {
            console.log('⚠️ Firefox setup incomplete, using default configuration');
        }

        return config;
    }
}

module.exports = { FirefoxResolver };