'use strict';

/**
 * Initializes the different modules that exists in the app.
 * @module
 */
const app = {};

// Dependencies
app._router = require('../lib/router');
app._menuRoutes = require('./menu/routes');
app._usersRoutes = require('./users/routes');

/**
 * Initializes the application by registering all the routes with their handler.
 */
app.initialize = function()  {
  app._router.registerHandler('/menu', app._menuRoutes.routes);
  app._router.registerHandler('/users', app._usersRoutes.routes);
};

module.exports = app;
