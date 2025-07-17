const puppeteer = require('puppeteer');
const { FirefoxResolver } = require('./firefox-fix');
const { login, monitorLiveSMS, checkSession } = require('./browser');
const { sendTelegramMessage } = require('./telegram');
const { checkDuplicate, saveDuplicate } = require('./storage');
const { extractOTP, formatTimestamp, sleep } = require('./utils');
const config = require('./config');

class TelegramOTPBot {
    constructor() {
        this.browser = null;
        this.page = null;
        this.isRunning = false;
        this.lastRowContent = null;
    }

    async init() {
        try {
            console.log('🚀 Starting Telegram OTP Bot...');
            
            // Configure browser for different hosting environments
            if (process.env.RENDER_HOSTING === 'true' || process.env.RENDER) {
                // Render.com specific configuration
                console.log('🌐 Configuring browser for Render hosting...');
                
                const firefoxResolver = new FirefoxResolver();
                const config = await firefoxResolver.setupFirefox();
                
                this.browser = await puppeteer.launch(config);
            } else {
                // Try fallback browser launch for Pterodactyl and other hosts
                try {
                    const { launchBrowserForPterodactyl } = require('./pterodactyl-fix');
                    this.browser = await launchBrowserForPterodactyl();
                } catch (error) {
                    console.log('❌ Pterodactyl browser launch failed, trying standard approach:', error.message);
                    
                    // Fallback to standard launch
                    this.browser = await puppeteer.launch({
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

            this.page = await this.browser.newPage();
            
            // Set user agent
            await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            
            // Set viewport
            await this.page.setViewport({ width: 1366, height: 768 });

            // Send startup message to Telegram
            await this.sendStartupMessage();
            
            // Perform initial login
            await this.performLogin();
            
            // Start monitoring
            await this.startMonitoring();
            
        } catch (error) {
            console.error('❌ Error initializing bot:', error);
            throw error;
        }
    }

    async performLogin() {
        try {
            console.log('🔐 Attempting to login...');
            await login(this.page);
            console.log('✅ Login successful');
        } catch (error) {
            console.error('❌ Login failed:', error);
            throw error;
        }
    }

    async startMonitoring() {
        try {
            console.log('👁️ Starting SMS monitoring...');
            this.isRunning = true;
            
            // Navigate to live SMS page
            await this.page.goto(config.LIVE_SMS_URL, { waitUntil: 'networkidle2' });
            
            // Wait for the table to load
            await this.page.waitForSelector('table', { timeout: 30000 });
            
            // Set up mutation observer to detect new rows
            await this.setupMutationObserver();
            
            // Also run periodic checks as backup
            this.startPeriodicCheck();
            
        } catch (error) {
            console.error('❌ Error starting monitoring:', error);
            throw error;
        }
    }

    async setupMutationObserver() {
        try {
            await this.page.evaluateOnNewDocument(() => {
                window.newRowDetected = false;
                window.lastRowContent = null;
            });

            await this.page.evaluate(() => {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList') {
                            const table = document.querySelector('table');
                            if (table) {
                                const rows = table.querySelectorAll('tr');
                                if (rows.length > 1) {
                                    const firstDataRow = rows[1]; // Skip header row
                                    const currentContent = firstDataRow.innerHTML;
                                    
                                    if (window.lastRowContent !== currentContent) {
                                        window.newRowDetected = true;
                                        window.lastRowContent = currentContent;
                                    }
                                }
                            }
                        }
                    });
                });

                const table = document.querySelector('table');
                if (table) {
                    observer.observe(table, {
                        childList: true,
                        subtree: true
                    });
                }
            });

            console.log('🔍 Mutation observer set up successfully');
        } catch (error) {
            console.error('❌ Error setting up mutation observer:', error);
        }
    }

    async startPeriodicCheck() {
        while (this.isRunning) {
            try {
                // Check if session is still valid
                const sessionValid = await checkSession(this.page);
                if (!sessionValid) {
                    console.log('🔄 Session expired, re-logging in...');
                    await this.performLogin();
                    await this.page.goto(config.LIVE_SMS_URL, { waitUntil: 'networkidle2' });
                    await this.setupMutationObserver();
                }

                // Check for new rows
                const hasNewRow = await this.page.evaluate(() => {
                    if (window.newRowDetected) {
                        window.newRowDetected = false;
                        return true;
                    }
                    return false;
                });

                if (hasNewRow) {
                    await this.processNewRow();
                }

                // Wait before next check
                await sleep(2000);
                
            } catch (error) {
                console.error('❌ Error in periodic check:', error);
                await sleep(5000); // Wait longer on error
            }
        }
    }

    async processNewRow() {
        try {
            console.log('🔔 New row detected, processing...');
            
            // Extract data from the topmost row
            const rowData = await this.extractRowData();
            
            if (!rowData) {
                console.log('⚠️ No data extracted from row');
                return;
            }

            // Skip if no OTP found
            if (!rowData.otp) {
                console.log('⚠️ No OTP found in message, skipping...');
                return;
            }

            console.log(`📋 Processing OTP for service: ${rowData.sid || 'Unknown'}`);

            // Check for duplicates
            const isDuplicate = await checkDuplicate(rowData.otp, rowData.mobileNumber);
            if (isDuplicate) {
                console.log('⚠️ Duplicate OTP detected, skipping...');
                return;
            }

            // Log extracted OTP
            console.log(`Extracted OTP: ${rowData.otp}`);

            // Format and send Telegram message
            const message = this.formatTelegramMessage(rowData);
            await sendTelegramMessage(message, rowData.otp, rowData.mobileNumber);

            // Save to prevent duplicates
            await saveDuplicate(rowData.otp, rowData.mobileNumber);
            
            console.log('✅ OTP processed and sent successfully');
            
        } catch (error) {
            console.error('❌ Error processing new row:', error);
        }
    }

    async sendStartupMessage() {
        try {
            const message = `🤖 Telegram OTP Bot Started Successfully! 🟢
✅ Bot is now monitoring ivasms.com
⏰ Start Time: ${formatTimestamp()}
🔍 Waiting for new OTP messages...`;
            
            await sendTelegramMessage(message, '', '');
            console.log('✅ Startup message sent to Telegram');
        } catch (error) {
            console.error('❌ Error sending startup message:', error);
        }
    }

    async extractRowData() {
        try {
            return await this.page.evaluate(() => {
                const table = document.querySelector('table');
                if (!table) return null;

                const rows = table.querySelectorAll('tr');
                if (rows.length <= 1) return null;

                const firstDataRow = rows[1]; // Skip header row
                const cells = firstDataRow.querySelectorAll('td');
                
                if (cells.length < 4) return null;

                // Based on your example: "Live SMS | SID | Paid | Limit | Message content"
                // Extract from the first data row (topmost/newest)
                const liveSmsCell = cells[0]?.textContent?.trim() || '';
                const sidCell = cells[1]?.textContent?.trim() || '';
                const messageCell = cells[4]?.textContent?.trim() || '';

                // Extract country code and mobile number from Live SMS cell
                // Format: "IVORY COAST 2304\n2250707210653"
                const lines = liveSmsCell.split('\n').map(line => line.trim());
                const countryCode = lines[0] || '';
                const mobileNumber = lines[1] || '';

                // Extract OTP from message content using multiple regex patterns
                // Try different patterns to catch all possible OTP formats
                let otp = '';
                const otpPatterns = [
                    /\b\d{4,8}\b/g,     // 4-8 digit numbers
                    /\d{4,8}/g,         // Any 4-8 digits anywhere
                    /(?:code|otp|pin):\s*(\d{4,8})/i,  // "code: 1234" format
                    /(\d{4,8})\s*is\s*your/i,          // "1234 is your" format
                ];
                
                for (const pattern of otpPatterns) {
                    const matches = messageCell.match(pattern);
                    if (matches) {
                        // Get the longest match (likely the OTP)
                        otp = matches.sort((a, b) => b.length - a.length)[0];
                        if (otp && otp.length >= 4) break;
                    }
                }

                return {
                    countryCode: countryCode,
                    mobileNumber: mobileNumber,
                    sid: sidCell,
                    messageContent: messageCell,
                    otp: otp
                };
            });
        } catch (error) {
            console.error('❌ Error extracting row data:', error);
            return null;
        }
    }

    formatTelegramMessage(data) {
        const timestamp = formatTimestamp();
        // Escape HTML entities to prevent parsing errors
        const escapedMessage = data.messageContent
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        return `📌 <b>NEW OTP RECEIVED</b> 🟢

⏰ <b>Time:</b> ${timestamp}

📞 <b>Number:</b> <code>${data.mobileNumber}</code>

🔧 <b>Service:</b> ${data.countryCode}

🔑 <b>OTP Code:</b> <code>${data.otp}</code>

📱 <b>Message:</b> ${escapedMessage}

⚙ —⟩⟩ 𝙋𝙤𝙬𝙚𝙧𝙚𝙙 𝘽𝙮 ⚡️ 𝘿𝙚𝙫 ⚡️🌏`;
    }

    async stop() {
        this.isRunning = false;
        if (this.browser) {
            await this.browser.close();
        }
        console.log('🛑 Bot stopped');
    }
}

// Start the bot
const bot = new TelegramOTPBot();

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    await bot.stop();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    await bot.stop();
    process.exit(0);
});

// Start the bot
bot.init().catch(error => {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
});
