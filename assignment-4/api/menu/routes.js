'use strict';

/**
 * Defines the menu HTTP routes.
 * @module
 */
const menuRoutes = {};

// Dependencies
menuRoutes._menu = require('./index');

/**
 * Defines the routes related to the menu.
 */
menuRoutes.routes = [
  {
    method: 'GET',
    handler: menuRoutes._menu.get
  },
];

module.exports = menuRoutes;
