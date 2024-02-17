const http = require("http");
const url = require("url");
const {
    wordAlreadyExists,
    wordNotFoundInDictionary,
    wordAddedToDictionary,
    wordAndDefinitionError,
    couldNotParseJson,
    BadRequest,
    ServerListening,
} = require("./prompts/prompts");
//Used gpt to learn how to store user facing strings in a separate file and use them

let requestCount = 0;
let dictionary = {}; 
// Used GPT to clarify suitable data structure for storing word/definition pairs
// In this case, I decided to define it as a Javascript object due to it's support 
// for JSON (which is what is being sent from the request in store.html)
//

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);

    // Basic CORS configuration for all responses
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Placeholder for implementing rate limiting
    // RateLimiter(req, res);

    if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
    }

    function sendResponse(res, statusCode, contentType, body) {
        res.writeHead(statusCode, { "Content-Type": contentType });
        res.end(JSON.stringify(body));
    }

    //GET means that the user is looking for the definition to a word
    if (req.method === "GET" && parsedUrl.pathname === "/api/definitions") {
        const queryObject = parsedUrl.query;
        const word = queryObject.word; // Assuming the query parameter is named 'word'
        if (word && dictionary.hasOwnProperty(word)) {
            // Also, using hasOwnProperty for a safer check (GPT)
            sendResponse(res, 200, "application/json", {
                word: word,
                definition: dictionary[word],
            });
        } else {
            sendResponse(res, 404, "application/json", { //used GPT to understand error codes/when to apply them for specific errors
                error: wordNotFoundInDictionary(requestCount, word),
            });
        }

        // POST is when a user is trying to add a word and definition to the dictionary
    } else if (
        req.method === "POST" &&
        parsedUrl.pathname === "/api/definitions"
    ) {
        // Used GPT to understand what was happening in lines 65-69 
        let body = "";
        req.on("data", (chunk) => {
            body += chunk.toString(); // Convert Buffer to string
        });
        req.on("end", () => {
            try {
                const data = JSON.parse(body);
                // Simple input validation
                if (
                    data.word &&
                    typeof data.word === "string" &&
                    data.definition &&
                    typeof data.definition === "string"
                ) {
                    if (data.word in dictionary) {
                        // means the word was already defined, should throw an error
                        sendResponse(res, 409, "application/json", {
                            error: wordAlreadyExists(data.word),
                        });
                        return;
                    }
                    dictionary[data.word] = data.definition;
                    requestCount++;
                    dictionary_word_count = Object.keys(dictionary).length;
                    sendResponse(res, 200, "application/json", {
                        message: wordAddedToDictionary(
                            requestCount,
                            data.word,
                            data.definition,
                            dictionary_word_count
                        ),
                    });
                } else {
                    sendResponse(res, 400, "application/json", {
                        error: wordAndDefinitionError,
                    });
                }
            } catch (e) {
                sendResponse(res, 400, "application/json", {
                    error: couldNotParseJson,
                });
            }
        });
    } else {
        // Handle unsupported methods or endpoints
        sendResponse(res, 405, "application/json", { error: BadRequest });
    }
});

const port = process.env.port || 8888;
server.listen(port, () => console.log(`ServerListening(${port})`));
