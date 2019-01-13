/*
 * Server file responsible of starting the server (HTTP, HTTPS, ...).
 */

// Dependencies
const fs = require('fs');
const http = require('http');
const https = require('https');

const config = require('./config');
const httpUtils = require('./http-utils');

// Get the HTTPS server options.
const httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};

// All the server logic for both the http and https server
const unifiedServer = (req, res) => {

  httpUtils.parseRequest(req, (data) => {
    console.log('parsed');

    httpUtils.handleRequest(data, (statusCode, payload) => {
      // Use the status code returned from the handler, or set the default status code to 200
      statusCode = typeof (statusCode) == 'number' ? statusCode : 200;

      // Use the payload returned from the handler, or set the default payload to an empty object
      payload = typeof (payload) == 'object' ? payload : {};

      // Convert the payload to a string
      const payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
    });
  });
};

// Starts the server and executes the callback with the req and res parameters 
// when a request hit the server.
module.exports = () => {

  // Create the servers
  const httpServer = http.createServer(unifiedServer);
  const httpsServer = https.createServer(httpsServerOptions, unifiedServer);

  // Starts the servers
  httpServer.listen(config.httpPort, function () {
    console.log('The HTTP server is running on port ' + config.httpPort);
  });
  httpsServer.listen(config.httpsPort, function () {
    console.log('The HTTPS server is running on port ' + config.httpsPort);
  });
};

