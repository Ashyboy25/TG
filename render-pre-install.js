#!/usr/bin/env node

// Pre-installation script for Render.com Chrome setup
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Render.com Chrome pre-installation...');

// Set up environment variables
process.env.PUPPETEER_CACHE_DIR = '/opt/render/.cache/puppeteer';
process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'false';

// Create cache directory if it doesn't exist
const cacheDir = '/opt/render/.cache/puppeteer';
try {
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
        console.log('✅ Created cache directory:', cacheDir);
    }
} catch (error) {
    console.log('⚠️ Could not create cache directory:', error.message);
}

// Install Chrome
console.log('🔧 Installing Chrome...');
try {
    execSync('npx puppeteer browsers install chrome', {
        stdio: 'inherit',
        env: {
            ...process.env,
            PUPPETEER_CACHE_DIR: cacheDir
        },
        timeout: 300000 // 5 minutes
    });
    
    console.log('✅ Chrome installation completed');
    
    // Verify installation
    const chromeDir = path.join(cacheDir, 'chrome');
    if (fs.existsSync(chromeDir)) {
        const versions = fs.readdirSync(chromeDir);
        console.log('📦 Chrome versions installed:', versions);
        
        for (const version of versions) {
            const chromePath = path.join(chromeDir, version, 'chrome-linux64', 'chrome');
            if (fs.existsSync(chromePath)) {
                console.log('✅ Chrome executable found at:', chromePath);
                
                // Make sure it's executable
                try {
                    fs.chmodSync(chromePath, '755');
                    console.log('✅ Chrome executable permissions set');
                } catch (permError) {
                    console.log('⚠️ Could not set permissions:', permError.message);
                }
            }
        }
    }
    
} catch (error) {
    console.error('❌ Chrome installation failed:', error.message);
    process.exit(1);
}

console.log('🎉 Render.com Chrome pre-installation completed successfully!');