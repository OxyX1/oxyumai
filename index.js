const http = require('http');
const url = require('url');
const puppeteer = require('puppeteer');

// Set this to the exact domain or localhost port of your frontend
const ALLOWED_ORIGIN = 'switchyard.proxy.rlwy.net:30500'; // change to your frontend URL

async function runBlooketBot(gameCode) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('https://play.blooket.com/');

    await page.waitForSelector('input[name="gameCode"]');
    await page.type('input[name="gameCode"]', gameCode);

    await page.click('button[type="submit"]');

    await page.waitForTimeout(3000);
    await browser.close();
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        });
        return res.end();
    }

    // Bot endpoint
    if (req.method === 'POST' && parsedUrl.pathname === '/api/start-bot') {
        let body = '';
        req.on('data', chunk => { body += chunk; });

        req.on('end', async () => {
            try {
                const { gameCode } = JSON.parse(body);

                if (!gameCode) {
                    res.writeHead(400, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': ALLOWED_ORIGIN
                    });
                    return res.end(JSON.stringify({ error: 'Missing gameCode' }));
                }

                await runBlooketBot(gameCode);

                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': ALLOWED_ORIGIN
                });
                res.end(JSON.stringify({ success: true, message: 'Bot joined game' }));
            } catch (err) {
                res.writeHead(500, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': ALLOWED_ORIGIN
                });
                res.end(JSON.stringify({ error: 'Server error', details: err.message }));
            }
        });
    } else {
        res.writeHead(404, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': ALLOWED_ORIGIN
        });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
