'use strict';

/**
 * Entrypoint for the application.
 * @module
 */
const index = {};

// Dependencies
index._api = require('./api');
index._web = require('./web');
index._server = require('./lib/server');
index._router = require('./lib/router');

// Initializes the app components
index._api.initialize();
index._web.initialize();

// Start the servers
index._server.startHttpAndHttpsServer(index._router.handleRequest);

module.exports = index;
