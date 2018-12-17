/*
 * Server file responsible of starting the server (HTTP, HTTPS, ...).
 */

// Dependencies
const http = require('http');
const https = require('https');
const config = require('./config');
const fs = require('fs');

// Get the HTTPS server options.
const httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
};

// Starts the server and executes the callback with the req and res parameters 
// when a request hit the server.
module.exports = (callback) => {

  // Create the servers
  const httpServer = http.createServer(callback);
  const httpsServer = https.createServer(httpsServerOptions, callback);

  // Starts the servers
  httpServer.listen(config.httpPort, function () {
    console.log('The HTTP server is running on port ' + config.httpPort);
  });
  httpsServer.listen(config.httpsPort, function () {
    console.log('The HTTPS server is running on port ' + config.httpsPort);
  });
};

