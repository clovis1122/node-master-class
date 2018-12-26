'use strict';

/**
 * Contains the logic to handle and manage routes.
 * @module
 */
const router = {};

// Dependencies
router._server = require('../server');
router._routes = [];
router._console = require('console');

/**
 * Register a handler in the given path.
 * @param {string} path the path of the request.
 * @param {[]} routes the route handlers.
 */
router.registerHandler = function(path, routes) {
  for (const route of routes) {
    router._routes.push({
      ...route,
      path: path + (route.path || ''),
    });
  };
};

// PRIVATE METHOD: get the handler for a given path and method.
router._getRouteForPathAndMethod = function(path, method)  {
  return router
    ._routes
    .filter(route => route.path === path)
    .filter(route => route.method === method);
}

/**
 * Handles the incoming request.
 * @param {import('http').IncomingMessage} req the incoming request.
 * @param {import('http').ServerResponse} res the server response object.
 * @return {Promise<void>}
 */
router.handleRequest = async function(req, res) {
  const details = router._server.parseRequest(req);
  const [route] = router._getRouteForPathAndMethod(details.path, details.method);

  router._console.log('Incoming request: ', details);

  if (!route) {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(404);
    res.end('{"Error": "The route was not found."}');
    return;
  }

  const { statusCode, data } = await route.handler(details);

  router._console.log(statusCode, data, route);

  res.setHeader('Content-Type', 'application/json');
  res.writeHead(statusCode);
  res.end(JSON.stringify(data));
};

module.exports = router;
