'use strict';

/**
 * Contains the functions required to start the HTTP & HTTPS server.
 * @module
 */
const server = {};

// Dependencies
server._fs = require('fs');
server._url = require('url');
server._util = require('util');
server._http = require('http');
server._https = require('https');
server._console = require('console');
server._StringDecoder = require('string_decoder').StringDecoder;

server._config = require('../../config');

server._readFileAsync = server._util.promisify(server._fs.readFile);

/**
 * Start the HTTP server. Callback will be executed everytime thatt here's
 * a new request.
 * @param {function} callback - the callback to execute.
 */
server.startHttpServer = function(callback) {
  const httpServer = server._http.createServer(callback);
  httpServer.listen(server._config.httpPort, function () {
    server._console.log('The HTTP server is running on port ' + server._config.httpPort);
  });
};

/**
 * Start the HTTPS server. Callback will be executed everytime thatt here's
 * a new request.
 * @param {function} callback - the callback to execute.
 */
server.startHttpsServer = async function(callback) {
  const [key, cert]  = await Promise.all([
    server._readFileAsync(__dirname+'/https/key.pem'),
    server._readFileAsync(__dirname+'/https/cert.pem')
  ]);

  const httpsServer = server._https.createServer({ key, cert }, callback);

  httpsServer.listen(server._config.httpsPort, function () {
    server._console.log('The HTTPS server is running on port ' + server._config.httpsPort);
  });
};

/**
 * Start BOTH the HTTP and the HTTPS server. Callback will be executed everytime that there's
 * a new request.
 * @param {function} callback - the callback to execute.
 */
server.startHttpAndHttpsServer = function(callback) {
  server.startHttpServer(callback);
  server.startHttpsServer(callback);
};

/**
 * Given a request, parses it's parameters and returns some details about it.
 * @param {IncomingMessage} req - the server request that was made.
 * @return {{}} details - the parsed request details.
 */
server.parseRequest = function(req) {
  const parsedUrl = server._url.parse(req.url, true);
  const path = parsedUrl.pathname.replace(/\/+$/, '');
  const queryStringObject = parsedUrl.query;
  const method = req.method.toUpperCase();
  const headers = req.headers;

  return { parsedUrl, path, queryStringObject, method, headers };
};

/**
 * Given a request, parses and returns the payload.
 * @param {IncomingMessage} req - the server request that was made.
 * @return {string} payload - the parsed payload.
 */
server.parsePayloadAsync = function(req) {
  return new Promise(function(resolve, reject) {
    const decoder = new server._StringDecoder('utf-8');
    let buffer = '';

    req.on('error', reject);
    req.on('data', data => buffer += decoder.write(data));
    req.on('end', () => {
      buffer += decoder.end();
      resolve(buffer);
    });

  });
};

module.exports = server;
