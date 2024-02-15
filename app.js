const http = require('http');
const url = require('url');

let requestCount = 0;
let storage = {}; // Consider replacing with persistent storage for production use

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    // Basic CORS configuration for all responses
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Placeholder for implementing rate limiting
    // RateLimiter(req, res);

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    function sendResponse(res, statusCode, contentType, body) {
        res.writeHead(statusCode, {"Content-Type": contentType});
        res.end(JSON.stringify(body));
    }

    if (req.method === "GET" && parsedUrl.pathname === '/api/definitions') {
        
        const queryObject = parsedUrl.query;
        const word = queryObject.word; // Assuming the query parameter is named 'word'
        if (word && storage.hasOwnProperty(word)) { // Also, using hasOwnProperty for a safer check
            sendResponse(res, 200, "application/json", {word: word, definition: storage[word]});
        } else {
            sendResponse(res, 404, "application/json", {error: "Word not found in dictionary"});
        }
        
    } else if (req.method === "POST" && parsedUrl.pathname === '/api/definitions') {
        let body = "";
        req.on('data', chunk => {
            body += chunk.toString(); // Convert Buffer to string
        });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                // Simple input validation
                if (data.word && typeof data.word === 'string' && data.definition && typeof data.definition === 'string') {
                    storage[data.word] = data.definition;
                    sendResponse(res, 200, "application/json", {message: `${data.word} added/updated successfully`});
                } else {
                    sendResponse(res, 400, "application/json", {error: "Invalid request. Ensure 'word' and 'definition' are properly formatted."});
                }
            } catch (e) {
                sendResponse(res, 400, "application/json", {error: "Could not parse JSON. Ensure your request is properly formatted."});
            }
        });
    } else {
        // Handle unsupported methods or endpoints
        console.log(req.method);
        sendResponse(res, 405, "application/json", {error: "Method Not Allowed or Bad Request"});
    }
});

const port = process.env.port || 8888;
server.listen(port, () => console.log(`Server listening on port ${port}`));
