const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080; // Port for the backend

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

let browserInstance = null; // To potentially reuse browser instance (optional, adds complexity)

// Basic function to launch browser if not already launched
async function getBrowser() {
    if (!browserInstance || !browserInstance.isConnected()) {
        console.log('Launching new browser instance...');
        browserInstance = await puppeteer.launch({
            headless: "new", // Use "new" for modern Puppeteer, or false for debugging
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage', // Important for running in Docker/Linux environments
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                // '--single-process', // Only if issues with --disable-dev-shm-usage
                '--disable-gpu'
            ]
        });
        browserInstance.on('disconnected', () => {
            console.log('Browser instance disconnected.');
            browserInstance = null;
        });
    }
    return browserInstance;
}

app.post('/join-and-get-answer', async (req, res) => {
    const { gameId, botName } = req.body;

    if (!gameId || !botName) {
        return res.status(400).json({ error: 'Game ID and Bot Name are required.' });
    }

    console.log(`Received request for Game ID: ${gameId}, Bot Name: ${botName}`);

    let page;
    // For this simple version, we'll launch a new browser context per request
    // to ensure isolation, though it's less efficient.
    // For higher performance, you'd manage a pool of pages or reuse a browser.
    let localBrowser;

    try {
        localBrowser = await getBrowser(); // Use shared browser instance
        // const context = await localBrowser.createIncognitoBrowserContext(); // Use incognito context
        // page = await context.newPage();
        page = await localBrowser.newPage();


        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.85 Safari/537.36');
        await page.setViewport({ width: 1280, height: 720 });

        console.log('Navigating to Blooket...');
        await page.goto('https://play.blooket.com', { waitUntil: 'networkidle2', timeout: 60000 });

        // --- Join Game ---
        console.log('Entering Game ID...');
        await page.waitForSelector('input[class*="styles__idInput___"]', { timeout: 30000 });
        await page.type('input[class*="styles__idInput___"]', gameId, { delay: 100 });

        await page.waitForSelector('div[class*="styles__rightArrow___"]', { timeout: 10000 });
        await page.click('div[class*="styles__rightArrow___"]');
        console.log('Game ID submitted.');

        // --- Enter Nickname ---
        console.log('Entering Bot Name...');
        await page.waitForSelector('input[class*="styles__nameInput___"]', { timeout: 30000 });
        await page.type('input[class*="styles__nameInput___"]', botName, { delay: 100 });

        // There might be different "go" buttons, try to find a common one
        // This selector looks for a div that likely contains an arrow SVG
        await page.waitForSelector('div[class*="styles__enterButton___"], div[class*="styles__buttonContainer___"] div[class*="styles__button___"], div[class*="styles__arrow___"]', { timeout: 10000 });
        await page.click('div[class*="styles__enterButton___"], div[class*="styles__buttonContainer___"] div[class*="styles__button___"], div[class*="styles__arrow___"]');
        console.log('Bot Name submitted. Joined game lobby.');

        // --- Wait for Question ---
        console.log('Waiting for question to appear...');
        // This selector might need adjustment. It targets the common question text area.
        const questionSelector = 'div[class*="styles__questionText___"]';
        await page.waitForSelector(questionSelector, { timeout: 180000 }); // Wait up to 3 minutes for a question
        const questionElement = await page.$(questionSelector);
        const questionText = questionElement ? await page.evaluate(el => el.textContent.trim(), questionElement) : "Question not found";
        console.log(`Question found: ${questionText}`);

        // --- Wait for Answer Options to be fully loaded ---
        // This helps ensure all answer elements are present before looking for the correct one
        await page.waitForSelector('div[class*="styles__answerText___"]', { timeout: 30000 });
        console.log('Answer options loaded.');

        // --- Wait for Blooket to REVEAL the correct answer ---
        // This is the crucial part. Blooket usually adds a class (e.g., containing "correct")
        // to the container of the correct answer *after* the answering period.
        console.log('Waiting for correct answer to be revealed...');
        const correctAnswerSelector = 'div[class*="styles__answerContainer___"][class*="styles__correct___"] div[class*="styles__answerText___"]';
        // Sometimes the "correct" class is on styles__answer___
        const alternativeCorrectAnswerSelector = 'div[class*="styles__answer___"][class*="styles__correct___"] div[class*="styles__answerText___"]';

        let correctAnswerText = "Correct answer not identified";
        try {
            // Wait for either of the correct answer selectors
            const revealedAnswerElement = await page.waitForSelector(`${correctAnswerSelector}, ${alternativeCorrectAnswerSelector}`, { timeout: 60000 }); // Wait up to 1 min for reveal
            if (revealedAnswerElement) {
                correctAnswerText = await page.evaluate(el => el.textContent.trim(), revealedAnswerElement);
                console.log(`Correct answer revealed: ${correctAnswerText}`);
            }
        } catch (revealError) {
            console.warn('Could not find revealed correct answer with primary selectors:', revealError.message);
            // You might add more fallback selectors here if needed
        }


        // Optional: Get all answer options
        let allAnswerOptions = [];
        try {
            const answerElements = await page.$$('div[class*="styles__answerText___"]');
            for (const el of answerElements) {
                allAnswerOptions.push(await page.evaluate(opt => opt.textContent.trim(), el));
            }
        } catch (e) {
            console.warn("Could not retrieve all answer options.");
        }

        res.json({
            gameId,
            botName,
            question: questionText,
            correctAnswer: correctAnswerText,
            allOptions: allAnswerOptions, // Send all options for context
            message: "Successfully joined and retrieved first available answer."
        });

    } catch (error) {
        console.error(`Error in bot for Game ID ${gameId}:`, error);
        res.status(500).json({
            error: 'Failed to process Blooket game.',
            details: error.message,
            gameId,
            botName
        });
    } finally {
        if (page) {
            try {
                console.log('Closing page...');
                await page.close();
            } catch (e) {
                console.error('Error closing page:', e);
            }
        }
        // If not reusing browserInstance, close it here:
        // if (localBrowser && !browserInstance) { // only if localBrowser is not the shared one
        //    await localBrowser.close();
        // }
        console.log(`Finished processing request for Game ID: ${gameId}`);
    }
});

app.listen(PORT, () => {
    console.log(`Blooket Bot Backend listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('SIGINT received. Shutting down gracefully...');
    if (browserInstance) {
        await browserInstance.close();
        console.log('Browser instance closed.');
    }
    process.exit(0);
});