'use strict';

/**
 * Entrypoint for the application.
 * @module
 */
const index = {};

// Dependencies
index._app = require('./app');
index._server = require('./lib/server');
index._router = require('./lib/router');

// Initializes the app components
index._app.initialize();

// Start the servers
index._server.startHttpAndHttpsServer(index._router.handleRequest);

module.exports = index;
