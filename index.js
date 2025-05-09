// client-api.js
const PuppeteerClientAPI = (function() {
    const SERVER_URL = 'oxyumai.29garigliose.workers.dev/api'; // Your server URL

    async function _request(endpoint, method = 'POST', body = null) {
        try {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                }
            };
            if (body && (method === 'POST' || method === 'PUT')) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(`${SERVER_URL}${endpoint}`, options);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP error! Status: ${response.status}` }));
                console.error(`API Error (${endpoint}):`, errorData.message);
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error(`Fetch Error (${endpoint}):`, error);
            throw error; // Re-throw to be caught by the caller
        }
    }

    return {
        launch: function() {
            return _request('/launch', 'POST');
        },
        goto: function(url) {
            return _request('/goto', 'POST', { url });
        },
        click: function(selector) {
            return _request('/click', 'POST', { selector });
        },
        type: function(selector, text) {
            return _request('/type', 'POST', { selector, text });
        },
        getText: function(selector) {
            return _request('/getText', 'POST', { selector });
        },
        screenshot: function() {
            // GET request, returns { success: true, image: 'base64string' }
            return _request('/screenshot', 'GET');
        },
        evaluate: function(scriptString) {
            // scriptString is a string like "() => document.title"
            return _request('/evaluate', 'POST', { script: scriptString });
        },
        close: function() {
            return _request('/close', 'POST');
        }
    };
})();

// --- Example Usage (can be in your main script file) ---
// window.onload = () => {
//     const log = (message) => {
//         document.getElementById('logs').textContent += `${JSON.stringify(message, null, 2)}\n`;
//     };
//     const displayImage = (base64Image) => {
//         const imgEl = document.getElementById('screenshotImage');
//         imgEl.src = `data:image/png;base64,${base64Image}`;
//         imgEl.style.display = 'block';
//     };

//     document.getElementById('btnLaunch').addEventListener('click', async () => {
//         try {
//             log(await PuppeteerClientAPI.launch());
//         } catch (e) { log({error: e.message});}
//     });

//     document.getElementById('btnGoTo').addEventListener('click', async () => {
//         const url = document.getElementById('urlInput').value;
//         try {
//             log(await PuppeteerClientAPI.goto(url));
//         } catch (e) { log({error: e.message});}
//     });
    
//     document.getElementById('btnClick').addEventListener('click', async () => {
//         const selector = document.getElementById('selectorInput').value;
//         try {
//             log(await PuppeteerClientAPI.click(selector));
//         } catch (e) { log({error: e.message});}
//     });

//     document.getElementById('btnType').addEventListener('click', async () => {
//         const selector = document.getElementById('selectorInput').value;
//         const text = document.getElementById('textInput').value;
//         try {
//             log(await PuppeteerClientAPI.type(selector, text));
//         } catch (e) { log({error: e.message});}
//     });

//     document.getElementById('btnGetText').addEventListener('click', async () => {
//         const selector = document.getElementById('selectorInput').value;
//         try {
//             log(await PuppeteerClientAPI.getText(selector));
//         } catch (e) { log({error: e.message});}
//     });
    
//     document.getElementById('btnScreenshot').addEventListener('click', async () => {
//         try {
//             const result = await PuppeteerClientAPI.screenshot();
//             if (result.success && result.image) {
//                 displayImage(result.image);
//                 log({success: true, message: "Screenshot taken."});
//             } else {
//                 log(result);
//             }
//         } catch (e) { log({error: e.message});}
//     });

//     document.getElementById('btnEvaluate').addEventListener('click', async () => {
//         const script = document.getElementById('evalInput').value; // e.g., "() => document.title"
//         try {
//             log(await PuppeteerClientAPI.evaluate(script));
//         } catch (e) { log({error: e.message});}
//     });
    
//     document.getElementById('btnClose').addEventListener('click', async () => {
//         try {
//             log(await PuppeteerClientAPI.close());
//         } catch (e) { log({error: e.message});}
//     });
// };