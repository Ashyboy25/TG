const config = require('./config');
const { sleep } = require('./utils');

async function login(page) {
    try {
        console.log('🔐 Navigating to login page...');
        await page.goto(config.LOGIN_URL, { waitUntil: 'networkidle2' });
        
        // Wait for login form to load
        await page.waitForSelector(config.SELECTORS.EMAIL_INPUT, { timeout: 30000 });
        
        // Clear and fill email
        await page.click(config.SELECTORS.EMAIL_INPUT);
        await page.keyboard.down('Control');
        await page.keyboard.press('KeyA');
        await page.keyboard.up('Control');
        await page.type(config.SELECTORS.EMAIL_INPUT, config.EMAIL);
        
        // Clear and fill password
        await page.click(config.SELECTORS.PASSWORD_INPUT);
        await page.keyboard.down('Control');
        await page.keyboard.press('KeyA');
        await page.keyboard.up('Control');
        await page.type(config.SELECTORS.PASSWORD_INPUT, config.PASSWORD);
        
        // Check remember me checkbox
        try {
            const rememberCheckbox = await page.$(config.SELECTORS.REMEMBER_CHECKBOX);
            if (rememberCheckbox) {
                const isChecked = await page.evaluate(el => el.checked, rememberCheckbox);
                if (!isChecked) {
                    await rememberCheckbox.click();
                }
            }
        } catch (error) {
            console.log('⚠️ Remember me checkbox not found, continuing...');
        }
        
        // Click login button
        await page.click(config.SELECTORS.LOGIN_BUTTON);
        
        // Wait for navigation or success indicator
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
        
        // Verify login success by checking URL or page content
        const currentUrl = page.url();
        if (currentUrl.includes('portal') || currentUrl.includes('dashboard')) {
            console.log('✅ Login successful');
            return true;
        } else {
            throw new Error('Login failed - not redirected to portal');
        }
        
    } catch (error) {
        console.error('❌ Login error:', error);
        throw error;
    }
}

async function checkSession(page) {
    try {
        const currentUrl = page.url();
        
        // If we're on login page, session expired
        if (currentUrl.includes('login')) {
            return false;
        }
        
        // Try to find elements that indicate we're logged in
        const isLoggedIn = await page.evaluate(() => {
            // Check for common logged-in indicators
            const logoutButton = document.querySelector('a[href*="logout"], button[onclick*="logout"]');
            const userMenu = document.querySelector('.user-menu, .profile-menu, .dropdown-menu');
            const portalContent = document.querySelector('.portal, .dashboard, table');
            
            return !!(logoutButton || userMenu || portalContent);
        });
        
        return isLoggedIn;
        
    } catch (error) {
        console.error('❌ Session check error:', error);
        return false;
    }
}

async function monitorLiveSMS(page) {
    try {
        // This function is now handled by the mutation observer in the main class
        // Keeping it here for potential future use
        return true;
    } catch (error) {
        console.error('❌ Error monitoring live SMS:', error);
        return false;
    }
}

module.exports = {
    login,
    checkSession,
    monitorLiveSMS
};
