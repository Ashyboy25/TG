require('dotenv').config();

module.exports = {
    // Website URLs
    LOGIN_URL: 'https://www.ivasms.com/login',
    LIVE_SMS_URL: 'https://www.ivasms.com/portal/live/my_sms',
    
    // Login credentials
    EMAIL: process.env.EMAIL || 'Unseendevx2@gmail.com',
    PASSWORD: process.env.PASSWORD || 'RheaxDev@2025',
    
    // Telegram configuration
    BOT_TOKEN: process.env.BOT_TOKEN || '7752038917:AAG3KfU-d4n5ysuOvq1qomNx0JXA4dGcjmA',
    CHAT_ID: process.env.CHAT_ID || '-1002541578739',
    
    // Monitoring settings
    POLL_INTERVAL: 2000, // 2 seconds
    SESSION_CHECK_INTERVAL: 30000, // 30 seconds
    
    // Storage
    DUPLICATES_FILE: './duplicates.json',
    
    // Selectors (may need adjustment based on actual page structure)
    SELECTORS: {
        EMAIL_INPUT: 'input[name="email"], input[type="email"]',
        PASSWORD_INPUT: 'input[name="password"], input[type="password"]',
        REMEMBER_CHECKBOX: 'input[name="remember"], input[type="checkbox"]',
        LOGIN_BUTTON: 'button[type="submit"], input[type="submit"]',
        SMS_TABLE: 'table'
    }
};
