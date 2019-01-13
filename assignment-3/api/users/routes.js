'use strict';

/**
 * Initializes the different contexts that exists in the system.
 * @module
 */
const usersRoutes = {};

// Dependencies
usersRoutes._users = require('./index');
usersRoutes._auth = require('./auth');
usersRoutes._orders = require('./orders');
usersRoutes._shoppingCart = require('./shopping-cart');

/**
 * Defines the users-related routes.
 */
usersRoutes.routes = [
  {
    method: 'GET',
    handler: usersRoutes._users.get
  },
  {
    method: 'POST',
    handler: usersRoutes._users.create
  },
  {
    method: 'PUT',
    handler: usersRoutes._users.update
  },
  {
    method: 'DELETE',
    handler: usersRoutes._users.delete
  },
  {
    path: '/login',
    method: 'POST',
    handler: usersRoutes._auth.login
  },
  {
    path: '/logout',
    method: 'POST',
    handler: usersRoutes._auth.logout
  },
  {
    path: '/cart',
    method: 'GET',
    handler: usersRoutes._shoppingCart.get
  },
  {
    path: '/cart',
    method: 'POST',
    handler: usersRoutes._shoppingCart.add
  },
  {
    path: '/cart',
    method: 'DELETE',
    handler: usersRoutes._shoppingCart.delete
  },
  {
    path: '/orders',
    method: 'POST',
    handler: usersRoutes._orders.create
  },
  {
    path: '/orders',
    method: 'GET',
    handler: usersRoutes._orders.get
  },
];

module.exports = usersRoutes;
