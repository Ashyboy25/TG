const axios = require('axios');
const config = require('./config');

async function sendTelegramMessage(message, otp, mobileNumber) {
    try {
        const url = `https://api.telegram.org/bot${config.BOT_TOKEN}/sendMessage`;
        
        // Create payload
        const payload = {
            chat_id: config.CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        };
        
        // Remove inline keyboard - using HTML code tags for easy copying instead
        
        const response = await axios.post(url, payload);
        
        if (response.data.ok) {
            console.log('✅ Telegram message sent successfully');
            return true;
        } else {
            console.error('❌ Telegram API error:', response.data);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error sending Telegram message:', error);
        return false;
    }
}

async function setupTelegramWebhook() {
    try {
        // This would be used if we want to handle callback queries
        // For now, we'll just use the simple click-to-copy approach
        console.log('📱 Telegram webhook setup not required for this implementation');
        return true;
    } catch (error) {
        console.error('❌ Error setting up Telegram webhook:', error);
        return false;
    }
}

module.exports = {
    sendTelegramMessage,
    setupTelegramWebhook
};
