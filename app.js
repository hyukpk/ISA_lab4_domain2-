const http = require('http'); 
const url = require('url');

const GET = "GET";
const POST = "POST";
const endPointRoot = "/api/definitions";
const storage = {}; //using object for storage
http.createServer(function (req, res) {
    res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST",
        "Access-Control-Allow-Headers": "Content-Type"
    });
    console.log(req.headers);

    function sendResponse( res, statusCode, contentType, body) {
        res.writeHead(statusCode, {"Content-Type": contentType});
        res.end(JSON.stringify(body));
    }

    if (req.method === GET) { //if user is trying to find a definition, parse through the storage and see if word exists, if true, return definiton, if not, send other message
        const q = url.parse(req.url, true);
        const word = q.query.word;
        if(word && storage[word]) {
            sendResponse(res, 200, "application/json", {word: word, definition: storage[word]});
        } else {
            sendResponse(res, 404, "application/json", {error: "Word not found in dictionary"});
        }
        return;
    }

    if (req.method === POST && req.url === endPointRoot + '') { // is user is trying to add a definition to a word, find if word already exists, if it does, append the additonal message to it( or replace), and then give a confirming response
        let body = "";
        req.on('data', function (chunk) {
            if (chunk != null) {
                body += chunk;
            }
        });
        req.on('end', function () {
            try {
                const data = JSON.parse(body);
                if (data.word && data.definition) {
                    storage[data.word] = data.definition;
                    sendResponse(res, 200, "application/json", {message: data.word + " added/updated successfully"});
                } else {
                    sendResponse(res, 400, "application/json", {error: "Invalid request"});
                }
            } catch (e) {
                sendResponse(res, 400, "application/json", {error: "Could not parse JSON"});
            }
        });
    }
}).listen(8888);