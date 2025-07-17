const moment = require('moment-timezone');

function extractOTP(message) {
    const otpRegex = /\b\d{4,6}\b/;
    const match = message.match(otpRegex);
    return match ? match[0] : null;
}

function formatTimestamp() {
    return moment().tz('Asia/Kolkata').format('DD/MM/YYYY, HH:mm:ss');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function validateOTP(otp) {
    return /^\d{4,6}$/.test(otp);
}

function validateMobileNumber(number) {
    return /^\d{10,15}$/.test(number.replace(/\D/g, ''));
}

function sanitizeString(str) {
    return str.replace(/[<>]/g, '').trim();
}

function logWithTimestamp(message) {
    const timestamp = formatTimestamp();
    console.log(`[${timestamp}] ${message}`);
}

module.exports = {
    extractOTP,
    formatTimestamp,
    sleep,
    validateOTP,
    validateMobileNumber,
    sanitizeString,
    logWithTimestamp
};
