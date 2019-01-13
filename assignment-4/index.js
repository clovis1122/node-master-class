'use strict';

/**
 * Entrypoint for the application.
 * @module
 */
const index = {};

// Dependencies
index._api = require('./api');
index._web = require('./web');
index._cli = require('./cli');
index._server = require('./lib/server');
index._router = require('./lib/router');

// Initializes the app components
index._api.initialize();
index._web.initialize();

// Initialize the CLI as the last resource.
setTimeout(index._cli.initialize, 50);

// Start the servers
index._server.startHttpAndHttpsServer(index._router.handleRequest);

module.exports = index;
