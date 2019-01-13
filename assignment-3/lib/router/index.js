'use strict';

/**
 * Contains the logic to handle and manage routes.
 * @module
 */
const router = {};

// Dependencies
router._server = require('../server');
router._routes = [];
router._staticAssetsHandler = null;
router._console = require('console');

router.registerSingleHandler = function(path, handler, method = 'GET') {
  router._routes.push({ path, method, handler });
};

router.registerStaticAssetHandler = function(handler) {
  router._staticAssetsHandler = { handler };
};

/**
 * Register a handler in the given path.
 * @param {string} path the path of the request.
 * @param {[]} routes the route handlers.
 */
router.registerHandler = function(path, routes) {
  for (const route of routes) {
    router._routes.push({
      handler: route.handler,
      method: route.method,
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
  
  try {
    const payload = await router._server.parsePayloadAsync(req); 
    details.payload = JSON.parse(payload) || {};
  } catch(e) {
    details.payload = {};
  }

  if (!details.path) {
    details.path = '/home';
  }

  const isStaticAssetRegex = /\.[a-z]+$/;
  let route = null;

  console.log(details.path, details.path.match(isStaticAssetRegex));

  console.log(details.path);

  if (details.path.match(isStaticAssetRegex)) {
    route = router._staticAssetsHandler;
  } else {
    let [routeHandler] = router._getRouteForPathAndMethod(details.path, details.method);
    route = routeHandler;
  }

  // router._console.log('Incoming request: ', route, details);

  if (!route) {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(404);
    res.end('{"Error": "The route was not found."}');
    return;
  }

  const { statusCode, data, contentType = 'application/json' } = await route.handler(details);

  router._console.log(statusCode, details.path);

  res.setHeader('Content-Type', contentType);
  res.writeHead(statusCode);
  if (contentType === 'application/json') {
    res.end(JSON.stringify(data));
    return;
  }

  res.end(data);
};

module.exports = router;
