const fs = require('fs').promises;
const path = require('path');
const config = require('./config');

async function loadDuplicates() {
    try {
        const data = await fs.readFile(config.DUPLICATES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // File doesn't exist or is invalid, return empty array
        return [];
    }
}

async function saveDuplicates(duplicates) {
    try {
        await fs.writeFile(config.DUPLICATES_FILE, JSON.stringify(duplicates, null, 2));
        return true;
    } catch (error) {
        console.error('❌ Error saving duplicates:', error);
        return false;
    }
}

async function checkDuplicate(otp, mobileNumber) {
    try {
        const duplicates = await loadDuplicates();
        const key = `${otp}_${mobileNumber}`;
        
        return duplicates.some(item => item.key === key);
    } catch (error) {
        console.error('❌ Error checking duplicate:', error);
        return false;
    }
}

async function saveDuplicate(otp, mobileNumber) {
    try {
        const duplicates = await loadDuplicates();
        const key = `${otp}_${mobileNumber}`;
        const timestamp = new Date().toISOString();
        
        duplicates.push({
            key: key,
            otp: otp,
            mobileNumber: mobileNumber,
            timestamp: timestamp
        });
        
        // Keep only last 1000 entries to prevent file from growing too large
        if (duplicates.length > 1000) {
            duplicates.splice(0, duplicates.length - 1000);
        }
        
        await saveDuplicates(duplicates);
        console.log(`💾 Saved duplicate entry: ${key}`);
        return true;
    } catch (error) {
        console.error('❌ Error saving duplicate:', error);
        return false;
    }
}

async function clearOldDuplicates(olderThanHours = 24) {
    try {
        const duplicates = await loadDuplicates();
        const cutoffTime = new Date();
        cutoffTime.setHours(cutoffTime.getHours() - olderThanHours);
        
        const filtered = duplicates.filter(item => {
            const itemTime = new Date(item.timestamp);
            return itemTime > cutoffTime;
        });
        
        await saveDuplicates(filtered);
        console.log(`🧹 Cleared ${duplicates.length - filtered.length} old duplicate entries`);
        return true;
    } catch (error) {
        console.error('❌ Error clearing old duplicates:', error);
        return false;
    }
}

module.exports = {
    loadDuplicates,
    saveDuplicates,
    checkDuplicate,
    saveDuplicate,
    clearOldDuplicates
};
