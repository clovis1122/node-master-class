'use strict';

/**
 * Initializes the different modules that exists in the API.
 * @module
 */
const api = {};

// Dependencies
api._router = require('../lib/router');
api._menuRoutes = require('./menu/routes');
api._usersRoutes = require('./users/routes');

/**
 * Initializes the API by registering all the routes with their handler.
 */
api.initialize = function()  {
  api._router.registerHandler('/api/menu', api._menuRoutes.routes);
  api._router.registerHandler('/api/users', api._usersRoutes.routes);
};

module.exports = api;
