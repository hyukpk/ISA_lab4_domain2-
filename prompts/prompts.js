// word and definition not supplied 
// word not supplied
// def and not supplied 

// word and def not formatted 
//couldn't parse json 

// word not found in dictionary 

module.exports = {
    wordNotFoundInDictionary: (request, word) => `Request: ${request + 1}  : ${word} was not found in dictionary!`,
    wordAlreadyExists: word => `'${word}' already exists in this dictionary`,
    wordAddedToDictionary: (requestCount, word, definition, wordCount) => ({
        message: `Request # ${requestCount} - New entry recorded:`,
        entry: { word, definition },
        words: `Amount of entries ${wordCount}`
      }),
    wordAndDefinitionError: 'Invalid request, ensure word and dictionary are formatted correctly',
    couldNotParseJson: 'Could not parse JSON. Ensure your request is properly formatted.',
    BadRequest: 'Method Not Allowed or Bad Request',
    ServerListening : port => `Server listening on port ${port}`
}