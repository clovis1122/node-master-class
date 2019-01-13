/**
 * HTTP utilities.
 */

const url = require('url');
const router = require('./router');
const StringDecoder = require('string_decoder').StringDecoder;

// Given a request, parses the payload and call callback with the results.
exports.parsePayload = (req, callback) => {
  // Get the payload,if any
  const decoder = new StringDecoder('utf-8');
  let buffer = '';

  // On data, append it to the buffer.
  req.on('data', data => buffer += decoder.write(data));

  // When we reach the end close the buffer and call callback
  // with the result.
  req.on('end', () => {
    buffer += decoder.end();
    callback(buffer);
  });
}

// Given a request, parses the trimmedPath, queryStringObject, method, header and payload
// and calls callback with an object containing these parameters.
exports.parseRequest = (req, callback) => {
  // Parse the url
  const parsedUrl = url.parse(req.url, true);

  // Get the path
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  const queryStringObject = parsedUrl.query;

  // Get the HTTP method
  const method = req.method.toLowerCase();

  //Get the headers as an object
  const headers = req.headers;

  // Parses the payload and returns the parsing results.
  exports.parsePayload(req, (payload) => {
    callback({
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': payload
    });
  });
};


// Get the handler of a request and executes it, passing the status code and payload to callback.
exports.handleRequest = (data, callback) => {
  // Check the router for a matching path for a handler. If one is not found, use the notFound handler instead.
  const path = data.trimmedPath;
  const chosenHandler = typeof (router[path]) !== 'undefined' ? router[path] : router.notFound;
  chosenHandler(data, callback);
};
