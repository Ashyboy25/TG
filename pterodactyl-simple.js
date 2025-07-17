// Simple Pterodactyl launcher - uses system browser if available
const { spawn } = require('child_process');
const fs = require('fs');

// First try to install chromium via package manager
async function installChromiumIfNeeded() {
    return new Promise((resolve) => {
        const paths = ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome'];
        
        // Check if any browser already exists
        for (const path of paths) {
            if (fs.existsSync(path)) {
                console.log(`✅ Found existing browser at ${path}`);
                process.env.PUPPETEER_EXECUTABLE_PATH = path;
                return resolve(true);
            }
        }
        
        console.log('🔧 Installing Chromium browser...');
        const install = spawn('apt-get', ['update', '&&', 'apt-get', 'install', '-y', 'chromium-browser'], {
            stdio: 'inherit',
            shell: true
        });
        
        install.on('close', (code) => {
            if (code === 0 && fs.existsSync('/usr/bin/chromium-browser')) {
                console.log('✅ Chromium installed successfully');
                process.env.PUPPETEER_EXECUTABLE_PATH = '/usr/bin/chromium-browser';
                resolve(true);
            } else {
                console.log('⚠️ Could not install Chromium, will use bundled Chrome');
                resolve(false);
            }
        });
    });
}

// Start the main application
async function start() {
    try {
        await installChromiumIfNeeded();
        
        // Start the main bot
        console.log('🚀 Starting Telegram OTP Bot...');
        require('./index.js');
        
    } catch (error) {
        console.error('❌ Failed to start:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    start();
}

module.exports = { start };